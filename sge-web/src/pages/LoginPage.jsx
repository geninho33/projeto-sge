import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState("admin");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(usuario, senha || "dev");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="sge-login">
      <form className="sge-login-card" onSubmit={handleSubmit}>
        <h1>SGE — Login</h1>
        <p className="sge-hint">Modo desenvolvimento — qualquer senha aceita</p>
        <label>
          Usuário
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        {error && <div className="sge-error">{error}</div>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
