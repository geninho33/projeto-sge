import { Router } from "express";
import { query, queryOne } from "../db.js";
import { createApontamento, validateNoOverlap } from "../services/apontamentoService.js";
import { notifyGestor } from "../services/notificationService.js";
import { calcDurationMinutes } from "../services/timeUtils.js";
import { requireMenuPermission } from "../middleware/auth.js";
import { isManagerUser } from "../services/profileService.js";
import { P } from "../services/menuPermissions.js";

const router = Router();

router.get("/", requireMenuPermission("consulta_apontamentos", P.VIEW), async (req, res, next) => {
  try {
    const { demanda_id, usuario_id, data_inicio, data_fim } = req.query;
    const where = ["1=1"];
    const params = [];

    if (demanda_id) { where.push("a.demanda_id = ?"); params.push(demanda_id); }
    if (usuario_id) { where.push("a.usuario_id = ?"); params.push(usuario_id); }
    else if (!isManagerUser(req.user)) {
      where.push("a.usuario_id = ?");
      params.push(req.user.id);
    }
    if (data_inicio) { where.push("a.data >= ?"); params.push(data_inicio); }
    if (data_fim) { where.push("a.data <= ?"); params.push(data_fim); }

    const rows = await query(
      `SELECT a.*, u.nome AS usuario_nome, d.titulo AS demanda_titulo, d.codigo AS demanda_codigo
       FROM sge_pm_apontamento a
       JOIN sge_pm_usuario u ON u.id = a.usuario_id
       JOIN sge_pm_demanda d ON d.id = a.demanda_id
       WHERE ${where.join(" AND ")}
       ORDER BY a.data DESC, a.hora_inicio DESC`,
      params
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireMenuPermission("consulta_apontamentos", P.CREATE), async (req, res, next) => {
  try {
    const b = req.body || {};
    const usuarioId = b.usuario_id ?? req.user.id;

    if (usuarioId !== req.user.id && !isManagerUser(req.user)) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    const demanda = await queryOne(`SELECT responsavel_id FROM sge_pm_demanda WHERE id = ?`, [b.demanda_id]);
    if (!demanda) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    if (demanda.responsavel_id !== usuarioId && !isManagerUser(req.user)) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Só é possível apontar em demandas atribuídas" } });
    }

    const created = await createApontamento(b, usuarioId, req.user.id);
    await notifyGestor(
      b.demanda_id,
      "Novo apontamento manual",
      `${created.demanda_codigo} — ${created.duracao_minutos} min`
    );
    res.status(201).json({ data: created });
  } catch (err) {
    const status = err.code === "OVERLAP" || err.code === "VALIDATION_ERROR" ? 400 : 500;
    if (err.code) return res.status(status).json({ error: { code: err.code, message: err.message } });
    next(err);
  }
});

router.put("/:id", requireMenuPermission("consulta_apontamentos", P.UPDATE), async (req, res, next) => {
  try {
    const existing = await queryOne(`SELECT * FROM sge_pm_apontamento WHERE id = ?`, [req.params.id]);
    if (!existing) return res.status(404).json({ error: { code: "NOT_FOUND" } });

    if (existing.usuario_id !== req.user.id && !isManagerUser(req.user)) {
      return res.status(403).json({ error: { code: "FORBIDDEN" } });
    }

    const b = req.body || {};
    const horaInicio = b.hora_inicio ?? existing.hora_inicio;
    const horaFim = b.hora_fim ?? existing.hora_fim;
    const data = b.data ?? existing.data;
    const duracao = calcDurationMinutes(horaInicio, horaFim);
    if (!duracao) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Horários inválidos" } });

    await validateNoOverlap(existing.usuario_id, data, horaInicio, horaFim, existing.id);

    await query(
      `UPDATE sge_pm_apontamento SET data = ?, hora_inicio = ?, hora_fim = ?, duracao_minutos = ?, comentario = ? WHERE id = ?`,
      [data, horaInicio, horaFim, duracao, b.comentario ?? existing.comentario, req.params.id]
    );

    const updated = await queryOne(
      `SELECT a.*, u.nome AS usuario_nome FROM sge_pm_apontamento a JOIN sge_pm_usuario u ON u.id = a.usuario_id WHERE a.id = ?`,
      [req.params.id]
    );
    res.json({ data: updated });
  } catch (err) {
    if (err.code) return res.status(400).json({ error: { code: err.code, message: err.message } });
    next(err);
  }
});

router.delete("/:id", requireMenuPermission("consulta_apontamentos", P.DELETE), async (req, res, next) => {
  try {
    await query(`DELETE FROM sge_pm_apontamento WHERE id = ?`, [req.params.id]);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
