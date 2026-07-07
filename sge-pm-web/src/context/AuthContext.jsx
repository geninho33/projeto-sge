import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiJson, clearToken, getToken, setToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await apiJson("/auth/me");
      setUser(data);
      return data;
    } catch {
      clearToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email, senha, lembrar = false) => {
    const { data } = await apiJson("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha, lembrar }),
    });
    setToken(data.token, lembrar);
    const me = await loadUser();
    return me || data.user;
  }, [loadUser]);

  const logout = useCallback(async () => {
    try {
      await apiJson("/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, isAuthenticated: !!user }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
