import { Router } from "express";
import { login } from "../services/authService.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, senha, lembrar = false } = req.body || {};
    const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress;
    const result = await login(email, senha, lembrar, ip);
    res.json({ data: result });
  } catch (err) {
    const code = err.code || "AUTH_ERROR";
    const status = code === "RATE_LIMIT" ? 429 : code === "VALIDATION_ERROR" ? 400 : 401;
    res.status(status).json({ error: { code, message: err.message } });
  }
});

router.post("/logout", (_req, res) => {
  res.json({ data: { ok: true } });
});

router.post("/forgot-password", (req, res) => {
  const { email } = req.body || {};
  if (!email?.trim()) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Informe o e-mail" } });
  }
  res.json({
    data: {
      ok: true,
      message: "Se o e-mail existir, enviaremos instruções de recuperação (simulado em dev).",
    },
  });
});

router.get("/me", async (req, res, next) => {
  try {
    const { authMiddleware } = await import("../middleware/auth.js");
    authMiddleware(req, res, () => {
      res.json({ data: req.user });
    });
  } catch (err) {
    next(err);
  }
});

export default router;
