import './AuthLayout.css';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__particles" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="auth-particle" style={{
            left: `${(i * 41) % 100}%`,
            animationDelay: `${(i % 8) * 1.1}s`,
            animationDuration: `${9 + (i % 5) * 2}s`,
          }} />
        ))}
      </div>
      {children}
    </div>
  );
}
