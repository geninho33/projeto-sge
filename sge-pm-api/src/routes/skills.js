import { Router } from "express";
import { query } from "../db.js";
import { requireMenuPermission } from "../middleware/auth.js";
import { P } from "../services/menuPermissions.js";

const router = Router();

router.get("/", requireMenuPermission("skills", P.VIEW), async (_req, res, next) => {
  try {
    const rows = await query("SELECT * FROM sge_pm_skill ORDER BY lado, codigo");
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/matrix", requireMenuPermission("skills", P.VIEW), async (_req, res, next) => {
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
