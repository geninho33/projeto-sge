import { useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EditModalFooter } from "../components/ui/EditModalFooter";
import { Alert } from "../components/ui/Alert";
import { CORES_TIPO } from "../constants/cores";

const CORES_LIST = Object.entries(CORES_TIPO);

export default function TiposAtividadePage() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  const load = () => {
    apiJson("/tipos-atividade")
      .then((r) => setTipos(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (edit.id) await apiJson(`/tipos-atividade/${edit.id}`, { method: "PUT", body: JSON.stringify(edit) });
      else await apiJson("/tipos-atividade", { method: "POST", body: JSON.stringify(edit) });
      setSuccess("Tipo salvo.");
      setEdit(null);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const filtered = tipos.filter((t) => !q || t.nome.toLowerCase().includes(q.toLowerCase()) || t.codigo.includes(q.toUpperCase()));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Tipos de Atividade</h1>
          <p className="page-subtitle">Classificação visual das atividades no Kanban e cards</p>
        </div>
        <Button onClick={() => setEdit({ codigo: "", nome: "", cor: "azul", ativo: 1 })}>Novo Tipo</Button>
      </header>
      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="toolbar-card"><Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} /></Card>

      <div className="grid-cards">
        {filtered.map((t) => (
          <Card key={t.id} hover className="tipo-card" style={{ borderLeftColor: CORES_TIPO[t.cor] || CORES_TIPO.azul }}>
            <div className="tipo-card__icon" style={{ background: CORES_TIPO[t.cor] }}>{t.icone || "◆"}</div>
            <div>
              <strong>{t.nome}</strong>
              <div><code>{t.codigo}</code></div>
              <p className="text-muted">{t.descricao || "—"}</p>
              <Button size="sm" variant="ghost" onClick={() => setEdit({ ...t })}>Editar</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Editar Tipo" : "Novo Tipo"} size="lg"
        footer={<EditModalFooter onCancel={() => setEdit(null)} onSave={save} saving={saving} showSaveContinue={false} />}>
        {edit && (
          <div className="form-grid">
            <Input label="Código" value={edit.codigo || ""} onChange={(e) => setEdit({ ...edit, codigo: e.target.value.toUpperCase() })} />
            <Input label="Nome" value={edit.nome || ""} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} />
            <Input label="Ícone (emoji)" value={edit.icone || ""} onChange={(e) => setEdit({ ...edit, icone: e.target.value })} />
            <Select label="Cor" value={edit.cor || "azul"} onChange={(e) => setEdit({ ...edit, cor: e.target.value })}>
              {CORES_LIST.map(([id, hex]) => <option key={id} value={id}>{id}</option>)}
            </Select>
            <div className="span-2 color-preview" style={{ background: CORES_TIPO[edit.cor] }}>Pré-visualização</div>
            <Textarea label="Descrição" className="span-2" value={edit.descricao || ""} onChange={(e) => setEdit({ ...edit, descricao: e.target.value })} />
          </div>
        )}
      </Modal>
    </div>
  );
}
