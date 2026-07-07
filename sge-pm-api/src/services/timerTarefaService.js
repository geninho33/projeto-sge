import { query, queryOne } from "../db.js";
import { countApontamentos, setTarefaEmAndamento, recalcAtividadeFromTarefas } from "./tarefaStatus.js";

export async function getTimerTarefa(usuarioId) {
  const timer = await queryOne(
    `SELECT t.*, tar.titulo AS tarefa_titulo, tar.status AS tarefa_status,
            a.titulo AS atividade_titulo, d.codigo AS demanda_codigo
     FROM sge_pm_timer_tarefa t
     JOIN sge_pm_atividade_tarefa tar ON tar.id = t.tarefa_id
     JOIN sge_pm_atividade a ON a.id = t.atividade_id
     JOIN sge_pm_demanda d ON d.id = t.demanda_id
     WHERE t.usuario_id = ?`,
    [usuarioId]
  );
  if (!timer) return null;

  let elapsed = timer.acumulado_segundos ?? 0;
  if (timer.status === "running" && timer.iniciado_em) {
    const started = new Date(timer.iniciado_em.replace(" ", "T") + "Z").getTime();
    elapsed += Math.floor((Date.now() - started) / 1000);
  }
  return { ...timer, elapsed_seconds: elapsed };
}

export async function startTimerTarefa(usuarioId, tarefaId) {
  const tarefa = await queryOne(
    `SELECT t.id, t.atividade_id, a.demanda_id FROM sge_pm_atividade_tarefa t
     JOIN sge_pm_atividade a ON a.id = t.atividade_id WHERE t.id = ?`,
    [tarefaId]
  );
  if (!tarefa) throw Object.assign(new Error("Tarefa não encontrada"), { code: "NOT_FOUND" });

  const existing = await queryOne(`SELECT tarefa_id FROM sge_pm_timer_tarefa WHERE usuario_id = ?`, [usuarioId]);
  if (existing && existing.tarefa_id !== tarefaId) {
    throw Object.assign(new Error("Já existe um cronômetro ativo em outra tarefa"), { code: "TIMER_ACTIVE" });
  }

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await query(
    `INSERT INTO sge_pm_timer_tarefa (usuario_id, tarefa_id, atividade_id, demanda_id, iniciado_em, acumulado_segundos, status, ultimo_heartbeat)
     VALUES (?, ?, ?, ?, ?, 0, 'running', ?)
     ON CONFLICT(usuario_id) DO UPDATE SET
       tarefa_id = excluded.tarefa_id,
       atividade_id = excluded.atividade_id,
       demanda_id = excluded.demanda_id,
       iniciado_em = excluded.iniciado_em,
       acumulado_segundos = 0,
       status = 'running',
       ultimo_heartbeat = excluded.ultimo_heartbeat`,
    [usuarioId, tarefaId, tarefa.atividade_id, tarefa.demanda_id, now, now]
  );

  await setTarefaEmAndamento(tarefaId);
  await recalcAtividadeFromTarefas(tarefa.atividade_id);
  return getTimerTarefa(usuarioId);
}

export async function pauseTimerTarefa(usuarioId) {
  const timer = await getTimerTarefa(usuarioId);
  if (!timer || timer.status !== "running") {
    throw Object.assign(new Error("Nenhum cronômetro em execução"), { code: "NO_TIMER" });
  }
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await query(
    `UPDATE sge_pm_timer_tarefa SET acumulado_segundos = ?, status = 'paused', ultimo_heartbeat = ? WHERE usuario_id = ?`,
    [timer.elapsed_seconds, now, usuarioId]
  );
  return getTimerTarefa(usuarioId);
}

export async function resumeTimerTarefa(usuarioId) {
  const timer = await queryOne(`SELECT * FROM sge_pm_timer_tarefa WHERE usuario_id = ?`, [usuarioId]);
  if (!timer || timer.status !== "paused") {
    throw Object.assign(new Error("Cronômetro não está pausado"), { code: "NO_TIMER" });
  }
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await query(
    `UPDATE sge_pm_timer_tarefa SET iniciado_em = ?, status = 'running', ultimo_heartbeat = ? WHERE usuario_id = ?`,
    [now, now, usuarioId]
  );
  return getTimerTarefa(usuarioId);
}

export async function stopTimerTarefa(usuarioId, comentario) {
  const timer = await getTimerTarefa(usuarioId);
  if (!timer) throw Object.assign(new Error("Nenhum cronômetro ativo"), { code: "NO_TIMER" });

  const duracaoMin = Math.max(1, Math.round(timer.elapsed_seconds / 60));
  const now = new Date();
  const data = now.toISOString().slice(0, 10);
  const horaFim = now.toTimeString().slice(0, 5);
  const startDate = new Date(now.getTime() - timer.elapsed_seconds * 1000);
  const horaInicio = startDate.toTimeString().slice(0, 5);

  await query(
    `INSERT INTO sge_pm_apontamento_tarefa (tarefa_id, usuario_id, data, hora_inicio, hora_fim, duracao_minutos, comentario, tipo)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'cronometro')`,
    [timer.tarefa_id, usuarioId, data, horaInicio, horaFim, duracaoMin, comentario ?? null]
  );

  await setTarefaEmAndamento(timer.tarefa_id);
  await query(`DELETE FROM sge_pm_timer_tarefa WHERE usuario_id = ?`, [usuarioId]);
  const calc = await recalcAtividadeFromTarefas(timer.atividade_id);
  return { duracao_minutos: duracaoMin, timer: null, ...calc };
}

export async function createApontamentoTarefa(tarefaId, usuarioId, body) {
  const { quantidade_horas, data, hora_inicio, hora_fim, comentario, tipo = "manual" } = body;

  let duracao;
  let dataLancamento;
  let inicio;
  let fim;

  if (quantidade_horas !== undefined && quantidade_horas !== null && quantidade_horas !== "") {
    const horas = Number(String(quantidade_horas).replace(",", "."));
    if (!Number.isFinite(horas) || horas <= 0) {
      throw Object.assign(new Error("Informe uma quantidade de horas válida"), { code: "VALIDATION_ERROR" });
    }
    duracao = Math.max(1, Math.round(horas * 60));
    const now = new Date();
    dataLancamento = now.toISOString().slice(0, 10);
    inicio = "00:00";
    const endH = Math.floor(duracao / 60);
    const endM = duracao % 60;
    fim = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  } else {
    const start = hora_inicio?.split(":").map(Number);
    const end = hora_fim?.split(":").map(Number);
    duracao = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    if (duracao <= 0) throw Object.assign(new Error("Horários inválidos"), { code: "VALIDATION_ERROR" });
    dataLancamento = data;
    inicio = hora_inicio;
    fim = hora_fim;
  }

  const tarefa = await queryOne(`SELECT atividade_id FROM sge_pm_atividade_tarefa WHERE id = ?`, [tarefaId]);
  if (!tarefa) throw Object.assign(new Error("Tarefa não encontrada"), { code: "NOT_FOUND" });

  const wasFirst = (await countApontamentos(tarefaId)) === 0;

  await query(
    `INSERT INTO sge_pm_apontamento_tarefa (tarefa_id, usuario_id, data, hora_inicio, hora_fim, duracao_minutos, comentario, tipo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [tarefaId, usuarioId, dataLancamento, inicio, fim, duracao, comentario ?? null, tipo]
  );

  if (wasFirst) await setTarefaEmAndamento(tarefaId);
  const calc = await recalcAtividadeFromTarefas(tarefa.atividade_id);
  const apontamentos = await query(
    `SELECT ap.*, u.nome AS usuario_nome FROM sge_pm_apontamento_tarefa ap
     JOIN sge_pm_usuario u ON u.id = ap.usuario_id WHERE ap.tarefa_id = ? ORDER BY ap.id DESC`,
    [tarefaId]
  );
  return { duracao_minutos: duracao, apontamentos, ...calc };
}
