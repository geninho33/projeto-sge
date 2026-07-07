import { Button } from "./Button";

export function EditModalFooter({
  onCancel,
  onSave,
  onSaveContinue,
  saving = false,
  showSaveContinue = true,
}) {
  return (
    <>
      <Button variant="ghost" onClick={onCancel} disabled={saving}>Fechar</Button>
      {showSaveContinue && (
        <Button variant="ghost" onClick={onSaveContinue} loading={saving} disabled={saving}>
          Salvar e Continuar
        </Button>
      )}
      <Button onClick={onSave} loading={saving} disabled={saving}>Salvar</Button>
    </>
  );
}
