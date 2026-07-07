import { query } from "../db.js";

export async function logHistorico(entidade, entidadeId, usuarioId, acao, detalhes = null) {
  const detalhesStr = detalhes ? (typeof detalhes === "string" ? detalhes : JSON.stringify(detalhes)) : null;
  await query(
    `INSERT INTO sge_pm_historico (entidade, entidade_id, usuario_id, acao, detalhes) VALUES (?, ?, ?, ?, ?)`,
    [entidade, String(entidadeId), usuarioId ?? null, acao, detalhesStr]
  );
}

export async function getHistorico(entidade, entidadeId) {
  return query(
    `SELECT h.*, u.nome AS usuario_nome
     FROM sge_pm_historico h
     LEFT JOIN sge_pm_usuario u ON u.id = h.usuario_id
     WHERE h.entidade = ? AND h.entidade_id = ?
     ORDER BY h.created_at DESC
     LIMIT 50`,
    [entidade, String(entidadeId)]
  );
}
