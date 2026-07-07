import { query } from "../db.js";
import { config } from "../config.js";

async function postWebhook(payload) {
  const url = config.notifyWebhookUrl;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "atualizacao",
        service: "16flow-api",
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    });
  } catch (err) {
    console.warn("[webhook] Falha ao notificar:", err.message);
  }
}

export async function notifyGestor(demandaId, titulo, mensagem, referenciaTipo = "demanda") {
  const gestores = await query(
    `SELECT DISTINCT u.id, u.nome, u.email
     FROM sge_pm_usuario u
     JOIN sge_pm_usuario_perfil up ON up.usuario_id = u.id
     JOIN sge_pm_perfil p ON p.id = up.perfil_id
     WHERE p.codigo IN ('gestor_proj', 'admin') AND u.ativo = 1 AND u.deleted_at IS NULL`
  );

  for (const g of gestores) {
    await query(
      `INSERT INTO sge_pm_notificacao (usuario_id, tipo, titulo, mensagem, referencia_tipo, referencia_id)
       VALUES (?, 'atualizacao', ?, ?, ?, ?)`,
      [g.id, titulo, mensagem, referenciaTipo, String(demandaId)]
    );
  }

  await postWebhook({
    titulo,
    mensagem,
    referencia_tipo: referenciaTipo,
    referencia_id: String(demandaId),
    destinatarios: gestores.map((g) => g.email),
  });
}

export async function listNotifications(userId, { limit = 20, apenasNaoLidas = false } = {}) {
  const params = [userId];
  let sql = `
    SELECT id, tipo, titulo, mensagem, lida, referencia_tipo, referencia_id, created_at
    FROM sge_pm_notificacao
    WHERE usuario_id = ?
  `;
  if (apenasNaoLidas) sql += " AND lida = 0";
  sql += ` ORDER BY created_at DESC LIMIT ${Math.min(50, Math.max(1, Number(limit) || 20))}`;
  return query(sql, params);
}

export async function countUnreadNotifications(userId) {
  const rows = await query(
    `SELECT COUNT(*) AS total FROM sge_pm_notificacao WHERE usuario_id = ? AND lida = 0`,
    [userId]
  );
  return rows[0]?.total ?? 0;
}

export async function markNotificationRead(userId, id) {
  await query(
    `UPDATE sge_pm_notificacao SET lida = 1 WHERE id = ? AND usuario_id = ?`,
    [id, userId]
  );
}

export async function markAllNotificationsRead(userId) {
  await query(`UPDATE sge_pm_notificacao SET lida = 1 WHERE usuario_id = ? AND lida = 0`, [userId]);
}
