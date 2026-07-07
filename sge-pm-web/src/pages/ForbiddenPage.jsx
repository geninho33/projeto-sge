import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function ForbiddenPage({ menuKey }) {
  return (
    <div className="page page--centered">
      <Card className="forbidden-card">
        <div className="forbidden-card__icon" aria-hidden>🔒</div>
        <h1 className="page-title">Acesso negado</h1>
        <p className="text-muted">
          Você não tem permissão para acessar esta área
          {menuKey ? ` (${menuKey})` : ""}.
          Entre em contato com o administrador do sistema.
        </p>
        <Button as={Link} to="/">Voltar ao início</Button>
      </Card>
    </div>
  );
}
