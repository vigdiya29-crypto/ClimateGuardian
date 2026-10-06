import './Card.css';

/**
 * Generic elevated surface used across the app.
 * Props:
 *  - glass: enable glassmorphism treatment
 *  - accent: optional left accent bar color (css value)
 */
export default function Card({ children, className = '', glass = false, accent, padded = true, ...rest }) {
  return (
    <div
      className={`cg-card ${glass ? 'cg-card--glass' : ''} ${padded ? 'cg-card--padded' : ''} ${className}`}
      style={accent ? { '--accent': accent } : undefined}
      {...rest}
    >
      {accent && <span className="cg-card__accent" />}
      {children}
    </div>
  );
}
