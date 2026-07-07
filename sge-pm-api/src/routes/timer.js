import { Router } from "express";
import {
  getTimerAtivo,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  syncTimer,
} from "../services/timerService.js";
import { getTimerTarefa } from "../services/timerTarefaService.js";

const router = Router();

router.get("/tarefa/ativo", async (req, res, next) => {
  try {
    const timer = await getTimerTarefa(req.user.id);
    res.json({ data: timer });
  } catch (err) {
    next(err);
  }
});

router.get("/ativo", async (req, res, next) => {
  try {
    const timer = await getTimerAtivo(req.user.id);
    res.json({ data: timer });
  } catch (err) {
    next(err);
  }
});

router.post("/start", async (req, res, next) => {
  try {
    const { demanda_id } = req.body || {};
    if (!demanda_id) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "demanda_id obrigatório" } });
    const timer = await startTimer(req.user.id, demanda_id);
    res.json({ data: timer });
  } catch (err) {
    const status = err.code === "NOT_FOUND" ? 404 : err.code === "TIMER_ACTIVE" ? 409 : 400;
    if (err.code) return res.status(status).json({ error: { code: err.code, message: err.message } });
    next(err);
  }
});

router.post("/pause", async (req, res, next) => {
  try {
    const timer = await pauseTimer(req.user.id);
    res.json({ data: timer });
  } catch (err) {
    if (err.code) return res.status(400).json({ error: { code: err.code, message: err.message } });
    next(err);
  }
});

router.post("/resume", async (req, res, next) => {
  try {
    const timer = await resumeTimer(req.user.id);
    res.json({ data: timer });
  } catch (err) {
    if (err.code) return res.status(400).json({ error: { code: err.code, message: err.message } });
    next(err);
  }
});

router.post("/stop", async (req, res, next) => {
  try {
    const { comentario } = req.body || {};
    const result = await stopTimer(req.user.id, comentario, req.user.id);
    res.json({ data: result });
  } catch (err) {
    if (err.code) return res.status(400).json({ error: { code: err.code, message: err.message } });
    next(err);
  }
});

router.post("/sync", async (req, res, next) => {
  try {
    const { elapsed_seconds } = req.body || {};
    const timer = await syncTimer(req.user.id, elapsed_seconds ?? 0);
    res.json({ data: timer });
  } catch (err) {
    next(err);
  }
});

export default router;
