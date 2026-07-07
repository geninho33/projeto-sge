import { Router } from "express";
import { query, queryOne } from "../db.js";
import { logHistorico } from "../services/historico.js";
import { MENU_STRUCTURE, NIVEL_PERMISSAO } from "../services/menuPermissions.js";

const router = Router();

router.get("/menus", (_req, res) => {
  res.json({ data: { structure: MENU_STRUCTURE, niveis: NIVEL_PERMISSAO } });
});

router.get("/", async (req, res, next) => {
  try {
    const { q, ativo } = req.query;
    const where = ["1=1"];
    const params = [];
    if (ativo !== "all") { where.push("ativo = ?"); params.push(ativo === "0" ? 0 : 1); }
    if (q?.trim()) {
      where.push("(codigo LIKE ? OR nome LIKE ? OR descricao LIKE ?)");
      const t = `%${q.trim()}%`;
      params.push(t, t, t);
    }
    const rows = await query(`SELECT * FROM sge_pm_perfil WHERE ${where.join(" AND ")} ORDER BY nome`, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const perfil = await queryOne(`SELECT * FROM sge_pm_perfil WHERE id = ?`, [req.params.id]);
    if (!perfil) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    const permissoes = await query(`SELECT menu_key, nivel FROM sge_pm_perfil_permissao WHERE perfil_id = ?`, [req.params.id]);
    const map = {};
    for (const p of permissoes) map[p.menu_key] = p.nivel;
    perfil.permissoes = map;
    res.json({ data: perfil });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { codigo, nome, descricao, ativo = 1, permissoes = {} } = req.body || {};
    if (!codigo?.trim() || !nome?.trim()) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Código e nome obrigatórios" } });
    }
    await query(`INSERT INTO sge_pm_perfil (codigo, nome, descricao, ativo) VALUES (?, ?, ?, ?)`, [
      codigo.trim().toLowerCase(), nome.trim(), descricao ?? null, ativo ? 1 : 0,
    ]);
    const created = await queryOne(`SELECT * FROM sge_pm_perfil WHERE codigo = ?`, [codigo.trim().toLowerCase()]);
    for (const [menu_key, nivel] of Object.entries(permissoes)) {
      await query(`INSERT INTO sge_pm_perfil_permissao (perfil_id, menu_key, nivel) VALUES (?, ?, ?)`, [
        created.id, menu_key, Number(nivel) || 0,
      ]);
    }
    await logHistorico("perfil", created.id, req.user.id, "criado", req.body);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { nome, descricao, ativo, permissoes } = req.body || {};
    const sets = ["updated_at = datetime('now')"];
    const params = [];
    if (nome) { sets.push("nome = ?"); params.push(nome.trim()); }
    if (descricao !== undefined) { sets.push("descricao = ?"); params.push(descricao); }
    if (ativo !== undefined) { sets.push("ativo = ?"); params.push(ativo ? 1 : 0); }
    params.push(req.params.id);
    await query(`UPDATE sge_pm_perfil SET ${sets.join(", ")} WHERE id = ?`, params);

    if (permissoes) {
      await query(`DELETE FROM sge_pm_perfil_permissao WHERE perfil_id = ?`, [req.params.id]);
      for (const [menu_key, nivel] of Object.entries(permissoes)) {
        await query(`INSERT INTO sge_pm_perfil_permissao (perfil_id, menu_key, nivel) VALUES (?, ?, ?)`, [
          req.params.id, menu_key, Number(nivel) || 0,
        ]);
      }
    }
    await logHistorico("perfil", req.params.id, req.user.id, "atualizado", req.body);
    const updated = await queryOne(`SELECT * FROM sge_pm_perfil WHERE id = ?`, [req.params.id]);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/aplicar-grupo", async (req, res, next) => {
  try {
    const { grupo, nivel } = req.body || {};
    const grupoData = MENU_STRUCTURE.find((g) => g.grupo === grupo);
    if (!grupoData) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Grupo inválido" } });
    for (const item of grupoData.itens) {
      await query(
        `INSERT INTO sge_pm_perfil_permissao (perfil_id, menu_key, nivel) VALUES (?, ?, ?)
         ON CONFLICT(perfil_id, menu_key) DO UPDATE SET nivel = excluded.nivel`,
        [req.params.id, item.key, Number(nivel) || 0]
      );
    }
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
