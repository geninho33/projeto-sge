import { Router } from "express";
import { query, queryOne } from "../db.js";
import { logHistorico, getHistorico } from "../services/historico.js";
import { requireMenuPermission } from "../middleware/auth.js";
import { P } from "../services/menuPermissions.js";

const router = Router();

const SELECT = `
  SELECT m.*, u.nome AS desenvolvedor_nome, s.nome AS sprint_nome, p.nome AS projeto_nome
  FROM sge_pm_migracao m
  LEFT JOIN sge_pm_usuario u ON u.id = m.desenvolvedor_id
  LEFT JOIN sge_pm_sprint s ON s.id = m.sprint_id
  LEFT JOIN sge_pm_projeto p ON p.id = m.projeto_id
`;

router.get("/", requireMenuPermission("admin_migracoes", P.VIEW), async (req, res, next) => {
  try {
    const { status, sprint_id } = req.query;
    const where = ["1=1"];
    const params = [];
    if (status) { where.push("m.status_implantacao = ?"); params.push(status); }
    if (sprint_id) { where.push("m.sprint_id = ?"); params.push(sprint_id); }
    const rows = await query(`${SELECT} WHERE ${where.join(" AND ")} ORDER BY m.updated_at DESC`, params);
    for (const row of rows) {
      row.backlog_itens = await query(
        `SELECT b.id, b.codigo, b.titulo FROM sge_pm_migracao_backlog mb
         JOIN sge_pm_backlog_item b ON b.id = mb.backlog_item_id WHERE mb.migracao_id = ?`,
        [row.id]
      );
    }
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireMenuPermission("admin_migracoes", P.VIEW), async (req, res, next) => {
  try {
    const row = await queryOne(`${SELECT} WHERE m.id = ?`, [req.params.id]);
    if (!row) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    row.backlog_itens = await query(
      `SELECT b.id, b.codigo, b.titulo FROM sge_pm_migracao_backlog mb
       JOIN sge_pm_backlog_item b ON b.id = mb.backlog_item_id WHERE mb.migracao_id = ?`,
      [row.id]
    );
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/historico", async (req, res, next) => {
  try {
    res.json({ data: await getHistorico("migracao", req.params.id) });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireMenuPermission("admin_migracoes", P.CREATE), async (req, res, next) => {
  try {
    const b = req.body || {};
    await query(
      `INSERT INTO sge_pm_migracao (projeto_id, sprint_id, branch_nome, desenvolvedor_id, funcionalidades, correcoes, scripts_db, alteracoes_config, observacoes, status_implantacao)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        b.projeto_id ?? 1, b.sprint_id ?? null, b.branch_nome ?? null, b.desenvolvedor_id ?? null,
        b.funcionalidades ?? null, b.correcoes ?? null, b.scripts_db ?? null, b.alteracoes_config ?? null,
        b.observacoes ?? null, b.status_implantacao ?? "planejada",
      ]
    );
    const created = await queryOne(`${SELECT} ORDER BY m.id DESC LIMIT 1`);
    if (b.backlog_item_ids?.length) {
      for (const bid of b.backlog_item_ids) {
        await query(`INSERT OR IGNORE INTO sge_pm_migracao_backlog (migracao_id, backlog_item_id) VALUES (?, ?)`, [
          created.id, bid,
        ]);
      }
    }
    await logHistorico("migracao", created.id, req.user.id, "criada", b);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireMenuPermission("admin_migracoes", P.UPDATE), async (req, res, next) => {
  try {
    const b = req.body || {};
    const fields = ["projeto_id", "sprint_id", "branch_nome", "desenvolvedor_id", "funcionalidades", "correcoes", "scripts_db", "alteracoes_config", "observacoes", "status_implantacao"];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
    }
    sets.push("updated_at = datetime('now')");
    params.push(req.params.id);
    await query(`UPDATE sge_pm_migracao SET ${sets.join(", ")} WHERE id = ?`, params);
    if (b.backlog_item_ids) {
      await query(`DELETE FROM sge_pm_migracao_backlog WHERE migracao_id = ?`, [req.params.id]);
      for (const bid of b.backlog_item_ids) {
        await query(`INSERT INTO sge_pm_migracao_backlog (migracao_id, backlog_item_id) VALUES (?, ?)`, [
          req.params.id, bid,
        ]);
      }
    }
    await logHistorico("migracao", req.params.id, req.user.id, "atualizada", b);
    const updated = await queryOne(`${SELECT} WHERE m.id = ?`, [req.params.id]);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
