/**
 * AuthInput – reusable form input with icon support and error state.
 *
 * Props:
 *   id, name, type, placeholder, value, onChange
 *   icon (React node) – displayed on the left
 *   rightElement      – optional node on the right (e.g. password toggle)
 *   error             – error string; triggers red border + shake animation
 *   autoComplete
 */
export default function AuthInput({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  rightElement,
  error,
  autoComplete,
  ...rest
}) {
  return (
    <div className="mb-4">
      <div className="relative flex items-center">
        {/* Left icon */}
        {icon && (
          <span className="absolute left-3.5 text-gray-500 pointer-events-none z-10">
            {icon}
          </span>
        )}

        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`auth-input ${error ? 'has-error' : ''} ${rightElement ? 'pr-11' : ''}`}
          {...rest}
        />

        {/* Right element (e.g. eye icon) */}
        {rightElement && (
          <span className="absolute right-3 flex items-center z-10">
            {rightElement}
          </span>
        )}
      </div>

      {/* Field error message */}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-400 font-medium pl-1 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
