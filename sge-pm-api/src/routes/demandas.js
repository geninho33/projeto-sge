import { Router } from "express";
import { query, queryOne } from "../db.js";
import { logHistorico, getHistorico } from "../services/historico.js";
import { notifyGestor } from "../services/notificationService.js";
import { SITUACOES_TRABALHO } from "../services/schemaV3.js";
import { requireMenuPermission } from "../middleware/auth.js";
import { isManagerUser } from "../services/profileService.js";
import { P } from "../services/menuPermissions.js";
import { enrichDemanda, validateFase } from "../services/demandaFlow.js";

const router = Router();

const HORAS_SUBQUERY = `COALESCE((
  SELECT SUM(a.duracao_minutos) FROM sge_pm_apontamento a WHERE a.demanda_id = d.id
), 0) / 60.0`;

const SELECT = `
  SELECT d.*,
         ${HORAS_SUBQUERY} AS horas_apontadas,
         b.codigo AS backlog_codigo, b.titulo AS backlog_titulo,
         u.nome AS responsavel_nome, r.nome AS revisor_nome, h.nome AS homologador_nome,
         s.nome AS sprint_nome, p.nome AS projeto_nome,
         sol.nome AS solicitante_nome
  FROM sge_pm_demanda d
  LEFT JOIN sge_pm_backlog_item b ON b.id = d.backlog_item_id
  LEFT JOIN sge_pm_usuario u ON u.id = d.responsavel_id
  LEFT JOIN sge_pm_usuario r ON r.id = d.revisor_id
  LEFT JOIN sge_pm_usuario h ON h.id = d.homologador_id
  LEFT JOIN sge_pm_usuario sol ON sol.id = d.solicitante_id
  LEFT JOIN sge_pm_sprint s ON s.id = d.sprint_id
  LEFT JOIN sge_pm_projeto p ON p.id = d.projeto_id
`;

async function nextCodigo() {
  const row = await queryOne(`SELECT MAX(id) AS m FROM sge_pm_demanda`);
  return `DEM-${String((row?.m ?? 0) + 1).padStart(4, "0")}`;
}

router.get("/minhas", requireMenuPermission("demandas", P.VIEW), async (req, res, next) => {
  try {
    const rows = await query(
      `${SELECT} WHERE d.responsavel_id = ? ORDER BY
         CASE d.situacao_trabalho
           WHEN 'em_andamento' THEN 1
           WHEN 'bloqueada' THEN 2
           WHEN 'aguardando_revisao' THEN 3
           WHEN 'nao_iniciada' THEN 4
           ELSE 5
         END, d.prazo ASC`,
      [req.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireMenuPermission("demandas", P.VIEW), async (req, res, next) => {
  try {
    const { q, sprint_id, responsavel_id, situacao, situacao_trabalho } = req.query;
    const where = ["1=1"];
    const params = [];
    if (q) {
      where.push("(d.titulo LIKE ? OR d.codigo LIKE ? OR d.branch_nome LIKE ? OR b.codigo LIKE ?)");
      const t = `%${q}%`;
      params.push(t, t, t, t);
    }
    if (sprint_id) { where.push("d.sprint_id = ?"); params.push(sprint_id); }
    if (responsavel_id) { where.push("d.responsavel_id = ?"); params.push(responsavel_id); }
    if (situacao) { where.push("d.situacao = ?"); params.push(situacao); }
    if (situacao_trabalho) { where.push("d.situacao_trabalho = ?"); params.push(situacao_trabalho); }
    if (req.query.fase) { where.push("d.fase = ?"); params.push(req.query.fase); }
    where.push("d.deleted_at IS NULL");
    const rows = await query(`${SELECT} WHERE ${where.join(" AND ")} ORDER BY d.updated_at DESC`, params);

    for (const d of rows) {
      const atividadesCount = await queryOne(`SELECT COUNT(*) AS c FROM sge_pm_atividade WHERE demanda_id = ?`, [d.id]);
      d.total_atividades = atividadesCount?.c || 0;

      const tarefasCount = await queryOne(
        `SELECT COUNT(*) AS c FROM sge_pm_atividade_tarefa t JOIN sge_pm_atividade a ON a.id = t.atividade_id WHERE a.demanda_id = ?`,
        [d.id]
      );
      d.total_tarefas = tarefasCount?.c || 0;

      const comentariosCount = await queryOne(
        `SELECT COUNT(*) AS c FROM sge_pm_comentario WHERE entidade_tipo = 'demanda' AND entidade_id = ?`,
        [d.id]
      );
      d.total_comentarios = comentariosCount?.c || 0;

      const executores = await query(
        `SELECT DISTINCT u.id, u.nome, u.avatar_url FROM sge_pm_usuario u
         JOIN sge_pm_atividade a ON a.executor_id = u.id
         WHERE a.demanda_id = ?`,
        [d.id]
      );
      d.executores = executores;

      const solicitante = await queryOne(
        `SELECT id, nome, avatar_url FROM sge_pm_usuario WHERE id = ?`,
        [d.solicitante_id]
      );
      d.solicitante_avatar = solicitante?.avatar_url || null;

      const responsavel = await queryOne(
        `SELECT id, nome, avatar_url FROM sge_pm_usuario WHERE id = ?`,
        [d.responsavel_id]
      );
      d.responsavel_avatar = responsavel?.avatar_url || null;
    }

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/historico", requireMenuPermission("demandas", P.VIEW), async (req, res, next) => {
  try {
    const rows = await getHistorico("demanda", req.params.id);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/apontamentos", requireMenuPermission("demandas", P.VIEW), async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT a.*, u.nome AS usuario_nome FROM sge_pm_apontamento a
       JOIN sge_pm_usuario u ON u.id = a.usuario_id
       WHERE a.demanda_id = ? ORDER BY a.data DESC, a.hora_inicio DESC`,
      [req.params.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/completo", requireMenuPermission("demandas", P.VIEW), async (req, res, next) => {
  try {
    const row = await queryOne(`${SELECT} WHERE d.id = ?`, [req.params.id]);
    if (!row) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    res.json({ data: await enrichDemanda(row) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireMenuPermission("demandas", P.VIEW), async (req, res, next) => {
  try {
    const row = await queryOne(`${SELECT} WHERE d.id = ?`, [req.params.id]);
    if (!row) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Demanda não encontrada" } });
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/andamento", requireMenuPermission("demandas", P.UPDATE), async (req, res, next) => {
  try {
    const demanda = await queryOne(`SELECT * FROM sge_pm_demanda WHERE id = ?`, [req.params.id]);
    if (!demanda) return res.status(404).json({ error: { code: "NOT_FOUND" } });

    const isOwner = demanda.responsavel_id === req.user.id;
    const isManager = isManagerUser(req.user);
    if (!isOwner && !isManager) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    const b = req.body || {};
    const fields = [
      "situacao_trabalho", "percentual_execucao", "comentarios_tecnicos",
      "impedimentos", "proximos_passos", "prazo",
    ];
    const sets = ["updated_at = datetime('now')"];
    const params = [];

    if (b.situacao_trabalho && !SITUACOES_TRABALHO.includes(b.situacao_trabalho)) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Situação inválida" } });
    }

    for (const f of fields) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
    }
    params.push(req.params.id);
    await query(`UPDATE sge_pm_demanda SET ${sets.join(", ")} WHERE id = ?`, params);
    await logHistorico("demanda", req.params.id, req.user.id, "andamento_atualizado", b);

    if (b.situacao_trabalho || b.percentual_execucao !== undefined) {
      await notifyGestor(
        req.params.id,
        "Demanda atualizada",
        `${demanda.codigo || demanda.titulo}: status ou progresso alterado por ${req.user.nome}`
      );
    }

    const updated = await queryOne(`${SELECT} WHERE d.id = ?`, [req.params.id]);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireMenuPermission("demandas", P.CREATE), async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.titulo?.trim()) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Título obrigatório" } });
    }
    if (!b.projeto_id) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Projeto obrigatório" } });
    }
    const fase = b.fase || "criacao";
    if (!validateFase(fase)) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Fase inválida" } });
    }

    const isManager = isManagerUser(req.user);
    const solicitanteId = isManager && b.solicitante_id ? b.solicitante_id : req.user.id;

    const codigo = b.codigo || (await nextCodigo());
    await query(
      `INSERT INTO sge_pm_demanda (
         codigo, titulo, descricao, descricao_detalhada, backlog_item_id, projeto_id, sprint_id,
         responsavel_id, solicitante_id, fase, data_prevista_termino, observacoes_demanda,
         prioridade, situacao_trabalho, percentual_execucao, horas_estimadas
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        codigo, b.titulo.trim(), b.descricao ?? null, b.descricao_detalhada ?? b.descricao ?? null,
        b.backlog_item_id ?? null, b.projeto_id, b.sprint_id ?? null,
        b.responsavel_id ?? req.user.id, solicitanteId, fase,
        b.data_prevista_termino ?? b.prazo ?? null, b.observacoes_demanda ?? b.observacoes ?? null,
        b.prioridade ?? "media", b.situacao_trabalho ?? "nao_iniciada",
        b.percentual_execucao ?? 0, b.horas_estimadas ?? 0,
      ]
    );
    const created = await queryOne(`${SELECT} ORDER BY d.id DESC LIMIT 1`);

    if (b.links?.length) {
      for (const link of b.links) {
        if (link.titulo && link.url) {
          await query(`INSERT INTO sge_pm_demanda_link (demanda_id, titulo, url) VALUES (?, ?, ?)`, [
            created.id, link.titulo, link.url,
          ]);
        }
      }
    }

    await logHistorico("demanda", created.id, req.user.id, "criada", b);
    res.status(201).json({ data: await enrichDemanda(created) });
  } catch (err) {
    next(err);
  }
});

router.post("/legado", requireMenuPermission("demandas_legado", P.CREATE), async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.titulo?.trim()) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Título obrigatório" } });
    }
    const codigo = b.codigo || (await nextCodigo());
    await query(
      `INSERT INTO sge_pm_demanda (
         codigo, titulo, descricao, backlog_item_id, projeto_id, sprint_id, responsavel_id, revisor_id, homologador_id,
         branch_nome, branch_tipo, branch_status, repositorio, prazo, data_inicio, data_prevista_conclusao,
         prioridade, situacao, situacao_trabalho, percentual_execucao, horas_estimadas,
         ambiente, observacoes, pr_url
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        codigo, b.titulo.trim(), b.descricao ?? null, b.backlog_item_id ?? null, b.projeto_id ?? 1, b.sprint_id ?? null,
        b.responsavel_id ?? null, b.revisor_id ?? null, b.homologador_id ?? null,
        b.branch_nome ?? null, b.branch_tipo ?? "feature", b.branch_status ?? "aberta",
        b.repositorio ?? "projeto-sge", b.prazo ?? null, b.data_inicio ?? null, b.data_prevista_conclusao ?? null,
        b.prioridade ?? "media", b.situacao ?? "a_fazer", b.situacao_trabalho ?? "nao_iniciada",
        b.percentual_execucao ?? 0, b.horas_estimadas ?? 0,
        b.ambiente ?? "desenvolvimento", b.observacoes ?? null, b.pr_url ?? null,
      ]
    );
    const created = await queryOne(`${SELECT} ORDER BY d.id DESC LIMIT 1`);
    await logHistorico("demanda", created.id, req.user.id, "criada", b);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/flow", requireMenuPermission("demandas", P.APPROVE), async (req, res, next) => {
  try {
    const demanda = await queryOne(`SELECT * FROM sge_pm_demanda WHERE id = ?`, [req.params.id]);
    if (!demanda) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Demanda não encontrada" } });

    const isOwner = demanda.solicitante_id === req.user.id || demanda.responsavel_id === req.user.id;
    const isManager = isManagerUser(req.user);
    if (!isOwner && !isManager) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Sem permissão para editar esta demanda" } });
    }

    const b = req.body || {};
    if (b.fase && !validateFase(b.fase)) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Fase inválida" } });
    }

    const fields = [
      "titulo", "descricao", "descricao_detalhada", "projeto_id", "sprint_id",
      "solicitante_id", "responsavel_id", "fase", "data_prevista_termino",
      "observacoes_demanda", "prioridade", "prazo",
    ];
    const sets = ["updated_at = datetime('now')"];
    const params = [];
    for (const f of fields) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
    }
    if (sets.length === 1) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Nada para atualizar" } });
    }
    params.push(req.params.id);
    await query(`UPDATE sge_pm_demanda SET ${sets.join(", ")} WHERE id = ?`, params);

    if (b.links) {
      await query(`DELETE FROM sge_pm_demanda_link WHERE demanda_id = ?`, [req.params.id]);
      for (const link of b.links) {
        if (link.titulo && link.url) {
          await query(`INSERT INTO sge_pm_demanda_link (demanda_id, titulo, url) VALUES (?, ?, ?)`, [
            req.params.id, link.titulo, link.url,
          ]);
        }
      }
    }

    await logHistorico("demanda", req.params.id, req.user.id, "atualizada", b);
    const updated = await queryOne(`${SELECT} WHERE d.id = ?`, [req.params.id]);
    res.json({ data: await enrichDemanda(updated) });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireMenuPermission("demandas", P.UPDATE), async (req, res, next) => {
  try {
    const b = req.body || {};
    const fields = [
      "titulo", "descricao", "descricao_detalhada", "backlog_item_id", "projeto_id", "sprint_id",
      "responsavel_id", "solicitante_id", "revisor_id", "homologador_id", "fase", "data_prevista_termino",
      "observacoes_demanda", "branch_nome", "branch_tipo", "branch_status", "repositorio", "prazo",
      "data_inicio", "data_prevista_conclusao", "prioridade", "situacao", "situacao_trabalho",
      "percentual_execucao", "horas_estimadas", "ambiente", "observacoes", "pr_url", "branch_merge_em",
    ];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
    }
    if (!sets.length) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Nada para atualizar" } });
    sets.push("updated_at = datetime('now')");
    params.push(req.params.id);
    await query(`UPDATE sge_pm_demanda SET ${sets.join(", ")} WHERE id = ?`, params);
    await logHistorico("demanda", req.params.id, req.user.id, "atualizada", b);
    const updated = await queryOne(`${SELECT} WHERE d.id = ?`, [req.params.id]);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireMenuPermission("demandas", P.DELETE), async (req, res, next) => {
  try {
    await query(`DELETE FROM sge_pm_demanda WHERE id = ?`, [req.params.id]);
    await logHistorico("demanda", req.params.id, req.user.id, "excluida");
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
