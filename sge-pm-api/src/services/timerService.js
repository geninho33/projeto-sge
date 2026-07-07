import { query, queryOne } from "../db.js";
import { createApontamento, notifyGestor } from "./apontamentoService.js";
import { nowTime, todayISO } from "./timeUtils.js";

export async function getTimerAtivo(usuarioId) {
  const timer = await queryOne(
    `SELECT t.*, d.titulo AS demanda_titulo, d.codigo AS demanda_codigo
     FROM sge_pm_timer_ativo t
     JOIN sge_pm_demanda d ON d.id = t.demanda_id
     WHERE t.usuario_id = ?`,
    [usuarioId]
  );
  if (!timer) return null;

  let elapsed = timer.acumulado_segundos ?? 0;
  if (timer.status === "running" && timer.iniciado_em) {
    const started = new Date(timer.iniciado_em.replace(" ", "T") + "Z").getTime();
    const now = Date.now();
    elapsed += Math.max(0, Math.floor((now - started) / 1000));
  }

  return { ...timer, elapsed_seconds: elapsed };
}

export async function startTimer(usuarioId, demandaId) {
  const demanda = await queryOne(`SELECT * FROM sge_pm_demanda WHERE id = ?`, [demandaId]);
  if (!demanda) throw Object.assign(new Error("Demanda não encontrada"), { code: "NOT_FOUND" });

  const existing = await queryOne(`SELECT demanda_id FROM sge_pm_timer_ativo WHERE usuario_id = ?`, [usuarioId]);
  if (existing && existing.demanda_id !== demandaId) {
    throw Object.assign(new Error("Já existe um cronômetro ativo. Encerre antes de iniciar outro."), { code: "TIMER_ACTIVE" });
  }

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await query(
    `INSERT INTO sge_pm_timer_ativo (usuario_id, demanda_id, iniciado_em, acumulado_segundos, status, ultimo_heartbeat)
     VALUES (?, ?, ?, 0, 'running', ?)
     ON CONFLICT(usuario_id) DO UPDATE SET
       demanda_id = excluded.demanda_id,
       iniciado_em = excluded.iniciado_em,
       acumulado_segundos = 0,
       status = 'running',
       ultimo_heartbeat = excluded.ultimo_heartbeat`,
    [usuarioId, demandaId, now, now]
  );

  if (demanda.situacao_trabalho === "nao_iniciada") {
    await query(
      `UPDATE sge_pm_demanda SET situacao_trabalho = 'em_andamento', updated_at = datetime('now') WHERE id = ?`,
      [demandaId]
    );
  }

  return getTimerAtivo(usuarioId);
}

export async function pauseTimer(usuarioId) {
  const timer = await getTimerAtivo(usuarioId);
  if (!timer || timer.status !== "running") {
    throw Object.assign(new Error("Nenhum cronômetro em execução"), { code: "NO_TIMER" });
  }

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await query(
    `UPDATE sge_pm_timer_ativo SET acumulado_segundos = ?, status = 'paused', ultimo_heartbeat = ? WHERE usuario_id = ?`,
    [timer.elapsed_seconds, now, usuarioId]
  );
  return getTimerAtivo(usuarioId);
}

export async function resumeTimer(usuarioId) {
  const timer = await queryOne(`SELECT * FROM sge_pm_timer_ativo WHERE usuario_id = ?`, [usuarioId]);
  if (!timer || timer.status !== "paused") {
    throw Object.assign(new Error("Cronômetro não está pausado"), { code: "NO_TIMER" });
  }

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await query(
    `UPDATE sge_pm_timer_ativo SET iniciado_em = ?, status = 'running', ultimo_heartbeat = ? WHERE usuario_id = ?`,
    [now, now, usuarioId]
  );
  return getTimerAtivo(usuarioId);
}

export async function stopTimer(usuarioId, comentario, actorId) {
  const timer = await getTimerAtivo(usuarioId);
  if (!timer) throw Object.assign(new Error("Nenhum cronômetro ativo"), { code: "NO_TIMER" });

  const duracaoMin = Math.max(1, Math.round(timer.elapsed_seconds / 60));
  const horaFim = nowTime();
  const startMin = Math.max(0, (parseTime(horaFim) ?? 0) - duracaoMin);
  const horaInicio = minutesToHHMM(startMin);

  const apontamento = await createApontamento(
    {
      demanda_id: timer.demanda_id,
      data: todayISO(),
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      duracao_minutos: duracaoMin,
      comentario: comentario ?? "Apontamento via cronômetro",
      tipo: "cronometro",
    },
    usuarioId,
    actorId
  );

  await query(`DELETE FROM sge_pm_timer_ativo WHERE usuario_id = ?`, [usuarioId]);

  await notifyGestor(
    timer.demanda_id,
    "Novo apontamento de horas",
    `${timer.demanda_codigo} — ${duracaoMin} min registrados via cronômetro`
  );

  return { apontamento, timer: null };
}

export async function syncTimer(usuarioId, elapsedSeconds) {
  const timer = await queryOne(`SELECT * FROM sge_pm_timer_ativo WHERE usuario_id = ?`, [usuarioId]);
  if (!timer) return null;

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  if (timer.status === "paused") {
    await query(
      `UPDATE sge_pm_timer_ativo SET acumulado_segundos = ?, ultimo_heartbeat = ? WHERE usuario_id = ?`,
      [elapsedSeconds, now, usuarioId]
    );
  } else {
    await query(
      `UPDATE sge_pm_timer_ativo SET ultimo_heartbeat = ? WHERE usuario_id = ?`,
      [now, usuarioId]
    );
  }
  return getTimerAtivo(usuarioId);
}

function parseTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHHMM(total) {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
