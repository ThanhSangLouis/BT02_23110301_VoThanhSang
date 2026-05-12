/**
 * PasswordStrength – visual strength meter for password fields.
 *
 * Props:
 *   password – the current password string
 */
const LEVELS = [
  { label: '',           color: '' },
  { label: 'Rất yếu',    color: 'bg-red-500' },
  { label: 'Yếu',        color: 'bg-orange-500' },
  { label: 'Trung bình', color: 'bg-yellow-500' },
  { label: 'Mạnh',       color: 'bg-lime-500' },
  { label: 'Rất mạnh',   color: 'bg-green-500' },
];

function calcStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[a-z]/.test(pw))        s++;
  if (/\d/.test(pw))           s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return s;
}

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const strength = calcStrength(password);
  const { label, color } = LEVELS[strength];

  return (
    <div className="mt-2 mb-3 animate-fade-in">
      {/* Segmented bar */}
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? color : 'bg-dark-600'
            }`}
          />
        ))}
      </div>
      {/* Label */}
      {label && (
        <p className={`text-xs font-medium text-right transition-colors ${
          strength <= 1 ? 'text-red-400' :
          strength === 2 ? 'text-orange-400' :
          strength === 3 ? 'text-yellow-400' :
          'text-green-400'
        }`}>
          {label}
        </p>
      )}
    </div>
  );
}
