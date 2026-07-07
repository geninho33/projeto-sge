import { Router } from "express";
import { query, queryOne } from "../db.js";
import { logHistorico } from "../services/historico.js";
import { canAdvancePhase, nextPhase, enrichDemanda, validateFase } from "../services/demandaFlow.js";
import { FASES_DEMANDA } from "../services/schemaV4.js";
import { requireMenuPermission, requireMenuPermissionByMethod } from "../middleware/auth.js";
import { P } from "../services/menuPermissions.js";

const router = Router();
router.use(requireMenuPermissionByMethod("demandas", { POST: P.APPROVE, PATCH: P.APPROVE }));

router.get("/:demandaId", async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT t.*, u.nome AS usuario_nome FROM sge_pm_tramitacao t
       JOIN sge_pm_usuario u ON u.id = t.usuario_id
       WHERE t.demanda_id = ? ORDER BY t.created_at DESC`,
      [req.params.demandaId]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:demandaId/pode-avancar", async (req, res, next) => {
  try {
    const demanda = await queryOne(`SELECT fase FROM sge_pm_demanda WHERE id = ?`, [req.params.demandaId]);
    if (!demanda) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    const check = await canAdvancePhase(req.params.demandaId, demanda.fase);
    res.json({ data: { ...check, proxima_fase: nextPhase(demanda.fase), fases: FASES_DEMANDA } });
  } catch (err) {
    next(err);
  }
});

router.post("/:demandaId", async (req, res, next) => {
  try {
    const { fase_nova, comentario } = req.body || {};
    if (!fase_nova || !comentario?.trim()) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Fase e comentário obrigatórios" } });
    }
    if (!validateFase(fase_nova)) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Fase inválida" } });
    }

    const demanda = await queryOne(`SELECT * FROM sge_pm_demanda WHERE id = ? AND deleted_at IS NULL`, [req.params.demandaId]);
    if (!demanda) return res.status(404).json({ error: { code: "NOT_FOUND" } });

    const faseAtual = demanda.fase || "criacao";

    if (fase_nova !== "cancelada" && fase_nova !== faseAtual) {
      const check = await canAdvancePhase(demanda.id, faseAtual);
      if (!check.ok) {
        return res.status(409).json({
          error: { code: "ATIVIDADES_PENDENTES", message: "Atividades pendentes impedem tramitação", pending: check.pending },
        });
      }
      const expected = nextPhase(faseAtual);
      if (expected && fase_nova !== expected && fase_nova !== "cancelada") {
        return res.status(400).json({ error: { code: "FASE_INVALIDA", message: `Próxima fase: ${expected}` } });
      }
    }

    await query(
      `INSERT INTO sge_pm_tramitacao (demanda_id, fase_anterior, fase_nova, comentario, usuario_id) VALUES (?, ?, ?, ?, ?)`,
      [demanda.id, faseAtual, fase_nova, comentario.trim(), req.user.id]
    );
    await query(`UPDATE sge_pm_demanda SET fase = ?, updated_at = datetime('now') WHERE id = ?`, [fase_nova, demanda.id]);

    if (fase_nova === "cancelada") {
      await query(
        `UPDATE sge_pm_atividade SET fase = 'cancelada', updated_at = datetime('now') WHERE demanda_id = ?`,
        [demanda.id]
      );
    } else {
      await query(
        `UPDATE sge_pm_atividade SET fase = ?, updated_at = datetime('now')
         WHERE demanda_id = ? AND status != 'concluida' AND fase != 'cancelada'`,
        [fase_nova, demanda.id]
      );
    }

    await logHistorico("demanda", demanda.id, req.user.id, "tramitacao", { de: faseAtual, para: fase_nova });

    const updated = await enrichDemanda(await queryOne(
      `SELECT d.*, p.nome AS projeto_nome FROM sge_pm_demanda d LEFT JOIN sge_pm_projeto p ON p.id = d.projeto_id WHERE d.id = ?`,
      [demanda.id]
    ));
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
