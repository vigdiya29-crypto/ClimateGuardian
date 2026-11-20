import { useState, useEffect } from 'react';
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
  currentAqi, predictedAqi, weatherNow, alerts, newsItems,
} from '../../data/placeholderData';
import {
  getLiveAqi,
  predictAqi,
  getCurrentWeather,
  getAiInsight,
  getAlerts,
  getEnvironmentalNews,
} from '../../services/api';
import './Dashboard.css';

const CARBON_STORAGE_KEY = 'climateguardian_carbon_result';

function readStoredCarbon() {
  try {
    const raw = localStorage.getItem(CARBON_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const total = Number(parsed.total_emission ?? parsed.totalKg);
    if (isNaN(total) || total < 0) return null;
    const trees = Number(parsed.trees_required ?? parsed.treesRequired);
    return {
      totalKgCo2PerMonth: Math.round(total),
      treeEquivalent: !isNaN(trees) && trees >= 0 ? trees : Math.round(total / 21),
      category: typeof parsed.category === 'string' && parsed.category ? parsed.category : 'Calculated',
    };
  } catch (err) {
    console.warn('Could not read stored carbon footprint:', err);
    return null;
  }
}

export default function Dashboard() {
  const [city, setCity] = useState(currentAqi.city);
  const [date, setDate] = useState(predictedAqi.date);
  const [aqiVal, setAqiVal] = useState(currentAqi);
  const [predictedVal, setPredictedVal] = useState(predictedAqi);
  const [carbonVal, setCarbonVal] = useState(readStoredCarbon);
  const [weatherVal, setWeatherVal] = useState(weatherNow);
  const [aiVal, setAiVal] = useState({
    headline: 'AQI is expected to rise tomorrow',
    insight: 'PM2.5 is currently the primary contributor. Consider limiting outdoor exposure during peak traffic hours.',
    confidence: 0.91,
  });
  const [alertsList, setAlertsList] = useState(alerts);
  const [newsList, setNewsList] = useState(newsItems);

  const currentMeta = getAqiMeta(aqiVal.aqi);

  useEffect(() => {
    let isMounted = true;

    // Refresh stored carbon on component mount or city change
    setCarbonVal(readStoredCarbon());

    async function loadDashboardData() {
      try {
        const [live, pred, weather, ai, fetchedAlerts, fetchedNews] = await Promise.all([
          getLiveAqi(city),
          predictAqi(city),
          getCurrentWeather(city),
          getAiInsight(city),
          getAlerts(city),
          getEnvironmentalNews(),
        ]);

        if (isMounted) {
          if (live) setAqiVal((prev) => ({ ...prev, ...live }));
          if (pred) setPredictedVal((prev) => ({ ...prev, ...pred }));
          if (weather) setWeatherVal((prev) => ({ ...prev, ...weather }));
          if (ai) setAiVal(ai);
          if (fetchedAlerts?.length) setAlertsList(fetchedAlerts);
          if (fetchedNews?.length) setNewsList(fetchedNews);
        }
      } catch (err) {
        console.warn('Dashboard live update notice:', err);
      }
    }

    loadDashboardData();
    return () => { isMounted = false; };
  }, [city]);

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
            Live snapshot for {city}, updated {new Date(aqiVal.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST.
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
            <span className="dashboard__ai-confidence">Confidence {Math.round(aiVal.confidence * 100)}%</span>
          </div>
          <p className="dashboard__ai-text">
            <strong>{aiVal.headline}.</strong> {aiVal.insight}
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
          <AQIGauge value={aqiVal.aqi} size={142} />
          <div className="dashboard__kpi-insight">
            <span className="dashboard__kpi-insight-label">Primary Pollutant</span>
            <span className="dashboard__kpi-insight-value">
              <strong>{aqiVal.mainPollutant}</strong>
              {aqiVal.pollutants?.pm2_5 != null ? ` (${Math.round(aqiVal.pollutants.pm2_5)} µg/m³)` : ''}
            </span>
          </div>
        </Card>

        {/* KPI 2: Predicted AQI */}
        <Card className="dashboard__hero-card dashboard__kpi-card" accent="var(--sky)">
          <div className="dashboard__kpi-head">
            <span className="eyebrow">Predicted AQI</span>
            <span className="dashboard__kpi-tag">Model ML</span>
          </div>
          <AQIGauge value={predictedVal.aqi} size={142} label="Forecast" />
          <div className="dashboard__kpi-insight">
            <span className="dashboard__kpi-insight-label">Model Confidence</span>
            <span className="dashboard__kpi-insight-value">
              <strong>{Math.round((predictedVal.confidence || 0.91) * 100)}%</strong> · XGBoost ML
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
              <span className="dashboard__kpi-number">{carbonVal ? carbonVal.totalKgCo2PerMonth : '--'}</span>
              <span className="dashboard__kpi-unit">kg CO₂/mo</span>
            </div>
            <span className={`stat-card__trend ${carbonVal ? 'stat-card__trend--down' : ''}`}>
              {carbonVal ? `🌱 ${carbonVal.category} impact` : 'No calculation recorded'}
            </span>
          </div>
          <div className="dashboard__kpi-insight">
            <span className="dashboard__kpi-insight-label">Impact Offset</span>
            <span className="dashboard__kpi-insight-value">
              {carbonVal ? `🌱 ~${carbonVal.treeEquivalent} trees equivalent` : 'Calculate in Carbon page'}
            </span>
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
                style={{
                  width: `${Math.max(0, Math.min(100, (aqiVal.aqi / 350) * 100))}%`,
                  background: currentMeta.color,
                }}
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
              <span>{weatherVal.temperatureC}°C</span>
            </div>
            <span className="dashboard__weather-cond">{weatherVal.condition}, {city}</span>
          </div>
          <div className="dashboard__weather-grid">
            <span><Droplets size={14} /> {weatherVal.humidity}% Humidity</span>
            <span><Gauge size={14} /> {weatherVal.pressureHpa} hPa</span>
            <span><WindIcon size={14} /> {weatherVal.windSpeedKmh} km/h</span>
            <span><CloudRain size={14} /> {weatherVal.rainMm} mm</span>
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
            {alertsList.slice(0, 3).map((a) => (
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
          {newsList.map((n) => (
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
