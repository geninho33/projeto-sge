let apiBase = "/api/v1";
let authHeaders = () => ({});

export function setApiBase(base) {
  apiBase = base;
}

export function setAuthHeaders(fn) {
  authHeaders = fn;
}

export async function apiJson(path, options = {}) {
  const res = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders(), ...options.headers },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error?.message || res.statusText);
  return body;
}
