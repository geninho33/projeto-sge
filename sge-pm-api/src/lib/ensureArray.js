export function ensureArray(rows) {
  if (Array.isArray(rows)) return rows;
  if (rows == null) return [];
  return [rows];
}
