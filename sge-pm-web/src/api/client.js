import { withBase } from "../utils/basePath";

const TOKEN_KEY = "sge_pm_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token, remember = false) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  if (token) {
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiJson(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(withBase(`/api${path}`), { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.error?.message || res.statusText || `Erro HTTP ${res.status}`);
    err.code = body?.error?.code;
    err.status = res.status;
    err.pending = body?.error?.pending;
    throw err;
  }
  return body;
}

export async function apiUpload(path, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(withBase(`/api${path}`), { method: "POST", headers, body: formData });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.error?.message || res.statusText || `Erro HTTP ${res.status}`);
    err.code = body?.error?.code;
    err.status = res.status;
    throw err;
  }
  return body;
}
