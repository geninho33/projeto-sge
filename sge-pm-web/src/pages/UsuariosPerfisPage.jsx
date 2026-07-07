import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiJson, apiUpload } from "../api/client";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EditModalFooter } from "../components/ui/EditModalFooter";
import { MultiSelect } from "../components/ui/MultiSelect";
import { Avatar } from "../components/ui/Avatar";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import { SortableTh } from "../components/ui/SortableTh";

export default function UsuariosPerfisPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [perfisCatalog, setPerfisCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [q, setQ] = useState("");
  const [perfilFilter, setPerfilFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [sort, setSort] = useState("nome");
  const [order, setOrder] = useState("asc");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef(null);
  const debouncedQ = useDebouncedValue(q);

  const perfilLabel = useMemo(
    () => Object.fromEntries(perfisCatalog.map((p) => [p.id, p.label])),
    [perfisCatalog]
  );

  const defaultPerfil = perfisCatalog.find((p) => p.id === "desenvolvedor")?.id || perfisCatalog[0]?.id || "";

  const loadPerfis = useCallback(async () => {
    const { data } = await apiJson("/perfis");
    setPerfisCatalog(
      data
        .filter((p) => p.ativo)
        .map((p) => ({ id: p.codigo, label: p.nome }))
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ incluir_inativos: "true" });
      if (debouncedQ) params.set("q", debouncedQ);
      if (perfilFilter) params.set("perfil", perfilFilter);
      const { data } = await apiJson(`/usuarios?${params}`);
      setUsuarios(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, perfilFilter]);

  useEffect(() => {
    loadPerfis().catch((e) => setError(e.message));
  }, [loadPerfis]);

  useEffect(() => { load(); }, [load]);

  const sorted = useMemo(() => {
    const list = [...usuarios];
    list.sort((a, b) => {
      const av = (a[sort] ?? "").toString().toLowerCase();
      const bv = (b[sort] ?? "").toString().toLowerCase();
      return order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [usuarios, sort, order]);

  const handleSort = (field) => {
    if (sort === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSort(field); setOrder("asc"); }
  };

  const openCreate = () => {
    setForm({ nome: "", email: "", cargo: "", perfis: defaultPerfil ? [defaultPerfil] : [], ativo: 1, senha: "" });
    setAvatarPreview(null);
    setModal("create");
  };

  const openEdit = (u) => {
    setForm({
      ...u,
      perfis: Array.isArray(u.perfis) && u.perfis.length ? u.perfis : (u.perfil ? [u.perfil] : []),
      senha: "",
    });
    setAvatarPreview(u.avatar_url || null);
    setModal("edit");
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setError("Imagem muito grande (máx. 2MB)");
    setAvatarPreview(URL.createObjectURL(file));

    if (form.id) {
      try {
        const fd = new FormData();
        fd.append("avatar", file);
        const r = await apiUpload(`/usuarios/${form.id}/avatar`, fd);
        setForm((prev) => ({ ...prev, avatar_url: r.data.avatar_url }));
        setAvatarPreview(r.data.avatar_url);
        setSuccess("Avatar atualizado.");
        load();
      } catch (err) { setError(err.message); }
    }
  };

  const save = async (keepOpen = false) => {
    if (!form.nome?.trim() || !form.email?.trim()) return setError("Nome e e-mail são obrigatórios");
    if (!(form.perfis || []).length) return setError("Selecione ao menos um perfil");
    setSaving(true);
    try {
      const body = {
        nome: form.nome,
        email: form.email,
        cargo: form.cargo,
        perfil: form.perfis[0],
        perfis: form.perfis,
        ativo: form.ativo ? 1 : 0,
      };
      if (form.senha) body.senha = form.senha;
      if (modal === "create") {
        if (!form.senha) return setError("Senha obrigatória no cadastro");
        await apiJson("/usuarios", { method: "POST", body: JSON.stringify(body) });
      } else {
        await apiJson(`/usuarios/${form.id}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setSuccess(modal === "create" ? "Usuário criado com sucesso." : "Usuário atualizado com sucesso.");
      await load();
      if (!keepOpen) setModal(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id) => {
    if (!confirm("Inativar este usuário?")) return;
    await apiJson(`/usuarios/${id}`, { method: "DELETE" });
    setSuccess("Usuário inativado.");
    load();
  };

  if ((loading && !usuarios.length) || !perfisCatalog.length) return <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">Cadastro e gestão de usuários do sistema</p>
        </div>
        <Button onClick={openCreate}>Novo Usuário</Button>
      </header>

      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="data-grid-card">
        <div className="toolbar-card" style={{ border: "none", boxShadow: "none", padding: "0 0 1rem" }}>
          <div className="toolbar-row">
            <Input placeholder="Buscar nome, e-mail ou cargo..." value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={perfilFilter} onChange={(e) => setPerfilFilter(e.target.value)}>
              <option value="">Todos os perfis</option>
              {perfisCatalog.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </Select>
          </div>
        </div>
        <div className="table-wrap">
          <table className="ui-table ui-table--hover">
            <thead>
              <tr>
                <th>Operações</th>
                <th style={{ width: 44 }} />
                <SortableTh label="Nome" field="nome" sort={sort} order={order} onSort={handleSort} />
                <SortableTh label="E-mail" field="email" sort={sort} order={order} onSort={handleSort} />
                <SortableTh label="Cargo" field="cargo" sort={sort} order={order} onSort={handleSort} />
                <th>Perfis</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => {
                const perfisArr = Array.isArray(u.perfis) && u.perfis.length ? u.perfis : (u.perfil ? [u.perfil] : []);
                return (
                  <tr key={u.id} className={!u.ativo ? "row-muted" : ""}>
                    <td className="table-actions">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>Editar</Button>
                      {u.ativo ? <Button size="sm" variant="danger" onClick={() => deactivate(u.id)}>Inativar</Button> : null}
                    </td>
                    <td><Avatar name={u.nome} src={u.avatar_url} size={32} /></td>
                    <td><strong>{u.nome}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.cargo || "—"}</td>
                    <td>
                      <div className="perfis-badges">
                        {perfisArr.map((p) => (
                          <span key={p} className="perfil-badge">{perfilLabel[p] || p}</span>
                        ))}
                      </div>
                    </td>
                    <td>{u.ativo ? <span className="status-dot status-dot--active">Ativo</span> : <span className="status-dot status-dot--inactive">Inativo</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "create" ? "Novo Usuário" : "Editar Usuário"}
        size="lg"
        footer={(
          <EditModalFooter
            onCancel={() => setModal(null)}
            onSave={() => save(false)}
            onSaveContinue={() => save(true)}
            saving={saving}
            showSaveContinue={modal === "edit"}
          />
        )}
      >
        <div className="user-form">
          <div className="user-form__avatar-section">
            <div className="user-form__avatar-wrapper" onClick={() => fileRef.current?.click()}>
              <Avatar name={form.nome} src={avatarPreview} size={80} />
              <span className="user-form__avatar-overlay">📷</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            <p className="text-muted" style={{ fontSize: "0.75rem", textAlign: "center" }}>
              {form.id ? "Clique para alterar" : "Salve o usuário para enviar a foto"}
            </p>
          </div>

          <div className="user-form__fields">
            <div className="user-form__grid">
              <Input label="Nome" required value={form.nome || ""} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <Input label="E-mail" type="email" required value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Cargo" value={form.cargo || ""} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
              <Input
                label={modal === "create" ? "Senha" : "Nova senha (opcional)"}
                type="password"
                value={form.senha || ""}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
              />
            </div>

            <MultiSelect
              label="Perfis"
              required
              options={perfisCatalog}
              value={form.perfis || []}
              onChange={(ids) => setForm({ ...form, perfis: ids })}
              getOptionValue={(o) => o.id}
              getOptionLabel={(o) => o.label}
              getOptionGroup={() => ""}
              placeholder="Buscar perfil..."
            />

            <label className="ui-checkbox" style={{ marginTop: "0.75rem" }}>
              <input type="checkbox" checked={!!form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked ? 1 : 0 })} />
              Usuário ativo
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
