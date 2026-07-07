export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="ui-btn__spinner" aria-hidden />}
      {children}
    </button>
  );
}
