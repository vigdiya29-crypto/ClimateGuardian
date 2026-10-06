// ---------------------------------------------------------------------------
// PLACEHOLDER DATA ONLY.
// Every object here mimics the shape of a future API response so components
// can be wired to real endpoints by replacing the import with a fetch/axios
// call. Search "API INTEGRATION" comments throughout the codebase for exact
// swap-in points.
// ---------------------------------------------------------------------------

export const INDIAN_CITIES = [
  'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad',
  'Jammu', 'Pune', 'Ahmedabad', 'Lucknow', 'Jaipur', 'Patna', 'Chandigarh',
];

// GET /api/aqi/current?city=
export const currentAqi = {
  city: 'Delhi',
  aqi: 168,
  mainPollutant: 'PM2.5',
  updatedAt: '2026-07-09T09:30:00+05:30',
};

// GET /api/aqi/predict  (XGBoost model output)
export const predictedAqi = {
  city: 'Delhi',
  date: '2026-07-10',
  time: '09:00',
  aqi: 182,
  confidence: 0.91,
  mainPollutant: 'PM2.5',
};

// GET /api/carbon/summary?userId=
export const carbonFootprint = {
  totalKgCo2PerMonth: 214,
  category: 'Moderate',
  treeEquivalent: 10,
  lastMonthKgCo2: 238,
};

// GET /api/weather/current?city=
export const weatherNow = {
  city: 'Delhi',
  temperatureC: 33,
  humidity: 61,
  pressureHpa: 1004,
  windSpeedKmh: 14,
  rainMm: 2.4,
  condition: 'Partly Cloudy',
};

// GET /api/aqi/live?city=  — full pollutant breakdown
export const livePollutants = [
  { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', value: 96, safe: 60 },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³', value: 142, safe: 100 },
  { key: 'co', label: 'CO', unit: 'mg/m³', value: 1.2, safe: 4 },
  { key: 'no2', label: 'NO₂', unit: 'µg/m³', value: 48, safe: 80 },
  { key: 'so2', label: 'SO₂', unit: 'µg/m³', value: 18, safe: 80 },
  { key: 'ozone', label: 'Ozone', unit: 'µg/m³', value: 62, safe: 100 },
];

// GET /api/alerts?city=
export const alerts = [
  { id: 'a1', type: 'aqi', severity: 'poor', city: 'Delhi', message: 'AQI crossed 300 in Anand Vihar zone.', time: '2h ago' },
  { id: 'a2', type: 'weather', severity: 'moderate', city: 'Jammu', message: 'Heavy rain expected this evening.', time: '4h ago' },
  { id: 'a3', type: 'aqi', severity: 'moderate', city: 'Mumbai', message: 'PM10 levels rising near Chembur.', time: '6h ago' },
  { id: 'a4', type: 'aqi', severity: 'good', city: 'Bengaluru', message: 'Air quality improved to Satisfactory.', time: '8h ago' },
];

// GET /api/news/environment
export const newsItems = [
  { id: 'n1', title: 'CPCB launches revised AQI advisory for monsoon season', source: 'PIB', time: '3h ago' },
  { id: 'n2', title: 'Delhi NCR to pilot low-emission zones from August', source: 'Down To Earth', time: '5h ago' },
  { id: 'n3', title: 'New study links PM2.5 exposure to reduced crop yield', source: 'The Hindu', time: '1d ago' },
];

// GET /api/reports/metrics — XGBoost evaluation metrics
export const modelMetrics = {
  r2: 0.94,
  mae: 8.2,
  rmse: 12.6,
  mape: 6.4,
  cvScore: 0.91,
  confidence: 0.89,
};

// GET /api/insights/aqi-categories
export const aqiCategories = [
  { range: '0–50', label: 'Good', color: 'var(--fresh-green)', effect: 'Minimal impact.' },
  { range: '51–100', label: 'Satisfactory', color: '#7CB342', effect: 'Minor discomfort to sensitive people.' },
  { range: '101–200', label: 'Moderate', color: 'var(--warning)', effect: 'Breathing discomfort to people with lung disease.' },
  { range: '201–300', label: 'Poor', color: '#FB8C00', effect: 'Discomfort on prolonged exposure.' },
  { range: '301–400', label: 'Very Poor', color: '#E64A19', effect: 'Respiratory illness on prolonged exposure.' },
  { range: '401–500', label: 'Severe', color: 'var(--danger)', effect: 'Affects healthy people, serious for existing patients.' },
];

export const pollutantInfo = [
  { key: 'pm25', name: 'PM2.5', desc: 'Fine particulate matter under 2.5 microns, penetrates deep into lungs.' },
  { key: 'pm10', name: 'PM10', desc: 'Coarse dust and particulate matter under 10 microns.' },
  { key: 'no2', name: 'NO₂', desc: 'Nitrogen dioxide, mainly from vehicle emissions and combustion.' },
  { key: 'so2', name: 'SO₂', desc: 'Sulphur dioxide, released by burning fossil fuels and industry.' },
  { key: 'co', name: 'CO', desc: 'Carbon monoxide, a colourless gas from incomplete combustion.' },
  { key: 'ozone', name: 'Ozone (O₃)', desc: 'Ground-level ozone formed by reactions between pollutants in sunlight.' },
];
