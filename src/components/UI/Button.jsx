function Button({ variant, size, className, onClick, children }) {
  const variantClass =
    variant === "default"
      ? "btn-default"
      : variant === "destructive"
      ? "btn-destructive"
      : variant === "secondary"
      ? "btn-secondary"
      : variant === "ghost"
      ? "btn-ghost"
      : "";
  const sizeClass =
    size === "sm" ? "btn-sm" : size === "icon" ? "btn-icon" : "";
  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export default Button;
