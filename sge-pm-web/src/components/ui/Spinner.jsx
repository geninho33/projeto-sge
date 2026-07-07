export function Spinner({ label = "Carregando..." }) {
  return (
    <div className="ui-spinner" role="status">
      <div className="ui-spinner__ring" />
      <span>{label}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner />
    </div>
  );
}
