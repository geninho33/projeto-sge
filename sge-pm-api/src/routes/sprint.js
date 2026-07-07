import { Router } from "express";
import { query, queryOne } from "../db.js";
import { logHistorico, getHistorico } from "../services/historico.js";
import { recalcSprintProgress } from "../services/sprintProgress.js";
import { useSqlite } from "../db.js";

const router = Router();

const SPRINT_SELECT = `
  SELECT s.*, COALESCE(SUM(sbi.story_points), 0) AS points_alocados, u.nome AS responsavel_nome
  FROM sge_pm_sprint s
  LEFT JOIN sge_pm_sprint_backlog_item sbi ON sbi.sprint_id = s.id
  LEFT JOIN sge_pm_usuario u ON u.id = s.responsavel_id
`;

router.get("/", async (req, res, next) => {
  try {
    const { projeto_id = 1 } = req.query;
    const sprints = await query(
      `${SPRINT_SELECT} WHERE s.projeto_id = ? GROUP BY s.id ORDER BY s.numero`,
      [projeto_id]
    );
    res.json({ data: sprints });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const sprint = await queryOne(
      `${SPRINT_SELECT} WHERE s.id = ? GROUP BY s.id`,
      [req.params.id]
    );
    if (!sprint) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    sprint.equipe = await query(
      `SELECT u.id, u.nome, u.email, u.perfil FROM sge_pm_sprint_equipe se
       JOIN sge_pm_usuario u ON u.id = se.usuario_id WHERE se.sprint_id = ?`,
      [req.params.id]
    );
    res.json({ data: sprint });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/historico", async (req, res, next) => {
  try {
    res.json({ data: await getHistorico("sprint", req.params.id) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.nome?.trim()) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Nome obrigatório" } });
    const maxRow = await queryOne(`SELECT MAX(numero) AS m FROM sge_pm_sprint WHERE projeto_id = ?`, [b.projeto_id ?? 1]);
    const numero = (maxRow?.m ?? -1) + 1;
    await query(
      `INSERT INTO sge_pm_sprint (projeto_id, numero, nome, objetivo, data_inicio, data_fim, status, responsavel_id, capacity_points)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        b.projeto_id ?? 1, numero, b.nome.trim(), b.objetivo ?? null, b.data_inicio ?? null, b.data_fim ?? null,
        b.status ?? "planejada", b.responsavel_id ?? null, b.capacity_points ?? 40,
      ]
    );
    const created = await queryOne(`${SPRINT_SELECT} GROUP BY s.id ORDER BY s.id DESC LIMIT 1`);
    if (b.equipe_ids?.length) {
      for (const uid of b.equipe_ids) {
        await query(`INSERT OR IGNORE INTO sge_pm_sprint_equipe (sprint_id, usuario_id) VALUES (?, ?)`, [created.id, uid]);
      }
    }
    await logHistorico("sprint", created.id, req.user.id, "criada", b);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const b = req.body || {};
    const fields = ["nome", "objetivo", "data_inicio", "data_fim", "status", "responsavel_id", "capacity_points", "percentual_conclusao"];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
    }
    if (sets.length) {
      params.push(req.params.id);
      await query(`UPDATE sge_pm_sprint SET ${sets.join(", ")} WHERE id = ?`, params);
    }
    if (b.equipe_ids) {
      await query(`DELETE FROM sge_pm_sprint_equipe WHERE sprint_id = ?`, [req.params.id]);
      for (const uid of b.equipe_ids) {
        await query(`INSERT INTO sge_pm_sprint_equipe (sprint_id, usuario_id) VALUES (?, ?)`, [req.params.id, uid]);
      }
    }
    await logHistorico("sprint", req.params.id, req.user.id, "atualizada", b);
    const updated = await queryOne(`${SPRINT_SELECT} WHERE s.id = ? GROUP BY s.id`, [req.params.id]);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/items", async (req, res, next) => {
  try {
    const items = await query(
      `SELECT b.*, sbi.story_points, m.status_front, m.status_back, m.branch_front, m.branch_back
       FROM sge_pm_sprint_backlog_item sbi
       JOIN sge_pm_backlog_item b ON b.id = sbi.backlog_item_id
       LEFT JOIN sge_pm_mapeamento_mudanca m ON m.backlog_item_id = b.id
       WHERE sbi.sprint_id = ?
       ORDER BY b.codigo`,
      [req.params.id]
    );
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/items", async (req, res, next) => {
  try {
    const { backlog_item_id, story_points } = req.body;
    const sql = useSqlite()
      ? `INSERT INTO sge_pm_sprint_backlog_item (sprint_id, backlog_item_id, story_points) VALUES (?, ?, ?)
         ON CONFLICT(sprint_id, backlog_item_id) DO UPDATE SET story_points = excluded.story_points`
      : `INSERT INTO sge_pm_sprint_backlog_item (sprint_id, backlog_item_id, story_points) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE story_points = VALUES(story_points)`;
    await query(sql, [req.params.id, backlog_item_id, story_points]);
    await query(`UPDATE sge_pm_backlog_item SET sprint_id = ? WHERE id = ?`, [req.params.id, backlog_item_id]);
    await recalcSprintProgress(req.params.id);
    res.status(201).json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
