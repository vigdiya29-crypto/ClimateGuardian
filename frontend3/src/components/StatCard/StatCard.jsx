import Card from '../Card/Card';
import './StatCard.css';

/**
 * Compact metric card used for weather figures, model metrics, footprint stats, etc.
 */
export default function StatCard({ icon: Icon, label, value, unit, trend, accent = 'var(--fresh-green)' }) {
  return (
    <Card className="stat-card" accent={accent}>
      <div className="stat-card__top">
        {Icon && <span className="stat-card__icon"><Icon size={18} /></span>}
        <span className="stat-card__label">{label}</span>
      </div>
      <div className="stat-card__value">
        {value}<span className="stat-card__unit">{unit}</span>
      </div>
      {trend && <span className={`stat-card__trend stat-card__trend--${trend.direction}`}>{trend.text}</span>}
    </Card>
  );
}
