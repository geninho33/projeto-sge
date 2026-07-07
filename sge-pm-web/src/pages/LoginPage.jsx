import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const validate = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Informe um e-mail válido";
    }
    if (!senha) return "Informe a senha";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), senha, lembrar);
      navigate("/", { replace: true });
    } catch (ex) {
      setError(ex.message || "Falha na autenticação");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return setError("Informe o e-mail para recuperação");
    setError(null);
    try {
      const { data } = await apiJson("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      setInfo(data.message);
      setForgotOpen(false);
    } catch (ex) {
      setError(ex.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__brand">
        <div className="login-page__brand-inner">
          <img src="/logo-16flow.png" alt="16Flow" className="login-page__logo-img" />
          <h1><span className="brand-16">16</span><span className="brand-flow">flow</span></h1>
          <p>Gestão de demandas e apontamento de horas com rastreabilidade completa.</p>
          <ul className="login-page__features">
            <li>Cronômetro integrado com sincronização em tempo real</li>
            <li>Minhas demandas com controle de progresso</li>
            <li>Dashboard gerencial para acompanhamento da equipe</li>
          </ul>
        </div>
      </div>

      <div className="login-page__form-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <img src="/logo-16flow.png" alt="" className="login-card__logo" aria-hidden />
          <h2>Bem-vindo ao <span className="brand-16">16</span><span className="brand-flow">flow</span></h2>
          <p className="login-card__subtitle">Use seu e-mail corporativo para acessar</p>

          {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
          {info && <Alert type="success" onClose={() => setInfo(null)}>{info}</Alert>}

          {!forgotOpen ? (
            <>
              <Input
                label="E-mail"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
              />
              <div className="login-password">
                <Input
                  label="Senha"
                  type={showSenha ? "text" : "password"}
                  name="senha"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="login-password__toggle"
                  onClick={() => setShowSenha((v) => !v)}
                >
                  {showSenha ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              <div className="login-card__options">
                <label className="ui-checkbox">
                  <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
                  Lembrar-me
                </label>
                <button type="button" className="link-btn" onClick={() => { setForgotOpen(true); setForgotEmail(email); }}>
                  Esqueci minha senha
                </button>
              </div>

              <Button type="submit" loading={loading} className="login-card__submit">
                Entrar
              </Button>

              <p className="login-card__hint">
                Ambiente de desenvolvimento: <code>gestor@sge.local</code> / <code>Sge@2026</code>
              </p>
            </>
          ) : (
            <>
              <p>Informe seu e-mail para receber instruções de recuperação.</p>
              <Input
                label="E-mail"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <div className="login-card__forgot-actions">
                <Button variant="ghost" onClick={() => setForgotOpen(false)}>Voltar</Button>
                <Button onClick={handleForgot}>Enviar</Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
