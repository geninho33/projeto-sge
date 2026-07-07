import { createContext, useContext, useEffect, useState } from "react";
import { setApiBase, setAuthHeaders } from "sge-ui";

const AuthContext = createContext(null);
const SgeContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("sge_token"));
  const [user, setUser] = useState(null);
  const [context, setContext] = useState(() => ({
    ano: localStorage.getItem("sge_ano") || "2026",
    ue: localStorage.getItem("sge_ue") || "8105",
  }));

  useEffect(() => {
    setApiBase("/api/v1");
    setAuthHeaders(() => {
      const h = {
        "X-SGE-Ano": context.ano,
        "X-SGE-UE": context.ue,
        "X-SGE-Prefeitura": "8105",
      };
      if (token) h.Authorization = `Bearer ${token}`;
      return h;
    });
  }, [token, context]);

  const login = async (usuario, senha) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha, ano: context.ano, ue: context.ue }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error?.message || "Falha no login");
    setToken(body.data.access_token);
    setUser({ nome: usuario });
    localStorage.setItem("sge_token", body.data.access_token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sge_token");
  };

  const updateContext = (ctx) => {
    setContext(ctx);
    localStorage.setItem("sge_ano", ctx.ano);
    localStorage.setItem("sge_ue", ctx.ue);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      <SgeContext.Provider value={{ context, updateContext }}>
        {children}
      </SgeContext.Provider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useSgeContext = () => useContext(SgeContext);
