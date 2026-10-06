import { useState } from 'react';
import {
  Thermometer, Droplets, Gauge, Wind, CloudRain,
  HeartPulse, Radio, CheckCircle2, Activity
} from 'lucide-react';
import Card from '../../components/Card/Card';
import AQIGauge from '../../components/AQIGauge/AQIGauge';
import PollutantCard from '../../components/PollutantCard/PollutantCard';
import AQITrendChart from '../../components/Charts/AQITrendChart';
import CitySelector from '../../components/CitySelector/CitySelector';
import { getAqiMeta } from '../../utils/aqiUtils';
import { currentAqi, livePollutants, weatherNow } from '../../data/placeholderData';
import './LiveAQI.css';

export default function LiveAQI() {
  const [city, setCity] = useState(currentAqi.city);
  const meta = getAqiMeta(currentAqi.aqi);

  return (
    <div className="page-container live-aqi-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-header__meta-row">
            <span className="eyebrow">Real-Time Sensor Telemetry</span>
            <span className="live-aqi__live-badge">
              <span className="live-dot" /> Live Stream · 60s Refresh
            </span>
          </div>
          <h1 className="page-title">Live AQI Monitoring</h1>
          <p className="page-subtitle">
            Continuous ambient air quality diagnostics, calibrated pollutant breakdown, and micro-climate telemetry for {city}.
          </p>
        </div>
        <div className="live-aqi__header-controls">
          <CitySelector value={city} onChange={setCity} />
        </div>
      </div>

      {/* Top Hero Section — Balanced & Informative */}
      <Card className="live-aqi__hero-card" accent={meta.color}>
        <div className="live-aqi__hero-grid">
          {/* Left: Gauge Focus */}
          <div className="live-aqi__hero-gauge-pane">
            <AQIGauge value={currentAqi.aqi} size={155} />
          </div>

          {/* Right: Station Telemetry & Context */}
          <div className="live-aqi__hero-info-pane">
            <div className="live-aqi__hero-info-head">
              <div>
                <div className="live-aqi__station-row">
                  <h3 className="live-aqi__station-name">{city} Central Telemetry Station</h3>
                  <span className="live-aqi__station-ref">CPCB-REF: DL-04</span>
                </div>
                <p className="live-aqi__station-sub">
                  Ground-truth optical particle counter & electrochemical sensor array
                </p>
              </div>
              <span className="live-aqi__status-tag">
                <span className="live-dot" /> Live (99.8% Uptime)
              </span>
            </div>

            <div className="live-aqi__hero-badges-row">
              <span className={`badge ${meta.badge}`} style={{ fontSize: 13, padding: '5px 13px' }}>
                {meta.label} Air Quality
              </span>
              <span className="live-aqi__pill">
                Primary Factor: <strong>{currentAqi.mainPollutant}</strong> (96 µg/m³)
              </span>
              <span className="live-aqi__pill">
                AQI Contribution: <strong>58%</strong>
              </span>
            </div>

            <p className="live-aqi__hero-summary">
              {meta.advice} Ambient conditions indicate heightened concentrations during peak morning and evening traffic intervals.
            </p>

            <div className="live-aqi__hero-stats-bar">
              <span className="live-aqi__stat-item">
                <strong>Updated:</strong> {new Date(currentAqi.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
              </span>
              <span className="live-aqi__stat-divider" />
              <span className="live-aqi__stat-item">
                <strong>Accuracy:</strong> ±1.5% FS
              </span>
              <span className="live-aqi__stat-divider" />
              <span className="live-aqi__stat-item">
                <strong>Sample Cycle:</strong> Continuous (60s)
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Compact Health Impact & Advisory Section */}
      <Card className="live-aqi__health-card">
        <div className="live-aqi__health-head">
          <div className="live-aqi__health-title-wrap">
            <span className="live-aqi__health-icon">
              <HeartPulse size={18} />
            </span>
            <div>
              <h4 className="live-aqi__health-title">Health Impact & Atmospheric Advisory</h4>
              <p className="live-aqi__health-sub">Real-time health guidance tailored for {city} residents</p>
            </div>
          </div>
          <span className={`badge ${meta.badge}`}>{meta.label} Severity</span>
        </div>

        <div className="live-aqi__health-grid">
          <div className="live-aqi__health-col">
            <span className="live-aqi__health-col-label">General Public</span>
            <p className="live-aqi__health-col-desc">
              Outdoor activities and sports are generally safe, but reduce prolonged high-intensity cardiovascular workouts if throat irritation develops.
            </p>
          </div>
          <div className="live-aqi__health-col">
            <span className="live-aqi__health-col-label">Sensitive Demographics</span>
            <p className="live-aqi__health-col-desc">
              Children, elderly, and individuals with asthma or COPD should carry quick-relief inhalers and limit outdoor exertion near busy roadways.
            </p>
          </div>
          <div className="live-aqi__health-col">
            <span className="live-aqi__health-col-label">Recommended Precautions</span>
            <p className="live-aqi__health-col-desc">
              Operate indoor HEPA purifiers on auto mode. Wear a certified N95 respirator if walking or cycling during morning transit hours.
            </p>
          </div>
        </div>
      </Card>

      {/* Pollutant Breakdown Grid */}
      <div className="live-aqi__section">
        <div className="live-aqi__section-header">
          <div>
            <span className="eyebrow">Ambient Concentrations</span>
            <h3 className="live-aqi__section-title">Individual Pollutant Diagnostics</h3>
          </div>
          <span className="live-aqi__standards-tag">CPCB Standard (NAAQS 2026)</span>
        </div>
        <div className="grid grid-3">
          {livePollutants.map((p) => (
            <PollutantCard key={p.key} label={p.label} value={p.value} unit={p.unit} safe={p.safe} />
          ))}
        </div>
      </div>

      {/* Weather Conditions (Balanced 5-Column Grid) */}
      <div className="live-aqi__section">
        <div className="live-aqi__section-header">
          <div>
            <span className="eyebrow">Micro-Climate Telemetry</span>
            <h3 className="live-aqi__section-title">Surface Atmospheric Conditions</h3>
          </div>
          <span className="live-aqi__standards-tag">IMD Station Feed</span>
        </div>
        <div className="live-aqi__weather-grid">
          <Card className="live-aqi__weather-card">
            <div className="live-aqi__weather-top">
              <span className="live-aqi__weather-icon"><Thermometer size={18} /></span>
              <span className="live-aqi__weather-tag">Feels 36°C</span>
            </div>
            <div className="live-aqi__weather-value-wrap">
              <span className="live-aqi__weather-value">{weatherNow.temperatureC}°C</span>
              <span className="live-aqi__weather-label">Ambient Temperature</span>
            </div>
            <span className="live-aqi__weather-sub">{weatherNow.condition}</span>
          </Card>

          <Card className="live-aqi__weather-card">
            <div className="live-aqi__weather-top">
              <span className="live-aqi__weather-icon"><Droplets size={18} /></span>
              <span className="live-aqi__weather-tag">Moderate</span>
            </div>
            <div className="live-aqi__weather-value-wrap">
              <span className="live-aqi__weather-value">{weatherNow.humidity}%</span>
              <span className="live-aqi__weather-label">Relative Humidity</span>
            </div>
            <span className="live-aqi__weather-sub">Dew Point 24°C</span>
          </Card>

          <Card className="live-aqi__weather-card">
            <div className="live-aqi__weather-top">
              <span className="live-aqi__weather-icon"><Gauge size={18} /></span>
              <span className="live-aqi__weather-tag">Stable</span>
            </div>
            <div className="live-aqi__weather-value-wrap">
              <span className="live-aqi__weather-value">{weatherNow.pressureHpa}</span>
              <span className="live-aqi__weather-label">Atmospheric Pressure</span>
            </div>
            <span className="live-aqi__weather-sub">hPa (Sea Level)</span>
          </Card>

          <Card className="live-aqi__weather-card">
            <div className="live-aqi__weather-top">
              <span className="live-aqi__weather-icon"><Wind size={18} /></span>
              <span className="live-aqi__weather-tag">SE Breeze</span>
            </div>
            <div className="live-aqi__weather-value-wrap">
              <span className="live-aqi__weather-value">{weatherNow.windSpeedKmh}</span>
              <span className="live-aqi__weather-label">Wind Velocity</span>
            </div>
            <span className="live-aqi__weather-sub">km/h from South-East</span>
          </Card>

          <Card className="live-aqi__weather-card">
            <div className="live-aqi__weather-top">
              <span className="live-aqi__weather-icon"><CloudRain size={18} /></span>
              <span className="live-aqi__weather-tag">Scattered</span>
            </div>
            <div className="live-aqi__weather-value-wrap">
              <span className="live-aqi__weather-value">{weatherNow.rainMm} mm</span>
              <span className="live-aqi__weather-label">24h Rainfall</span>
            </div>
            <span className="live-aqi__weather-sub">Light Precipitation</span>
          </Card>
        </div>
      </div>

      {/* Historical Real-Time AQI Trend */}
      <div className="live-aqi__section">
        <AQITrendChart
          title="Telemetry AQI History — Last 7 Days"
          subtitle={`${city} · continuous sensor rolling average`}
        />
      </div>
    </div>
  );
}
