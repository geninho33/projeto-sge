import { query, queryOne } from "../db.js";
import { calcDurationMinutes, parseTimeToMinutes } from "./timeUtils.js";
import { logHistorico } from "./historico.js";

export async function getHorasApontadas(demandaId) {
  const row = await queryOne(
    `SELECT COALESCE(SUM(duracao_minutos), 0) AS total FROM sge_pm_apontamento WHERE demanda_id = ?`,
    [demandaId]
  );
  return (row?.total ?? 0) / 60;
}

export async function validateNoOverlap(usuarioId, data, horaInicio, horaFim, excludeId = null) {
  const start = parseTimeToMinutes(horaInicio);
  const end = parseTimeToMinutes(horaFim);
  const params = [usuarioId, data, end, start];
  let sql = `
    SELECT id FROM sge_pm_apontamento
    WHERE usuario_id = ? AND data = ?
      AND hora_inicio < ? AND hora_fim > ?
  `;
  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }
  const conflict = await queryOne(sql, params);
  if (conflict) {
    throw Object.assign(new Error("Horário sobrepõe outro apontamento existente"), { code: "OVERLAP" });
  }
}

export async function createApontamento(data, usuarioId, actorId) {
  const { demanda_id, data: dia, hora_inicio, hora_fim, comentario, tipo = "manual", duracao_minutos } = data;

  if (!demanda_id || !dia || !hora_inicio || !hora_fim) {
    throw Object.assign(new Error("Demanda, data e horários são obrigatórios"), { code: "VALIDATION_ERROR" });
  }

  const duracao = duracao_minutos ?? calcDurationMinutes(hora_inicio, hora_fim);
  if (!duracao || duracao <= 0) {
    throw Object.assign(new Error("Horário final deve ser maior que o inicial"), { code: "VALIDATION_ERROR" });
  }

  await validateNoOverlap(usuarioId, dia, hora_inicio, hora_fim);

  await query(
    `INSERT INTO sge_pm_apontamento (demanda_id, usuario_id, data, hora_inicio, hora_fim, duracao_minutos, comentario, tipo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [demanda_id, usuarioId, dia, hora_inicio, hora_fim, duracao, comentario ?? null, tipo]
  );

  const created = await queryOne(
    `SELECT a.*, u.nome AS usuario_nome, d.titulo AS demanda_titulo, d.codigo AS demanda_codigo
     FROM sge_pm_apontamento a
     JOIN sge_pm_usuario u ON u.id = a.usuario_id
     JOIN sge_pm_demanda d ON d.id = a.demanda_id
     ORDER BY a.id DESC LIMIT 1`
  );

  await logHistorico("demanda", demanda_id, actorId, "apontamento", {
    tipo, duracao_minutos: duracao, data: dia, hora_inicio, hora_fim,
  });

  return created;
}

export async function notifyGestor(demandaId, titulo, mensagem, referenciaTipo = "demanda") {
  const gestores = await query(
    `SELECT DISTINCT u.id
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
}
