// Central place for AQI category logic.
// Backend integration note: the ML API is expected to return a raw numeric AQI value.
// This helper maps that number to the Indian CPCB AQI category, color, and health advice
// so every card/page derives its label from one source of truth.

export const AQI_SCALE = [
  { max: 50, label: 'Good', color: 'var(--fresh-green)', badge: 'badge-good', advice: 'Air quality is satisfactory. Ideal day for outdoor activity.' },
  { max: 100, label: 'Satisfactory', color: '#7CB342', badge: 'badge-good', advice: 'Minor breathing discomfort possible for sensitive people.' },
  { max: 200, label: 'Moderate', color: 'var(--warning)', badge: 'badge-moderate', advice: 'Breathing discomfort to people with lung, heart disease, children and older adults.' },
  { max: 300, label: 'Poor', color: '#FB8C00', badge: 'badge-moderate', advice: 'Breathing discomfort to most people on prolonged exposure.' },
  { max: 400, label: 'Very Poor', color: '#E64A19', badge: 'badge-poor', advice: 'Respiratory illness on prolonged exposure. Limit outdoor activity.' },
  { max: 500, label: 'Severe', color: 'var(--danger)', badge: 'badge-poor', advice: 'Affects healthy people, seriously impacts those with existing diseases. Avoid outdoor exposure.' },
];

export function getAqiMeta(value) {
  const v = Number(value) || 0;
  return AQI_SCALE.find((tier) => v <= tier.max) || AQI_SCALE[AQI_SCALE.length - 1];
}

export function aqiToArcPercent(value, max = 500) {
  return Math.min(100, Math.max(0, (value / max) * 100));
}
