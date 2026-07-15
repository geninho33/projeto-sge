import { getSqlite } from "../db-sqlite.js";
import { useSqlite, query, queryOne } from "../db.js";
import { enrichDemanda } from "./demandaFlow.js";
import { syncDemandaFaseFromAtividades } from "./demandaProgressao.js";

const PRIORIDADE_MAP = {
  P1: "alta",
  P2: "media",
  P3: "baixa",
  alta: "alta",
  media: "media",
  baixa: "baixa",
};

export function mapPrioridadeBacklog(prioridade) {
  if (!prioridade) return "media";
  return PRIORIDADE_MAP[prioridade] || PRIORIDADE_MAP[String(prioridade).toUpperCase()] || "media";
}

export async function listBacklogDisponiveis({ q, limit = 50 } = {}) {
  const lim = Math.min(100, Math.max(10, Number(limit) || 50));
  const params = [];
  let where = `
    WHERE b.status_geral NOT IN ('concluido')
      AND NOT EXISTS (
        SELECT 1 FROM sge_pm_demanda d
        WHERE d.backlog_item_id = b.id AND d.deleted_at IS NULL
      )
  `;
  if (q?.trim()) {
    where += ` AND (b.codigo LIKE ? OR b.titulo LIKE ? OR b.descricao LIKE ? OR b.modulo LIKE ?)`;
    const t = `%${q.trim()}%`;
    params.push(t, t, t, t);
  }
  return query(
    `SELECT b.id, b.codigo, b.titulo, b.descricao, b.prioridade, b.status_geral, b.kanban_status,
            b.projeto_id, b.prazo, b.observacoes, b.modulo, b.story_points,
            p.nome AS projeto_nome, p.codigo AS projeto_codigo
     FROM sge_pm_backlog_item b
     LEFT JOIN sge_pm_projeto p ON p.id = COALESCE(b.projeto_id, 1)
     ${where}
     ORDER BY b.prioridade ASC, b.codigo ASC
     LIMIT ${lim}`,
    params
  );
}

function fail(message, code = "VALIDATION_ERROR") {
  throw Object.assign(new Error(message), { code });
}

function nextCodigoSync(s) {
  const row = s.prepare(`SELECT MAX(id) AS m FROM sge_pm_demanda`).get();
  return `DEM-${String((row?.m ?? 0) + 1).padStart(4, "0")}`;
}

function defaultTipoAtividadeId(s) {
  const tipo =
    s.prepare(`SELECT id FROM sge_pm_tipo_atividade WHERE codigo = 'TA-DEV' AND ativo = 1`).get()
    || s.prepare(`SELECT id FROM sge_pm_tipo_atividade WHERE lower(nome) LIKE '%desenvolv%' AND ativo = 1 ORDER BY id LIMIT 1`).get()
    || s.prepare(`SELECT id FROM sge_pm_tipo_atividade WHERE ativo = 1 ORDER BY id LIMIT 1`).get();
  return tipo?.id ?? null;
}

/**
 * Cria Demanda + Atividade + Tarefa a partir de um backlog, em uma única transação.
 */
export async function gerarDemandaFromBacklog(input, user) {
  const backlogItemId = Number(input.backlog_item_id);
  const executorId = Number(input.executor_id);
  const descricao = (input.descricao ?? input.descricao_detalhada ?? "").trim();
  const dataEntrega = input.data_prevista_termino || input.data_entrega || null;
  const observacoes = input.observacoes ?? input.observacoes_demanda ?? null;
  const prioridade = mapPrioridadeBacklog(input.prioridade);

  if (!backlogItemId) fail("Selecione um item do backlog");
  if (!executorId) fail("Selecione o executor");
  if (!descricao) fail("Informe a descrição da demanda");
  if (!dataEntrega) fail("Informe a data de entrega");

  if (!useSqlite()) {
    fail("Geração a partir do backlog disponível apenas com SQLite neste ambiente", "NOT_SUPPORTED");
  }

  const s = getSqlite();
  const tx = s.transaction(() => {
    const backlog = s.prepare(`SELECT * FROM sge_pm_backlog_item WHERE id = ?`).get(backlogItemId);
    if (!backlog) fail("Item de backlog não encontrado", "NOT_FOUND");

    const existente = s.prepare(
      `SELECT id, codigo FROM sge_pm_demanda WHERE backlog_item_id = ? AND deleted_at IS NULL`
    ).get(backlogItemId);
    if (existente) {
      fail(`Este backlog já gerou a demanda ${existente.codigo}. Não é permitido gerar novamente.`, "ALREADY_EXISTS");
    }

    const projetoId = Number(input.projeto_id || backlog.projeto_id || 1);
    const projeto = s.prepare(`SELECT id FROM sge_pm_projeto WHERE id = ?`).get(projetoId);
    if (!projeto) fail("Projeto inválido");

    const executor = s.prepare(
      `SELECT id FROM sge_pm_usuario WHERE id = ? AND ativo = 1 AND deleted_at IS NULL`
    ).get(executorId);
    if (!executor) fail("Executor inválido ou inativo");

    const tipoId = Number(input.tipo_atividade_id) || defaultTipoAtividadeId(s);
    if (!tipoId) fail("Nenhum tipo de atividade cadastrado. Cadastre um tipo antes de gerar a demanda.");

    const codigo = nextCodigoSync(s);
    const titulo = (input.titulo || backlog.titulo || "").trim();
    if (!titulo) fail("Título da demanda é obrigatório");

    const demIns = s.prepare(
      `INSERT INTO sge_pm_demanda (
         codigo, titulo, descricao, descricao_detalhada, backlog_item_id, projeto_id, sprint_id,
         responsavel_id, solicitante_id, fase, data_prevista_termino, prazo, observacoes_demanda,
         prioridade, situacao_trabalho, percentual_execucao, horas_estimadas
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      codigo,
      titulo,
      descricao,
      descricao,
      backlogItemId,
      projetoId,
      backlog.sprint_id ?? null,
      executorId,
      user.id,
      "desenvolvimento",
      dataEntrega,
      dataEntrega,
      observacoes,
      prioridade,
      "nao_iniciada",
      0,
      backlog.estimativa ?? backlog.story_points ?? 0
    );
    const demandaId = demIns.lastInsertRowid;

    const atvIns = s.prepare(
      `INSERT INTO sge_pm_atividade (
         demanda_id, tipo_atividade_id, titulo, descricao, executor_id, fase, status,
         percentual_execucao, data_prevista_termino, observacoes
       ) VALUES (?,?,?,?,?,?, 'aguardando', 0, ?, ?)`
    ).run(
      demandaId,
      tipoId,
      titulo,
      descricao,
      executorId,
      "desenvolvimento",
      dataEntrega,
      observacoes
    );
    const atividadeId = atvIns.lastInsertRowid;

    s.prepare(
      `INSERT OR IGNORE INTO sge_pm_atividade_backlog (atividade_id, backlog_item_id) VALUES (?, ?)`
    ).run(atividadeId, backlogItemId);

    const tarIns = s.prepare(
      `INSERT INTO sge_pm_atividade_tarefa (
         atividade_id, titulo, ordem, status, descricao, executor_id, tipo_atividade_id, data_prevista_termino
       ) VALUES (?, ?, 1, 'aguardando', ?, ?, ?, ?)`
    ).run(atividadeId, titulo, descricao, executorId, tipoId, dataEntrega);
    const tarefaId = tarIns.lastInsertRowid;

    s.prepare(
      `INSERT OR IGNORE INTO sge_pm_tarefa_backlog (tarefa_id, backlog_item_id) VALUES (?, ?)`
    ).run(tarefaId, backlogItemId);

    s.prepare(
      `UPDATE sge_pm_backlog_item
       SET status_geral = 'em_andamento',
           kanban_status = 'em_desenvolvimento',
           responsavel_id = COALESCE(responsavel_id, ?),
           updated_at = datetime('now')
       WHERE id = ?`
    ).run(executorId, backlogItemId);

    const detalhes = JSON.stringify({
      backlog_item_id: backlogItemId,
      backlog_codigo: backlog.codigo,
      atividade_id: atividadeId,
      tarefa_id: tarefaId,
      executor_id: executorId,
      gerado_por: user.id,
      gerado_em: new Date().toISOString(),
    });

    s.prepare(
      `INSERT INTO sge_pm_historico (entidade, entidade_id, usuario_id, acao, detalhes) VALUES (?, ?, ?, ?, ?)`
    ).run("demanda", String(demandaId), user.id, "gerada_do_backlog", detalhes);

    s.prepare(
      `INSERT INTO sge_pm_historico (entidade, entidade_id, usuario_id, acao, detalhes) VALUES (?, ?, ?, ?, ?)`
    ).run("backlog", String(backlogItemId), user.id, "demanda_gerada", detalhes);

    return { demandaId, atividadeId, tarefaId, codigo, backlogCodigo: backlog.codigo };
  });

  const result = tx();
  await syncDemandaFaseFromAtividades(result.demandaId);

  const demanda = await queryOne(
    `SELECT d.*, b.codigo AS backlog_codigo, b.titulo AS backlog_titulo,
            p.nome AS projeto_nome, sol.nome AS solicitante_nome, u.nome AS responsavel_nome
     FROM sge_pm_demanda d
     LEFT JOIN sge_pm_backlog_item b ON b.id = d.backlog_item_id
     LEFT JOIN sge_pm_projeto p ON p.id = d.projeto_id
     LEFT JOIN sge_pm_usuario sol ON sol.id = d.solicitante_id
     LEFT JOIN sge_pm_usuario u ON u.id = d.responsavel_id
     WHERE d.id = ?`,
    [result.demandaId]
  );

  return {
    demanda: await enrichDemanda(demanda),
    atividade_id: result.atividadeId,
    tarefa_id: result.tarefaId,
    backlog_codigo: result.backlogCodigo,
  };
}
