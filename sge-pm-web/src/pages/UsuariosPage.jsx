import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal, ModalActions } from "../components/ui/Modal";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";

const PERFIL_LABEL = {
  gestor: "Gestor",
  tech_lead: "Tech Lead",
  dev_front: "Dev Frontend",
  dev_back: "Dev Backend",
  qa: "QA",
};

const PERFIS = Object.entries(PERFIL_LABEL);

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ incluir_inativos: "true" });
      if (q) params.set("q", q);
      const { data } = await apiJson(`/usuarios?${params}`);
      setUsuarios(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ nome: "", email: "", cargo: "", perfil: "dev_front", ativo: 1, senha: "" });
    setModal("create");
  };

  const openEdit = (u) => {
    setForm({ ...u, senha: "" });
    setModal("edit");
  };

  const save = async () => {
    if (!form.nome?.trim() || !form.email?.trim()) return setError("Nome e e-mail são obrigatórios");
    setSaving(true);
    try {
      const body = { nome: form.nome, email: form.email, cargo: form.cargo, perfil: form.perfil, ativo: form.ativo ? 1 : 0 };
      if (form.senha) body.senha = form.senha;
      if (modal === "create") {
        if (!form.senha) return setError("Senha obrigatória no cadastro");
        await apiJson("/usuarios", { method: "POST", body: JSON.stringify(body) });
      } else {
        await apiJson(`/usuarios/${form.id}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setModal(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id) => {
    if (!confirm("Inativar este usuário?")) return;
    await apiJson(`/usuarios/${id}`, { method: "DELETE" });
    load();
  };

  if (loading && !usuarios.length) return <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">Cadastro, perfis e controle de acesso</p>
        </div>
        <Button onClick={openCreate}>Novo Usuário</Button>
      </header>

      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

      <Card className="toolbar-card">
        <Input placeholder="Buscar por nome, e-mail ou cargo..." value={q} onChange={(e) => setQ(e.target.value)} />
      </Card>

      <Card>
        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Operações</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Cargo</th>
                <th>Perfil</th>
                <th>Situação</th>
                <th>Criação</th>
                <th>Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className={!u.ativo ? "row-muted" : ""}>
                  <td className="table-actions">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>Editar</Button>
                    {u.ativo ? (
                      <Button size="sm" variant="danger" onClick={() => deactivate(u.id)}>Inativar</Button>
                    ) : null}
                  </td>
                  <td><strong>{u.nome}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.cargo || "—"}</td>
                  <td>{PERFIL_LABEL[u.perfil] || u.perfil}</td>
                  <td>{u.ativo ? "Ativo" : "Inativo"}</td>
                  <td>{u.created_at?.slice(0, 10) || "—"}</td>
                  <td>{u.ultimo_acesso?.slice(0, 16) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "create" ? "Novo Usuário" : "Editar Usuário"}
        footer={<ModalActions onCancel={() => setModal(null)} onConfirm={save} loading={saving} />}
      >
        <div className="form-grid">
          <Input label="Nome" value={form.nome || ""} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Input label="E-mail" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Cargo" value={form.cargo || ""} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
          <Select label="Perfil" value={form.perfil || "dev_front"} onChange={(e) => setForm({ ...form, perfil: e.target.value })}>
            {PERFIS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Input
            label={modal === "create" ? "Senha" : "Nova senha (opcional)"}
            type="password"
            value={form.senha || ""}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
          <label className="ui-checkbox">
            <input type="checkbox" checked={!!form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked ? 1 : 0 })} />
            Usuário ativo
          </label>
        </div>
      </Modal>
    </div>
  );
}
