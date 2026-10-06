import { useState } from 'react';
import {
  Thermometer, Droplets, Gauge, Wind as WindIcon, CloudRain, Leaf,
  Newspaper, Zap, ChevronRight, Sparkles
} from 'lucide-react';
import Card from '../../components/Card/Card';
import AQIGauge from '../../components/AQIGauge/AQIGauge';
import AQITrendChart from '../../components/Charts/AQITrendChart';
import PredictionGraphChart from '../../components/Charts/PredictionGraphChart';
import CitySelector from '../../components/CitySelector/CitySelector';
import DateSelector from '../../components/DateSelector/DateSelector';
import { getAqiMeta } from '../../utils/aqiUtils';
import {
  currentAqi, predictedAqi, carbonFootprint, weatherNow, alerts, newsItems,
} from '../../data/placeholderData';
import './Dashboard.css';

export default function Dashboard() {
  const [city, setCity] = useState(currentAqi.city);
  const [date, setDate] = useState(predictedAqi.date);
  const currentMeta = getAqiMeta(currentAqi.aqi);

  return (
    <div className="page-container">
      {/* Dashboard Page Header with Live Status */}
      <div className="page-header">
        <div>
          <div className="page-header__meta-row">
            <span className="eyebrow">Namaste, Ayushmaan</span>
            <span className="dashboard__live-indicator">
              <span className="live-dot" /> Live data · Updated 2 min ago
            </span>
          </div>
          <h1 className="page-title">Today's Air Quality Overview</h1>
          <p className="page-subtitle">
            Live snapshot for {city}, updated {new Date(currentAqi.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST.
          </p>
        </div>
        <div className="dashboard__controls">
          <CitySelector value={city} onChange={setCity} />
          <DateSelector value={date} onChange={setDate} />
          <button className="btn btn-primary">
            <Zap size={15} /> Quick Prediction
          </button>
        </div>
      </div>

      {/* Compact AI Insight Card */}
      <div className="dashboard__ai-card">
        <div className="dashboard__ai-icon">
          <Sparkles size={16} />
        </div>
        <div className="dashboard__ai-body">
          <div className="dashboard__ai-title-row">
            <span className="dashboard__ai-label">AI Insight</span>
            <span className="dashboard__ai-confidence">Confidence 91%</span>
          </div>
          <p className="dashboard__ai-text">
            <strong>AQI is expected to rise tomorrow.</strong> PM2.5 is currently the primary contributor. Consider limiting outdoor exposure during peak traffic hours.
          </p>
        </div>
      </div>

      {/* 4 Hierarchical KPI Cards */}
      <div className="grid grid-4">
        {/* KPI 1: Current AQI */}
        <Card className="dashboard__hero-card dashboard__kpi-card" accent={currentMeta.color}>
          <div className="dashboard__kpi-head">
            <span className="eyebrow">Current AQI</span>
            <span className="dashboard__kpi-status-dot" style={{ background: currentMeta.color }} />
          </div>
          <AQIGauge value={currentAqi.aqi} size={142} />
          <div className="dashboard__kpi-insight">
            <span className="dashboard__kpi-insight-label">Primary Pollutant</span>
            <span className="dashboard__kpi-insight-value">
              <strong>{currentAqi.mainPollutant}</strong> (96 µg/m³)
            </span>
          </div>
        </Card>

        {/* KPI 2: Predicted AQI (Tomorrow) */}
        <Card className="dashboard__hero-card dashboard__kpi-card" accent="var(--sky)">
          <div className="dashboard__kpi-head">
            <span className="eyebrow">Predicted AQI</span>
            <span className="dashboard__kpi-tag">Tomorrow</span>
          </div>
          <AQIGauge value={predictedAqi.aqi} size={142} label="Forecast" />
          <div className="dashboard__kpi-insight">
            <span className="dashboard__kpi-insight-label">Model Confidence</span>
            <span className="dashboard__kpi-insight-value">
              <strong>{Math.round(predictedAqi.confidence * 100)}%</strong> · XGBoost ML
            </span>
          </div>
        </Card>

        {/* KPI 3: Carbon Footprint */}
        <Card className="dashboard__hero-card dashboard__kpi-card" accent="var(--fresh-green)">
          <div className="dashboard__kpi-head">
            <span className="eyebrow">Carbon Footprint</span>
            <span className="dashboard__kpi-icon-wrap"><Leaf size={14} /></span>
          </div>
          <div className="dashboard__kpi-center">
            <div className="dashboard__kpi-val-row">
              <span className="dashboard__kpi-number">{carbonFootprint.totalKgCo2PerMonth}</span>
              <span className="dashboard__kpi-unit">kg CO₂/mo</span>
            </div>
            <span className="stat-card__trend stat-card__trend--down">
              ↓ {carbonFootprint.lastMonthKgCo2 - carbonFootprint.totalKgCo2PerMonth} kg vs last month
            </span>
          </div>
          <div className="dashboard__kpi-insight">
            <span className="dashboard__kpi-insight-label">Impact Offset</span>
            <span className="dashboard__kpi-insight-value">🌱 ~{carbonFootprint.treeEquivalent} trees equivalent</span>
          </div>
        </Card>

        {/* KPI 4: Air Quality Category */}
        <Card className="dashboard__hero-card dashboard__kpi-card" accent="var(--warning)">
          <div className="dashboard__kpi-head">
            <span className="eyebrow">Health Severity</span>
            <span className="dashboard__kpi-icon-wrap"><Gauge size={14} /></span>
          </div>
          <div className="dashboard__kpi-center">
            <div className="dashboard__category">
              <span className={`badge ${currentMeta.badge}`} style={{ fontSize: 13.5, padding: '6px 14px' }}>
                {currentMeta.label}
              </span>
            </div>
            <div className="dashboard__severity-bar">
              <div
                className="dashboard__severity-fill"
                style={{ width: `${Math.min(100, (currentAqi.aqi / 350) * 100)}%`, background: currentMeta.color }}
              />
            </div>
          </div>
          <div className="dashboard__kpi-insight">
            <p className="dashboard__category-advice">{currentMeta.advice}</p>
          </div>
        </Card>
      </div>

      {/* Grid 3: Weather, Health, Alerts */}
      <div className="grid grid-3">
        <Card>
          <span className="eyebrow">Today's Weather</span>
          <div className="dashboard__weather">
            <div className="dashboard__weather-main">
              <Thermometer size={28} />
              <span>{weatherNow.temperatureC}°C</span>
            </div>
            <span className="dashboard__weather-cond">{weatherNow.condition}, {weatherNow.city}</span>
          </div>
          <div className="dashboard__weather-grid">
            <span><Droplets size={14} /> {weatherNow.humidity}% Humidity</span>
            <span><Gauge size={14} /> {weatherNow.pressureHpa} hPa</span>
            <span><WindIcon size={14} /> {weatherNow.windSpeedKmh} km/h</span>
            <span><CloudRain size={14} /> {weatherNow.rainMm} mm</span>
          </div>
        </Card>

        <Card>
          <span className="eyebrow">Health Recommendation</span>
          <h4 className="dashboard__health-title">{currentMeta.label} conditions in {city}</h4>
          <p className="dashboard__health-text">{currentMeta.advice}</p>
          <ul className="dashboard__health-list">
            <li>Sensitive groups should limit prolonged outdoor exertion</li>
            <li>Consider a N95 mask for outdoor commutes</li>
            <li>Keep windows closed during peak traffic hours</li>
          </ul>
        </Card>

        <Card className="dashboard__alerts">
          <div className="dashboard__alerts-head">
            <span className="eyebrow">Recent Alerts</span>
            <a href="/alerts" className="dashboard__view-all">View all <ChevronRight size={13} /></a>
          </div>
          <ul className="dashboard__alert-list">
            {alerts.slice(0, 3).map((a) => (
              <li key={a.id} className={`dashboard__alert-item severity-${a.severity}`}>
                <span className="dashboard__alert-dot" />
                <div>
                  <p className="dashboard__alert-msg">{a.message}</p>
                  <span className="dashboard__alert-meta">{a.city} · {a.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Grid 2: Polished Interactive Charts */}
      <div className="grid grid-2">
        <AQITrendChart title="AQI Trend — Last 7 Days" subtitle={`${city} · hourly rolling average`} />
        <PredictionGraphChart title="Prediction Graph" subtitle="XGBoost ML forecast vs actual" />
      </div>

      {/* Latest Environmental News */}
      <Card>
        <div className="dashboard__alerts-head">
          <span className="eyebrow"><Newspaper size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Latest Environmental News</span>
        </div>
        <ul className="dashboard__news-list">
          {newsItems.map((n) => (
            <li key={n.id} className="dashboard__news-item">
              <span className="dashboard__news-title">{n.title}</span>
              <span className="dashboard__news-meta">{n.source} · {n.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
