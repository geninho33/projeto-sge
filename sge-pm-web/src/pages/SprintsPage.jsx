import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "../api/client";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal, ModalActions } from "../components/ui/Modal";
import { StatusBadge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";

const STATUS_OPTS = [
  ["planejada", "Planejada"],
  ["em_andamento", "Em andamento"],
  ["concluida", "Concluída"],
];

export default function SprintsPage() {
  const [sprints, setSprints] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([apiJson("/sprint"), apiJson("/usuarios")]);
      setSprints(s.data);
      setUsuarios(u.data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ nome: "", objetivo: "", data_inicio: "", data_fim: "", status: "planejada", responsavel_id: "", capacity_points: 40 });
    setModal("create");
  };

  const openEdit = async (id) => {
    const { data } = await apiJson(`/sprint/${id}`);
    setForm({
      id: data.id,
      nome: data.nome || "",
      objetivo: data.objetivo || "",
      data_inicio: data.data_inicio?.slice(0, 10) || "",
      data_fim: data.data_fim?.slice(0, 10) || "",
      status: data.status || "planejada",
      responsavel_id: data.responsavel_id || "",
      capacity_points: data.capacity_points || 40,
      equipe_ids: (data.equipe || []).map((e) => e.id),
    });
    setModal("edit");
  };

  const save = async () => {
    if (!form.nome?.trim()) return setError("Nome da sprint é obrigatório");
    setSaving(true);
    try {
      const body = {
        ...form,
        responsavel_id: form.responsavel_id || null,
        equipe_ids: form.equipe_ids || [],
      };
      if (modal === "create") {
        await apiJson("/sprint", { method: "POST", body: JSON.stringify(body) });
      } else {
        await apiJson(`/sprint/${form.id}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setModal(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Sprints</h1>
          <p className="page-subtitle">Gerencie ciclos de entrega, equipe e progresso</p>
        </div>
        <Button onClick={openCreate}>Nova Sprint</Button>
      </header>

      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

      <div className="grid-cards">
        {sprints.map((s) => (
          <Card key={s.id} hover className="sprint-card">
            <CardHeader
              title={`Sprint ${s.numero} — ${s.nome}`}
              action={<StatusBadge value={s.status} label={STATUS_OPTS.find(([v]) => v === s.status)?.[1] || s.status} />}
            />
            <p className="sprint-card__obj">{s.objetivo || "Sem objetivo definido"}</p>
            <div className="sprint-card__stats">
              <div><strong>{s.percentual_conclusao ?? 0}%</strong><span>Conclusão</span></div>
              <div><strong>{s.points_alocados ?? 0}</strong><span>Pontos</span></div>
              <div><strong>{s.capacity_points ?? 0}</strong><span>Capacidade</span></div>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${s.percentual_conclusao ?? 0}%` }} />
            </div>
            <div className="sprint-card__actions">
              <Button size="sm" variant="ghost" onClick={() => openEdit(s.id)}>Editar</Button>
              <Link to={`/sprint-board?sprint=${s.id}`} className="ui-btn ui-btn--ghost ui-btn--sm">Ver board</Link>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "create" ? "Nova Sprint" : "Editar Sprint"}
        footer={<ModalActions onCancel={() => setModal(null)} onConfirm={save} loading={saving} />}
      >
        <div className="form-grid">
          <Input label="Nome" value={form.nome || ""} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Select label="Status" value={form.status || "planejada"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUS_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Input label="Início" type="date" value={form.data_inicio || ""} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} />
          <Input label="Término" type="date" value={form.data_fim || ""} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} />
          <Select label="Responsável" value={form.responsavel_id || ""} onChange={(e) => setForm({ ...form, responsavel_id: e.target.value })}>
            <option value="">—</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </Select>
          <Input label="Capacidade (pts)" type="number" value={form.capacity_points || 40} onChange={(e) => setForm({ ...form, capacity_points: Number(e.target.value) })} />
          <Textarea label="Objetivo" className="span-2" value={form.objetivo || ""} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
