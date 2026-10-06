import { useState } from 'react';
import {
  Radar, Clock, Sparkles, ShieldAlert, Gauge, Wind,
  CheckCircle2, Calendar, MapPin
} from 'lucide-react';
import Card from '../../components/Card/Card';
import AQIGauge from '../../components/AQIGauge/AQIGauge';
import CitySelector from '../../components/CitySelector/CitySelector';
import DateSelector from '../../components/DateSelector/DateSelector';
import PredictionHourlyChart from '../../components/Charts/PredictionHourlyChart';
import { Spinner } from '../../components/Loader/Loader';
import { getAqiMeta } from '../../utils/aqiUtils';
import { predictedAqi } from '../../data/placeholderData';
import './Prediction.css';

export default function Prediction() {
  const [city, setCity] = useState(predictedAqi.city);
  const [date, setDate] = useState(predictedAqi.date);
  const [time, setTime] = useState(predictedAqi.time);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    ...predictedAqi,
    city: predictedAqi.city,
    date: predictedAqi.date,
    time: predictedAqi.time,
  });

  // API INTEGRATION: POST /api/predict { city, date, time, features... }
  function handlePredict(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResult({
        ...predictedAqi,
        city,
        date,
        time,
        // slight realistic variance on prediction
        aqi: city === 'Delhi' ? 182 : city === 'Mumbai' ? 145 : city === 'Bengaluru' ? 78 : 160,
      });
      setLoading(false);
    }, 700);
  }

  const meta = result ? getAqiMeta(result.aqi) : getAqiMeta(predictedAqi.aqi);

  return (
    <div className="page-container prediction-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-header__meta-row">
            <span className="eyebrow">XGBoost Forecast Engine</span>
            <span className="prediction__model-badge">
              <span className="live-dot" /> Model v2.4 Active · 94% Cross-Validated R²
            </span>
          </div>
          <h1 className="page-title">AQI Prediction</h1>
          <p className="page-subtitle">
            Configure target city, date, and forecast horizon — the ML model predicts atmospheric air quality from weather patterns and pollutant dynamics.
          </p>
        </div>
      </div>

      {/* Compact Prediction Form Control Bar */}
      <Card className="prediction__form-card">
        <form className="prediction__form" onSubmit={handlePredict}>
          <div className="prediction__controls-group">
            <div className="prediction__field">
              <span className="prediction__field-label">
                <MapPin size={12} className="prediction__field-icon" /> Target City
              </span>
              <CitySelector value={city} onChange={setCity} />
            </div>

            <div className="prediction__field">
              <span className="prediction__field-label">
                <Calendar size={12} className="prediction__field-icon" /> Forecast Date
              </span>
              <DateSelector value={date} onChange={setDate} label="" />
            </div>

            <div className="prediction__field">
              <span className="prediction__field-label">
                <Clock size={12} className="prediction__field-icon" /> Target Time
              </span>
              <label className="prediction__time">
                <Clock size={15} className="prediction__time-icon" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  aria-label="Target time"
                />
              </label>
            </div>
          </div>

          <div className="prediction__submit-wrap">
            <button
              className="btn btn-primary prediction__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? <Spinner size={15} /> : <Radar size={15} />}
              <span>{loading ? 'Generating Forecast…' : 'Run Prediction'}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Prediction Results Section */}
      {result && meta && (
        <div className="prediction__results-section">
          {/* 4 Hierarchical KPI Result Cards */}
          <div className="grid grid-4">
            {/* Card 1: Predicted AQI */}
            <Card className="dashboard__hero-card dashboard__kpi-card" accent={meta.color}>
              <div className="dashboard__kpi-head">
                <span className="eyebrow">Predicted AQI</span>
                <span className="prediction__target-badge">
                  {result.time} IST
                </span>
              </div>
              <AQIGauge value={result.aqi} size={142} label="Forecast" />
              <div className="dashboard__kpi-insight">
                <span className="dashboard__kpi-insight-label">Model Projection</span>
                <span className="dashboard__kpi-insight-value">
                  <strong>{result.aqi > 150 ? '+14 vs current' : '-6 vs yesterday'}</strong> · {meta.label}
                </span>
              </div>
            </Card>

            {/* Card 2: AQI Category */}
            <Card className="dashboard__hero-card dashboard__kpi-card" accent={meta.color}>
              <div className="dashboard__kpi-head">
                <span className="eyebrow">Health Category</span>
                <span className="dashboard__kpi-icon-wrap"><Gauge size={14} /></span>
              </div>
              <div className="dashboard__kpi-center">
                <div className="dashboard__category">
                  <span
                    className={`badge ${meta.badge}`}
                    style={{ fontSize: 13.5, padding: '6px 14px' }}
                  >
                    {meta.label}
                  </span>
                </div>
                <div className="dashboard__severity-bar">
                  <div
                    className="dashboard__severity-fill"
                    style={{
                      width: `${Math.min(100, (result.aqi / 350) * 100)}%`,
                      background: meta.color,
                    }}
                  />
                </div>
              </div>
              <div className="dashboard__kpi-insight">
                <span className="dashboard__kpi-insight-label">Severity Level</span>
                <span className="dashboard__kpi-insight-value">
                  AQI {result.aqi} · {meta.label} Air
                </span>
              </div>
            </Card>

            {/* Card 3: Main Pollutant */}
            <Card className="dashboard__hero-card dashboard__kpi-card" accent="var(--sky)">
              <div className="dashboard__kpi-head">
                <span className="eyebrow">Main Pollutant</span>
                <span className="dashboard__kpi-icon-wrap"><Wind size={14} /></span>
              </div>
              <div className="dashboard__kpi-center">
                <div className="prediction__pollutant-hero">
                  <span className="prediction__pollutant-val">{result.mainPollutant}</span>
                  <span className="prediction__pollutant-metric">96 µg/m³</span>
                </div>
                <span className="prediction__pollutant-share">
                  58% of total atmospheric load
                </span>
              </div>
              <div className="dashboard__kpi-insight">
                <span className="dashboard__kpi-insight-label">Dominant Contributor</span>
                <span className="dashboard__kpi-insight-value">
                  Fine inhalable particulate matter
                </span>
              </div>
            </Card>

            {/* Card 4: Model Confidence */}
            <Card className="dashboard__hero-card dashboard__kpi-card" accent="var(--fresh-green)">
              <div className="dashboard__kpi-head">
                <span className="eyebrow">Confidence Score</span>
                <span className="dashboard__kpi-icon-wrap"><Sparkles size={14} /></span>
              </div>
              <div className="dashboard__kpi-center">
                <div className="prediction__confidence-hero">
                  <span className="prediction__confidence-val">
                    {Math.round(result.confidence * 100)}%
                  </span>
                  <span className="prediction__confidence-pill">High Precision</span>
                </div>
                <span className="prediction__confidence-desc">
                  Based on 10-fold cross-validation
                </span>
              </div>
              <div className="dashboard__kpi-insight">
                <span className="dashboard__kpi-insight-label">Statistical Fit</span>
                <span className="dashboard__kpi-insight-value">
                  R² = 0.94 · MAE = 8.2 AQI
                </span>
              </div>
            </Card>
          </div>

          {/* Actionable Health Advisory & Recommendation Card */}
          <Card className="prediction__advisory-card">
            <div className="prediction__advisory-head">
              <div className="prediction__advisory-title-wrap">
                <span className="prediction__advisory-icon"><ShieldAlert size={18} /></span>
                <div>
                  <h4 className="prediction__advisory-title">
                    Health Advisory & Action Plan for {result.city}
                  </h4>
                  <p className="prediction__advisory-sub">
                    Forecast for {result.date} at {result.time} IST ({meta.label} conditions)
                  </p>
                </div>
              </div>
              <span className={`badge ${meta.badge}`}>{meta.label} Advisory</span>
            </div>

            <div className="prediction__advisory-body">
              <p className="prediction__advisory-desc">{meta.advice}</p>
              <div className="prediction__advisory-grid">
                <div className="prediction__advisory-item">
                  <CheckCircle2 size={15} className="prediction__check-icon" />
                  <div>
                    <strong>Outdoor Exposure:</strong>
                    <span>Limit strenuous physical activities and extended outdoor workouts during morning peak hours (07:00–10:00).</span>
                  </div>
                </div>
                <div className="prediction__advisory-item">
                  <CheckCircle2 size={15} className="prediction__check-icon" />
                  <div>
                    <strong>Respiratory Protection:</strong>
                    <span>Consider wearing a well-fitted N95 mask when commuting across arterial roadways with elevated PM2.5 levels.</span>
                  </div>
                </div>
                <div className="prediction__advisory-item">
                  <CheckCircle2 size={15} className="prediction__check-icon" />
                  <div>
                    <strong>Indoor Ventilation:</strong>
                    <span>Keep residential and office windows closed during traffic spikes; operate HEPA air purifiers if available.</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 24-Hour Projected AQI Curve Chart */}
          <PredictionHourlyChart
            city={result.city}
            date={result.date}
            time={result.time}
            targetAqi={result.aqi}
          />
        </div>
      )}
    </div>
  );
}
