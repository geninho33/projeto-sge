import { useEffect, useMemo, useState } from "react";
import { apiJson } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EditModalFooter } from "../components/ui/EditModalFooter";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import { Can } from "../components/permission/Can";
import { P } from "../hooks/usePermission";

function PermissionTree({ structure, actions, permissoes, onChange, onApplyGroup }) {
  const [expanded, setExpanded] = useState(() => Object.fromEntries(structure.map((g) => [g.grupo, true])));

  const toggleGroup = (grupo) => setExpanded((e) => ({ ...e, [grupo]: !e[grupo] }));

  const groupLevel = (grupo) => {
    const g = structure.find((x) => x.grupo === grupo);
    if (!g?.itens.length) return 0;
    return Math.min(...g.itens.map((i) => permissoes[i.key] ?? 0));
  };

  const setGroupLevel = (grupo, nivel) => {
    onApplyGroup(grupo, nivel);
  };

  return (
    <div className="perm-tree">
      {structure.map((grupo) => {
        const open = expanded[grupo.grupo];
        const gl = groupLevel(grupo.grupo);
        return (
          <div key={grupo.grupo} className="perm-tree__group">
            <div className="perm-tree__group-head">
              <button type="button" className="perm-tree__toggle" onClick={() => toggleGroup(grupo.grupo)}>
                {open ? "▾" : "▸"} {grupo.grupo}
              </button>
              <div className="perm-tree__group-actions">
                <select
                  className="ui-input ui-select perm-tree__group-select"
                  value={gl}
                  onChange={(e) => setGroupLevel(grupo.grupo, Number(e.target.value))}
                  title="Aplicar nível a todos os itens do grupo"
                >
                  {actions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
            {open && (
              <ul className="perm-tree__items">
                {grupo.itens.map((item) => (
                  <li key={item.key} className="perm-tree__item">
                    <div className="perm-tree__item-label">
                      <span className="perm-tree__item-icon">{item.icon}</span>
                      <div>
                        <strong>{item.label}</strong>
                        <small className="text-muted">{item.path}</small>
                      </div>
                    </div>
                    <select
                      className="ui-input ui-select"
                      value={permissoes[item.key] ?? 0}
                      onChange={(e) => onChange(item.key, Number(e.target.value))}
                    >
                      {actions.map((a) => (
                        <option key={a.value} value={a.value} title={a.short}>{a.label}</option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PerfisPage() {
  const [perfis, setPerfis] = useState([]);
  const [menuPayload, setMenuPayload] = useState(null);
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
      setMenuPayload(m.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const structure = menuPayload?.structure || [];
  const actions = menuPayload?.actions || menuPayload?.niveis || [];

  const openEdit = async (perfil) => {
    if (perfil?.id) {
      const { data } = await apiJson(`/perfis/${perfil.id}`);
      setEdit({ ...data, permissoes: data.permissoes || {} });
    } else {
      const empty = {};
      for (const g of structure) for (const i of g.itens) empty[i.key] = 0;
      setEdit({ codigo: "", nome: "", descricao: "", ativo: 1, permissoes: empty });
    }
  };

  const setPerm = (key, nivel) => {
    setEdit((e) => ({ ...e, permissoes: { ...e.permissoes, [key]: nivel } }));
  };

  const applyGrupo = (grupo, nivel) => {
    const g = structure.find((x) => x.grupo === grupo);
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

  const filtered = useMemo(
    () => perfis.filter((p) => !q || p.nome.toLowerCase().includes(q.toLowerCase()) || p.codigo.includes(q.toLowerCase())),
    [perfis, q]
  );

  if (loading) return <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Perfis de Usuários</h1>
          <p className="page-subtitle">Permissões alinhadas à estrutura do menu do sistema</p>
        </div>
        <Can menuKey="admin_perfis" level={P.CREATE}>
          <Button onClick={() => openEdit(null)}>Novo Perfil</Button>
        </Can>
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
            <Can menuKey="admin_perfis" level={P.UPDATE}>
              <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>Configurar permissões</Button>
            </Can>
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
            <p className="text-muted perm-tree__hint">
              Níveis hierárquicos: consulta inclui ver menu/tela; níveis superiores incluem os anteriores.
            </p>
            <PermissionTree
              structure={structure}
              actions={actions}
              permissoes={edit.permissoes || {}}
              onChange={setPerm}
              onApplyGroup={applyGrupo}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
