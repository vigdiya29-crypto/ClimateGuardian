import { useEffect, useState } from 'react';
import { getAqiMeta, aqiToArcPercent } from '../../utils/aqiUtils';
import './AQIGauge.css';

/**
 * Signature visual for ClimateGuardian: a breathing arc gauge.
 * The arc fills to represent AQI severity, and a soft halo pulses at a rate
 * tied to severity (faster pulse = worse air), evoking a breathing rhythm.
 *
 * API INTEGRATION: pass `value` from GET /api/aqi/current or /predict.
 */
export default function AQIGauge({ value = 0, size = 190, label = 'AQI', animate = true }) {
  const meta = getAqiMeta(value);
  const pct = aqiToArcPercent(value);
  const [display, setDisplay] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) return;
    let raf;
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);

  const pulseSpeed = 2.6 - Math.min(1.8, pct / 100 * 1.8); // faster when worse
  const radius = 78;
  const circumference = 2 * Math.PI * radius * 0.75; // 270deg arc
  const dash = (pct / 100) * circumference;

  return (
    <div className="aqi-gauge" style={{ width: size, height: size, '--pulse-speed': `${pulseSpeed}s`, '--gauge-color': meta.color }}>
      <span className="aqi-gauge__halo" aria-hidden="true" />
      <svg viewBox="0 0 200 200" className="aqi-gauge__svg">
        <circle cx="100" cy="100" r={radius} className="aqi-gauge__track" strokeDasharray={`${circumference} 999`} transform="rotate(135 100 100)" />
        <circle
          cx="100" cy="100" r={radius}
          className="aqi-gauge__fill"
          strokeDasharray={`${dash} 999`}
          transform="rotate(135 100 100)"
        />
      </svg>
      <div className="aqi-gauge__center">
        <span className="aqi-gauge__value">{display}</span>
        <span className="aqi-gauge__label">{label}</span>
        <span className={`badge ${meta.badge}`} style={{ marginTop: 6 }}>{meta.label}</span>
      </div>
    </div>
  );
}
