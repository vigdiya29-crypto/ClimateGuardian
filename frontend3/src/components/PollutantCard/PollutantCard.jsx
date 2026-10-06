import Card from '../Card/Card';
import './PollutantCard.css';

const POLLUTANT_DESCRIPTIONS = {
  'PM2.5': 'Fine respirable particulates (< 2.5µm)',
  'PM10': 'Coarse dust and inhalable particles',
  'CO': 'Carbon monoxide gas emissions',
  'NO₂': 'Nitrogen dioxide from vehicles & industry',
  'SO₂': 'Sulfur dioxide industrial byproduct',
  'Ozone': 'Ground-level photochemical smog',
};

/**
 * Shows a single pollutant reading against its CPCB "safe" threshold.
 * API INTEGRATION: value/safe come from GET /api/aqi/live?city=
 */
export default function PollutantCard({ label, value, unit, safe }) {
  const ratio = value / safe;
  const over = value > safe;
  const pct = Math.min(100, (value / (safe * 1.8)) * 100);
  const markPos = Math.min(100, (safe / (safe * 1.8)) * 100);
  const description = POLLUTANT_DESCRIPTIONS[label] || 'Atmospheric pollutant reading';

  return (
    <Card className="pollutant-card" accent={over ? 'var(--danger)' : 'var(--fresh-green)'}>
      <div className="pollutant-card__head">
        <div>
          <div className="pollutant-card__label-row">
            <h4 className="pollutant-card__label">{label}</h4>
            <span className="pollutant-card__unit-tag">{unit}</span>
          </div>
          <p className="pollutant-card__desc">{description}</p>
        </div>
        <span className={`pollutant-card__status ${over ? 'is-over' : 'is-safe'}`}>
          <span className="pollutant-card__dot" />
          {over ? `${ratio.toFixed(1)}× Above Limit` : 'Within Safe Limit'}
        </span>
      </div>

      <div className="pollutant-card__middle">
        <div className="pollutant-card__val-wrap">
          <span className="pollutant-card__value">{value}</span>
          <span className="pollutant-card__unit">{unit}</span>
        </div>
        <span className="pollutant-card__ratio-text">
          {over ? `Exceeds threshold by ${(value - safe).toFixed(0)} ${unit}` : `${Math.round((value / safe) * 100)}% of safe limit`}
        </span>
      </div>

      <div className="pollutant-card__bar-wrap">
        <div className="pollutant-card__bar">
          <span
            className={`pollutant-card__bar-fill ${over ? 'is-over' : 'is-safe'}`}
            style={{ width: `${pct}%` }}
          />
          <span
            className="pollutant-card__bar-mark"
            style={{ left: `${markPos}%` }}
            title={`CPCB Standard Limit: ${safe} ${unit}`}
          />
        </div>
        <div className="pollutant-card__bar-labels">
          <span>0</span>
          <span className="pollutant-card__safe-label">CPCB Limit: {safe} {unit}</span>
          <span>{(safe * 1.8).toFixed(0)}</span>
        </div>
      </div>
    </Card>
  );
}
