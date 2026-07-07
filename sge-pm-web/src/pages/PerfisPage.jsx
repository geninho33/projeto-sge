import { useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EditModalFooter } from "../components/ui/EditModalFooter";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";

const NIVEL_LABEL = ["Sem acesso", "Consulta", "Inclusão", "Alteração", "Exclusão", "Aprovação", "Admin total"];

export default function PerfisPage() {
  const [perfis, setPerfis] = useState([]);
  const [menus, setMenus] = useState([]);
  const [niveis, setNiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([apiJson("/perfis"), apiJson("/perfis/menus")]);
      setPerfis(p.data);
      setMenus(m.data.structure);
      setNiveis(m.data.niveis);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = async (perfil) => {
    if (perfil?.id) {
      const { data } = await apiJson(`/perfis/${perfil.id}`);
      setEdit({ ...data, permissoes: data.permissoes || {} });
    } else {
      setEdit({ codigo: "", nome: "", descricao: "", ativo: 1, permissoes: {} });
    }
  };

  const setPerm = (key, nivel) => {
    setEdit((e) => ({ ...e, permissoes: { ...e.permissoes, [key]: nivel } }));
  };

  const applyGrupo = (grupo, nivel) => {
    const g = menus.find((x) => x.grupo === grupo);
    if (!g) return;
    const perms = { ...edit.permissoes };
    for (const item of g.itens) perms[item.key] = nivel;
    setEdit({ ...edit, permissoes: perms });
  };

  const save = async () => {
    setSaving(true);
    try {
      if (edit.id) await apiJson(`/perfis/${edit.id}`, { method: "PUT", body: JSON.stringify(edit) });
      else await apiJson("/perfis", { method: "POST", body: JSON.stringify(edit) });
      setSuccess("Perfil salvo.");
      setEdit(null);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  const filtered = perfis.filter((p) => !q || p.nome.toLowerCase().includes(q.toLowerCase()) || p.codigo.includes(q.toLowerCase()));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Perfis de Usuários</h1>
          <p className="page-subtitle">Controle de permissões baseado na estrutura de menus</p>
        </div>
        <Button onClick={() => openEdit(null)}>Novo Perfil</Button>
      </header>
      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="toolbar-card"><Input placeholder="Buscar perfil..." value={q} onChange={(e) => setQ(e.target.value)} /></Card>

      <div className="grid-cards">
        {filtered.map((p) => (
          <Card key={p.id} hover>
            <div className="demanda-card__head">
              <strong>{p.nome}</strong>
              <span className={`ui-badge ui-badge--${p.ativo ? "success" : "neutral"}`}>{p.ativo ? "Ativo" : "Inativo"}</span>
            </div>
            <code className="code-cell">{p.codigo}</code>
            <p className="text-muted" style={{ margin: "0.5rem 0" }}>{p.descricao || "Sem descrição"}</p>
            <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>Configurar permissões</Button>
          </Card>
        ))}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? `Perfil: ${edit.nome}` : "Novo Perfil"} size="xl"
        footer={<EditModalFooter onCancel={() => setEdit(null)} onSave={save} saving={saving} showSaveContinue={false} />}>
        {edit && (
          <>
            <div className="form-grid" style={{ marginBottom: "1rem" }}>
              <Input label="Código" value={edit.codigo || ""} disabled={!!edit.id} onChange={(e) => setEdit({ ...edit, codigo: e.target.value })} />
              <Input label="Nome" value={edit.nome || ""} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} />
              <Textarea label="Descrição" className="span-2" value={edit.descricao || ""} onChange={(e) => setEdit({ ...edit, descricao: e.target.value })} />
            </div>
            {menus.map((grupo) => (
              <div key={grupo.grupo} className="perm-group">
                <div className="perm-group__head">
                  <strong>{grupo.grupo}</strong>
                  <div className="filter-chips">
                    {[1, 3, 6].map((n) => (
                      <Button key={n} size="sm" variant="ghost" onClick={() => applyGrupo(grupo.grupo, n)}>{NIVEL_LABEL[n]}</Button>
                    ))}
                  </div>
                </div>
                <table className="ui-table ui-table--compact">
                  <thead><tr><th>Menu</th><th>Permissão</th></tr></thead>
                  <tbody>
                    {grupo.itens.map((item) => (
                      <tr key={item.key}>
                        <td>{item.label}</td>
                        <td>
                          <select className="ui-input ui-select" value={edit.permissoes?.[item.key] ?? 0} onChange={(e) => setPerm(item.key, Number(e.target.value))}>
                            {NIVEL_LABEL.map((l, i) => <option key={i} value={i}>{l}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
      </Modal>
    </div>
  );
}
