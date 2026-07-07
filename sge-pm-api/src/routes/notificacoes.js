import { Router } from "express";
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const apenasNaoLidas = req.query.nao_lidas === "1";
    const [items, naoLidas] = await Promise.all([
      listNotifications(req.user.id, { apenasNaoLidas }),
      countUnreadNotifications(req.user.id),
    ]);
    res.json({ data: items, meta: { nao_lidas: naoLidas } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/lida", async (req, res, next) => {
  try {
    await markNotificationRead(req.user.id, req.params.id);
    const naoLidas = await countUnreadNotifications(req.user.id);
    res.json({ data: { ok: true }, meta: { nao_lidas: naoLidas } });
  } catch (err) {
    next(err);
  }
});

router.post("/marcar-todas-lidas", async (_req, res, next) => {
  try {
    await markAllNotificationsRead(_req.user.id);
    res.json({ data: { ok: true }, meta: { nao_lidas: 0 } });
  } catch (err) {
    next(err);
  }
});

export default router;
