/**
 * AuthButton – reusable submit / action button for auth forms.
 *
 * Props:
 *   children  – button label / content
 *   loading   – shows spinner when true
 *   variant   – 'primary' | 'secondary'  (default: 'primary')
 *   type      – button type (default: 'submit')
 *   onClick
 *   disabled
 */
export default function AuthButton({
  children,
  loading = false,
  variant = 'primary',
  type = 'submit',
  onClick,
  disabled,
  id,
}) {
  const cls = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cls}
    >
      {loading && (
        <svg
          className="animate-spin-slow h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
