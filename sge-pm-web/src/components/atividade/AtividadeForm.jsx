import { Input, Select, Textarea } from "../ui/Input";
import { MultiSelect } from "../ui/MultiSelect";
import { Alert } from "../ui/Alert";
import { FASES_LABEL } from "../../constants/cores";

const FORM_TABS = [
  { id: "dados", label: "Dados" },
  { id: "detalhes", label: "Detalhes" },
];
export function AtividadeForm({
  form,
  setForm,
  projetos,
  tipos,
  usuarios,
  backlogs,
  projetoId,
  activeTab,
  onTabChange,
  errors = {},
}) {
  const backlogOptions = backlogs.map((b) => ({
    id: b.id,
    label: `${b.codigo} — ${b.titulo}`,
    group: b.projeto_nome || "Sem projeto",
  }));

  const fieldError = (key) => errors[key] ? <span className="ui-field__error">{errors[key]}</span> : null;

  return (
    <div className="atividade-form">
      <nav className="tab-bar tab-bar--modal">
        {FORM_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-bar__item${activeTab === t.id ? " active" : ""}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {activeTab === "dados" && (
        <>
          <section className="atividade-form__section">
            <h3 className="atividade-form__section-title"><span className="section-icon">📋</span> Identificação</h3>
            <div className="atividade-form__grid">
              <div className="span-2">
                <Input
                  label="Título"
                  required
                  value={form.titulo || ""}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Descreva brevemente a atividade"
                  className={errors.titulo ? "ui-input--error" : ""}
                />
                {fieldError("titulo")}
              </div>
              <Select
                label="Projeto"
                required
                value={form.projeto_id ?? projetoId ?? ""}
                disabled
              >
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>
                ))}
              </Select>
              <div>
                <Select
                  label="Tipo de Atividade"
                  required
                  value={form.tipo_atividade_id || ""}
                  onChange={(e) => setForm({ ...form, tipo_atividade_id: Number(e.target.value) })}
                >
                  <option value="">Selecione...</option>
                  {tipos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </Select>
                {fieldError("tipo_atividade_id")}
              </div>
            </div>
          </section>

          <section className="atividade-form__section">
            <h3 className="atividade-form__section-title"><span className="section-icon">📅</span> Planejamento</h3>
            <div className="atividade-form__grid">
              <div>
                <Select
                  label="Fase"
                  required
                  value={form.fase || ""}
                  onChange={(e) => setForm({ ...form, fase: e.target.value })}
                >
                  {Object.entries(FASES_LABEL).filter(([k]) => k !== "cancelada").map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
                {fieldError("fase")}
              </div>
              <div>
                <Input
                  label="Prazo"
                  required
                  type="date"
                  value={form.data_prevista_termino?.slice(0, 10) || ""}
                  onChange={(e) => setForm({ ...form, data_prevista_termino: e.target.value })}
                />
                {fieldError("data_prevista_termino")}
              </div>
              <div className="span-2">
                <Select
                  label="Usuário Executor"
                  required
                  value={form.executor_id || ""}
                  onChange={(e) => setForm({ ...form, executor_id: Number(e.target.value) })}
                >
                  <option value="">Selecione...</option>
                  {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </Select>
                {fieldError("executor_id")}
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "detalhes" && (
        <section className="atividade-form__section atividade-form__section--detalhes">
          <h3 className="atividade-form__section-title"><span className="section-icon">📝</span> Descrição e vínculos</h3>
          <Textarea
            label="Descrição"
            className="atividade-form__desc"
            rows={8}
            value={form.descricao || ""}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Detalhe o escopo, critérios de conclusão e observações relevantes..."
          />
          <MultiSelect
            label="Backlogs Vinculados"
            options={backlogOptions}
            value={form.backlog_item_ids || []}
            onChange={(ids) => setForm({ ...form, backlog_item_ids: ids })}
            placeholder="Buscar por código, título ou projeto..."
          />
          {fieldError("backlog_item_ids")}
        </section>
      )}
    </div>
  );
}

export function AtividadeFormAlert({ errors }) {
  const messages = Object.values(errors || {});
  if (!messages.length) return null;
  return (
    <Alert type="error">
      <strong>Corrija os campos abaixo antes de salvar:</strong>
      <ul className="validation-list">
        {messages.map((m) => <li key={m}>{m}</li>)}
      </ul>
    </Alert>
  );
}
