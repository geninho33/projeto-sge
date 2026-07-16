/** Base pública do app (ex.: "/16flow/" em produção, "/" em dev). */
export function appBasePath() {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

/** Prefixo absoluto para assets e APIs sob o base path. */
export function withBase(path = "") {
  const base = appBasePath();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}` || p;
}
