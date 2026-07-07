import { Router } from "express";
import { issueToken } from "../middleware/auth.js";
import { getContext } from "../services/mockStore.js";

const router = Router();

router.post("/login", (req, res) => {
  const { usuario, senha, ano, ue } = req.body || {};
  if (!usuario) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Usuário obrigatório" } });
  }
  const token = issueToken({
    id: 1,
    nome: usuario,
    prefeitura: "8105",
    ano: ano || "2026",
    ue: ue || "8105",
  });
  res.json({
    data: {
      access_token: token,
      token_type: "Bearer",
      expires_in: 28800,
      context: { ano: ano || "2026", ue: ue || "8105", ...getContext() },
    },
  });
});

router.get("/context", (req, res) => {
  res.json({
    data: {
      ano: req.headers["x-sge-ano"] || "2026",
      ue: req.headers["x-sge-ue"] || "8105",
      prefeitura: req.headers["x-sge-prefeitura"] || "8105",
      opcoesAno: ["2024", "2025", "2026"],
      opcoesUe: [
        { codigo: "8105", nome: "EMEF FLORIANOPOLIS" },
        { codigo: "8106", nome: "EMEF CENTRO" },
      ],
    },
  });
});

router.get("/me", (req, res) => {
  res.json({ data: req.user });
});

export default router;
