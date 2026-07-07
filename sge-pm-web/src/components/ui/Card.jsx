export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div className={`ui-card${hover ? " ui-card--hover" : ""} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="ui-card__header">
      <div>
        {title && <h3 className="ui-card__title">{title}</h3>}
        {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
