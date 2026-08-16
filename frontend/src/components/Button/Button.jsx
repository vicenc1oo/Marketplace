import './Button.css';


export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  as: Component = 'button',
  className = '',
  type,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    loading && 'btn--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const extraProps = Component === 'button' ? { type: type || 'button', disabled: disabled || loading } : {};

  return (
    <Component className={classes} aria-busy={loading || undefined} {...extraProps} {...rest}>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      <span className="btn__label">{children}</span>
    </Component>
  );
}
