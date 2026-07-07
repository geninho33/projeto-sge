import { Router } from "express";
import { query, queryOne } from "../db.js";
import { logHistorico } from "../services/historico.js";
import { validateFase } from "../services/demandaFlow.js";
import { getTarefas, recalcAtividadeStatus } from "../services/atividadeStatus.js";
import {
  getTarefaEnriched,
  tryConcluirTarefa,
  STATUS_TAREFA,
} from "../services/tarefaStatus.js";
import {
  createApontamentoTarefa,
  getTimerTarefa,
  startTimerTarefa,
  pauseTimerTarefa,
  resumeTimerTarefa,
  stopTimerTarefa,
} from "../services/timerTarefaService.js";
import { syncDemandaFaseFromAtividades } from "../services/demandaProgressao.js";

const FORBIDDEN_TAREFA_MSG = "Apenas o executor da atividade pode cadastrar e gerenciar tarefas.";

async function assertAtividadeExecutor(atividadeId, userId) {
  const atividade = await queryOne(`SELECT id, executor_id, demanda_id FROM sge_pm_atividade WHERE id = ?`, [atividadeId]);
  if (!atividade) {
    return { ok: false, status: 404, error: { code: "NOT_FOUND", message: "Atividade não encontrada" } };
  }
  if (String(atividade.executor_id) !== String(userId)) {
    return { ok: false, status: 403, error: { code: "FORBIDDEN", message: FORBIDDEN_TAREFA_MSG } };
  }
  return { ok: true, atividade };
}

function deny(res, result) {
  return res.status(result.status).json({ error: result.error });
}

const router = Router();

const SELECT = `
  SELECT a.*, t.nome AS tipo_nome, t.cor AS tipo_cor, t.icone AS tipo_icone,
         u.nome AS usuario_executor_nome, d.codigo AS demanda_codigo, d.titulo AS demanda_titulo,
         d.fase AS demanda_fase, d.projeto_id, p.nome AS projeto_nome
  FROM sge_pm_atividade a
  JOIN sge_pm_demanda d ON d.id = a.demanda_id
  LEFT JOIN sge_pm_projeto p ON p.id = d.projeto_id
  LEFT JOIN sge_pm_tipo_atividade t ON t.id = a.tipo_atividade_id
  LEFT JOIN sge_pm_usuario u ON u.id = a.executor_id
`;

async function enrichTarefa(tarefaId) {
  const row = await getTarefaEnriched(tarefaId);
  if (!row) return null;
  row.backlogs = await query(
    `SELECT b.id, b.codigo, b.titulo, p.nome AS projeto_nome FROM sge_pm_tarefa_backlog tb
     JOIN sge_pm_backlog_item b ON b.id = tb.backlog_item_id
     LEFT JOIN sge_pm_projeto p ON p.id = COALESCE(b.projeto_id, 1)
     WHERE tb.tarefa_id = ?`,
    [tarefaId]
  );
  row.links = await query(`SELECT * FROM sge_pm_tarefa_link WHERE tarefa_id = ?`, [tarefaId]);
  return row;
}

async function saveTarefaBacklogs(tarefaId, ids) {
  await query(`DELETE FROM sge_pm_tarefa_backlog WHERE tarefa_id = ?`, [tarefaId]);
  for (const bid of ids || []) {
    await query(`INSERT OR IGNORE INTO sge_pm_tarefa_backlog (tarefa_id, backlog_item_id) VALUES (?, ?)`, [tarefaId, bid]);
  }
}

async function saveTarefaLinks(tarefaId, links) {
  await query(`DELETE FROM sge_pm_tarefa_link WHERE tarefa_id = ?`, [tarefaId]);
  for (const link of links || []) {
    if (link.titulo && link.url) {
      await query(`INSERT INTO sge_pm_tarefa_link (tarefa_id, titulo, url) VALUES (?, ?, ?)`, [tarefaId, link.titulo, link.url]);
    }
  }
}

async function enrichAtividade(row) {
  if (!row) return null;
  row.executor_nome = row.usuario_executor_nome;
  row.backlogs = await query(
    `SELECT b.id, b.codigo, b.titulo, p.nome AS projeto_nome FROM sge_pm_atividade_backlog ab
     JOIN sge_pm_backlog_item b ON b.id = ab.backlog_item_id
     LEFT JOIN sge_pm_projeto p ON p.id = COALESCE(b.projeto_id, 1)
     WHERE ab.atividade_id = ? ORDER BY p.nome, b.titulo`,
    [row.id]
  );
  row.tarefas = await getTarefas(row.id);
  return row;
}

router.get("/", async (req, res, next) => {
  try {
    const { demanda_id, executor_id, fase, status } = req.query;
    const where = ["1=1"];
    const params = [];
    if (demanda_id) { where.push("a.demanda_id = ?"); params.push(demanda_id); }
    if (executor_id) { where.push("a.executor_id = ?"); params.push(executor_id); }
    else if (!["gestor", "tech_lead"].includes(req.user.perfil)) {
      where.push("a.executor_id = ?"); params.push(req.user.id);
    }
    if (fase) { where.push("a.fase = ?"); params.push(fase); }
    if (status) { where.push("a.status = ?"); params.push(status); }
    const rows = await query(`${SELECT} WHERE ${where.join(" AND ")} ORDER BY a.updated_at DESC`, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const b = req.body || {};
    const missing = [];
    if (!b.demanda_id) missing.push("demanda_id");
    if (!b.tipo_atividade_id) missing.push("tipo_atividade_id");
    if (!b.titulo?.trim()) missing.push("titulo");
    if (!b.fase) missing.push("fase");
    if (missing.length) {
      console.error("[atividades] POST validação falhou:", { body: b, missing });
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: `Campos obrigatórios: ${missing.join(", ")}`, fields: missing },
      });
    }
    if (!validateFase(b.fase)) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Fase inválida" } });
    }

    const result = await query(
      `INSERT INTO sge_pm_atividade (demanda_id, tipo_atividade_id, titulo, descricao, executor_id, fase, status, percentual_execucao, data_prevista_termino, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, 'aguardando', 0, ?, ?)`,
      [
        b.demanda_id, b.tipo_atividade_id, b.titulo.trim(), b.descricao ?? null,
        b.executor_id ?? req.user.id, b.fase,
        b.data_prevista_termino ?? null, b.observacoes ?? null,
      ]
    );
    const newId = result?.lastInsertRowid ?? result?.insertId;
    if (!newId) {
      console.error("[atividades] POST falhou ao obter ID inserido:", result);
      return res.status(500).json({ error: { code: "INSERT_ERROR", message: "Falha ao criar atividade" } });
    }
    const created = await queryOne(`${SELECT} WHERE a.id = ?`, [newId]);
    if (!created) {
      return res.status(500).json({ error: { code: "INSERT_ERROR", message: "Atividade criada mas não encontrada" } });
    }

    if (b.backlog_item_ids?.length) {
      for (const bid of b.backlog_item_ids) {
        await query(`INSERT OR IGNORE INTO sge_pm_atividade_backlog (atividade_id, backlog_item_id) VALUES (?, ?)`, [
          created.id, bid,
        ]);
      }
    }
    await logHistorico("demanda", b.demanda_id, req.user.id, "atividade_criada", { atividade_id: created.id, titulo: b.titulo });
    await syncDemandaFaseFromAtividades(b.demanda_id);
    res.status(201).json({ data: await enrichAtividade(created) });
  } catch (err) {
    console.error("[atividades] POST erro:", err);
    next(err);
  }
});

// ——— Tarefas (rotas específicas antes de /:id) ———
router.get("/:id/tarefas", async (req, res, next) => {
  try {
    const atividade = await queryOne(`SELECT id FROM sge_pm_atividade WHERE id = ?`, [req.params.id]);
    if (!atividade) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Atividade não encontrada" } });
    }
    const tarefas = await getTarefas(req.params.id);
    res.json({ data: tarefas });
  } catch (err) {
    console.error("[atividades] GET tarefas erro:", err);
    next(err);
  }
});

router.post("/:id/tarefas", async (req, res, next) => {
  try {
    const perm = await assertAtividadeExecutor(req.params.id, req.user.id);
    if (!perm.ok) return deny(res, perm);

    const b = req.body || {};
    if (!b.titulo?.trim()) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Título da tarefa é obrigatório" } });
    }
    const atividade = await queryOne(`SELECT id, demanda_id FROM sge_pm_atividade WHERE id = ?`, [req.params.id]);
    if (!atividade) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: `Atividade #${req.params.id} não encontrada` } });
    }

    const ordemRow = await queryOne(
      `SELECT COALESCE(MAX(ordem), 0) + 1 AS n FROM sge_pm_atividade_tarefa WHERE atividade_id = ?`,
      [req.params.id]
    );
    await query(
      `INSERT INTO sge_pm_atividade_tarefa (atividade_id, titulo, ordem, status, descricao, executor_id, tipo_atividade_id, data_prevista_termino, data_inicio, prompt_ia, comando_branch)
       VALUES (?, ?, ?, 'aguardando', ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.params.id, b.titulo.trim(), ordemRow?.n ?? 1,
        b.descricao ?? null, b.executor_id ?? req.user.id,
        b.tipo_atividade_id ?? null, b.data_prevista_termino ?? null,
        b.data_inicio ?? null,
        b.prompt_ia ?? null, b.comando_branch ?? null,
      ]
    );
    const created = await queryOne(
      `SELECT id FROM sge_pm_atividade_tarefa WHERE atividade_id = ? ORDER BY id DESC LIMIT 1`,
      [req.params.id]
    );
    if (b.backlog_item_ids?.length) await saveTarefaBacklogs(created.id, b.backlog_item_ids);
    if (b.links?.length) await saveTarefaLinks(created.id, b.links);

    const calc = await recalcAtividadeStatus(req.params.id);
    await logHistorico("demanda", atividade.demanda_id, req.user.id, "tarefa_criada", { atividade_id: req.params.id, titulo: b.titulo });
    const tarefa = await enrichTarefa(created.id);
    res.status(201).json({ data: { tarefa, ...calc } });
  } catch (err) {
    console.error("[atividades] POST tarefa erro:", err);
    next(err);
  }
});

router.get("/:id/tarefas/:tarefaId", async (req, res, next) => {
  try {
    const tarefa = await enrichTarefa(req.params.tarefaId);
    if (!tarefa || String(tarefa.atividade_id) !== String(req.params.id)) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Tarefa não encontrada" } });
    }
    tarefa.timer = await getTimerTarefa(req.user.id);
    res.json({ data: tarefa });
  } catch (err) {
    next(err);
  }
});

router.put("/:id/tarefas/:tarefaId", async (req, res, next) => {
  try {
    const perm = await assertAtividadeExecutor(req.params.id, req.user.id);
    if (!perm.ok) return deny(res, perm);

    const b = req.body || {};
    const tarefa = await queryOne(
      `SELECT * FROM sge_pm_atividade_tarefa WHERE id = ? AND atividade_id = ?`,
      [req.params.tarefaId, req.params.id]
    );
    if (!tarefa) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Tarefa não encontrada" } });
    }

    if (b.status === "concluida" || b.concluida === true) {
      const result = await tryConcluirTarefa(req.params.tarefaId);
      if (!result.ok) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: result.message } });
      }
    } else if (b.status && STATUS_TAREFA.includes(b.status) && b.status !== "concluida") {
      await query(
        `UPDATE sge_pm_atividade_tarefa SET status = ?, concluida = 0, updated_at = datetime('now') WHERE id = ?`,
        [b.status, req.params.tarefaId]
      );
    }

    const fields = ["titulo", "descricao", "executor_id", "tipo_atividade_id", "data_prevista_termino", "data_inicio", "prompt_ia", "comando_branch"];
    const sets = ["updated_at = datetime('now')"];
    const params = [];
    for (const f of fields) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
    }
    if (params.length) {
      params.push(req.params.tarefaId);
      await query(`UPDATE sge_pm_atividade_tarefa SET ${sets.join(", ")} WHERE id = ?`, params);
    }

    if (b.backlog_item_ids) await saveTarefaBacklogs(req.params.tarefaId, b.backlog_item_ids);
    if (b.links) await saveTarefaLinks(req.params.tarefaId, b.links);

    const calc = await recalcAtividadeStatus(req.params.id);
    const atividade = await queryOne(`SELECT demanda_id FROM sge_pm_atividade WHERE id = ?`, [req.params.id]);
    await logHistorico("demanda", atividade.demanda_id, req.user.id, "tarefa_atualizada", { tarefa_id: req.params.tarefaId });
    const updated = await enrichTarefa(req.params.tarefaId);
    res.json({ data: { tarefa: updated, ...calc } });
  } catch (err) {
    console.error("[atividades] PUT tarefa erro:", err);
    next(err);
  }
});

router.post("/:id/tarefas/:tarefaId/apontamento", async (req, res, next) => {
  try {
    const perm = await assertAtividadeExecutor(req.params.id, req.user.id);
    if (!perm.ok) return deny(res, perm);

    const tarefa = await queryOne(
      `SELECT id FROM sge_pm_atividade_tarefa WHERE id = ? AND atividade_id = ?`,
      [req.params.tarefaId, req.params.id]
    );
    if (!tarefa) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Tarefa não encontrada" } });

    const result = await createApontamentoTarefa(req.params.tarefaId, req.user.id, req.body || {});
    const tarefaFull = await enrichTarefa(req.params.tarefaId);
    res.status(201).json({ data: { ...result, tarefa: tarefaFull } });
  } catch (err) {
    if (err.code === "VALIDATION_ERROR") {
      return res.status(400).json({ error: { code: err.code, message: err.message } });
    }
    next(err);
  }
});

router.post("/:id/tarefas/:tarefaId/timer/start", async (req, res, next) => {
  try {
    const perm = await assertAtividadeExecutor(req.params.id, req.user.id);
    if (!perm.ok) return deny(res, perm);

    const timer = await startTimerTarefa(req.user.id, Number(req.params.tarefaId));
    const calc = await recalcAtividadeStatus(req.params.id);
    const tarefa = await enrichTarefa(req.params.tarefaId);
    res.json({ data: { timer, tarefa, ...calc } });
  } catch (err) {
    const status = err.code === "NOT_FOUND" ? 404 : err.code === "TIMER_ACTIVE" ? 409 : 400;
    if (err.code) return res.status(status).json({ error: { code: err.code, message: err.message } });
    next(err);
  }
});

router.post("/:id/tarefas/:tarefaId/timer/pause", async (req, res, next) => {
  try {
    const perm = await assertAtividadeExecutor(req.params.id, req.user.id);
    if (!perm.ok) return deny(res, perm);

    const timer = await pauseTimerTarefa(req.user.id);
    res.json({ data: { timer } });
  } catch (err) {
    if (err.code) return res.status(400).json({ error: { code: err.code, message: err.message } });
    next(err);
  }
});

router.post("/:id/tarefas/:tarefaId/timer/resume", async (req, res, next) => {
  try {
    const perm = await assertAtividadeExecutor(req.params.id, req.user.id);
    if (!perm.ok) return deny(res, perm);

    const timer = await resumeTimerTarefa(req.user.id);
    res.json({ data: { timer } });
  } catch (err) {
    if (err.code) return res.status(400).json({ error: { code: err.code, message: err.message } });
    next(err);
  }
});

router.post("/:id/tarefas/:tarefaId/timer/stop", async (req, res, next) => {
  try {
    const perm = await assertAtividadeExecutor(req.params.id, req.user.id);
    if (!perm.ok) return deny(res, perm);

    const { comentario } = req.body || {};
    const result = await stopTimerTarefa(req.user.id, comentario);
    const tarefa = await enrichTarefa(req.params.tarefaId);
    res.json({ data: { ...result, tarefa } });
  } catch (err) {
    if (err.code) return res.status(400).json({ error: { code: err.code, message: err.message } });
    next(err);
  }
});

router.delete("/:id/tarefas/:tarefaId", async (req, res, next) => {
  try {
    const perm = await assertAtividadeExecutor(req.params.id, req.user.id);
    if (!perm.ok) return deny(res, perm);

    const apontamentos = await queryOne(
      `SELECT COUNT(*) AS c FROM sge_pm_apontamento_tarefa WHERE tarefa_id = ?`,
      [req.params.tarefaId]
    );
    if (apontamentos?.c > 0) {
      return res.status(400).json({
        error: {
          code: "HAS_APONTAMENTOS",
          message: "Esta tarefa não pode ser excluída porque possui apontamentos de horas registrados.",
        },
      });
    }
    await query(`DELETE FROM sge_pm_atividade_tarefa WHERE id = ? AND atividade_id = ?`, [req.params.tarefaId, req.params.id]);
    const calc = await recalcAtividadeStatus(req.params.id);
    res.json({ data: calc });
  } catch (err) {
    console.error("[atividades] DELETE tarefa erro:", err);
    next(err);
  }
});

router.post("/:id/apontamento", async (req, res, next) => {
  return res.status(410).json({
    error: {
      code: "DEPRECATED",
      message: "Apontamento de horas foi movido para tarefas. Use POST /atividades/:id/tarefas/:tarefaId/apontamento",
    },
  });
});

router.get("/:id", async (req, res, next) => {
  try {
    const row = await queryOne(`${SELECT} WHERE a.id = ?`, [req.params.id]);
    if (!row) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Atividade não encontrada" } });
    row.links = await query(`SELECT * FROM sge_pm_atividade_link WHERE atividade_id = ?`, [row.id]);
    row.apontamentos = await query(
      `SELECT * FROM sge_pm_apontamento_atividade WHERE atividade_id = ? ORDER BY data DESC`,
      [row.id]
    );
    res.json({ data: await enrichAtividade(row) });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const b = req.body || {};
    const atividade = await queryOne(`SELECT * FROM sge_pm_atividade WHERE id = ?`, [req.params.id]);
    if (!atividade) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Atividade não encontrada" } });

    const fields = ["titulo", "descricao", "executor_id", "fase", "data_prevista_termino", "observacoes", "tipo_atividade_id"];
    const sets = ["updated_at = datetime('now')"];
    const params = [];
    for (const f of fields) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
    }
    params.push(req.params.id);
    await query(`UPDATE sge_pm_atividade SET ${sets.join(", ")} WHERE id = ?`, params);

    if (b.backlog_item_ids) {
      await query(`DELETE FROM sge_pm_atividade_backlog WHERE atividade_id = ?`, [req.params.id]);
      for (const bid of b.backlog_item_ids) {
        await query(`INSERT INTO sge_pm_atividade_backlog (atividade_id, backlog_item_id) VALUES (?, ?)`, [req.params.id, bid]);
      }
    }
    await logHistorico("demanda", atividade.demanda_id, req.user.id, "atividade_atualizada", b);
    await syncDemandaFaseFromAtividades(atividade.demanda_id);
    const updated = await queryOne(`${SELECT} WHERE a.id = ?`, [req.params.id]);
    res.json({ data: await enrichAtividade(updated) });
  } catch (err) {
    console.error("[atividades] PUT erro:", err);
    next(err);
  }
});

export default router;
