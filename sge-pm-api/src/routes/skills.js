import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const rows = await query("SELECT * FROM sge_pm_skill ORDER BY lado, codigo");
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/matrix", async (_req, res, next) => {
  try {
    const usuarios = await query("SELECT * FROM sge_pm_usuario WHERE ativo = 1 ORDER BY nome");
    const skills = await query("SELECT * FROM sge_pm_skill ORDER BY lado, codigo");
    const links = await query("SELECT * FROM sge_pm_usuario_skill");
    res.json({ data: { usuarios, skills, links } });
  } catch (err) {
    next(err);
  }
});

export default router;
