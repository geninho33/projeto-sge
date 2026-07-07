/** Garante valor iterável — API antiga podia retornar objeto único em vez de array. */
export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}
