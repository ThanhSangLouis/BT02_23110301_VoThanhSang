/**
 * AuthCard – glassmorphism-style card container for auth pages.
 *
 * Props:
 *   children – card content
 *   className – optional extra Tailwind classes
 */
export default function AuthCard({ children, className = '' }) {
  return (
    <div className={`auth-card ${className}`}>
      {children}
    </div>
  );
}
