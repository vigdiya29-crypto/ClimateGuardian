import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CloudLightning,
  Filter,
  Bell,
  ShieldAlert,
  MapPin,
  Clock,
  CheckCircle2,
  Wind,
  Info,
} from 'lucide-react';
import Card from '../../components/Card/Card';
import CitySelector from '../../components/CitySelector/CitySelector';
import { alerts, INDIAN_CITIES } from '../../data/placeholderData';
import { getAlerts } from '../../services/api';
import './Alerts.css';

export default function Alerts() {
  const [city, setCity] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [alertsList, setAlertsList] = useState(alerts);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveAlerts() {
      try {
        const live = await getAlerts(city, typeFilter);
        if (isMounted && Array.isArray(live)) {
          setAlertsList(live);
        }
      } catch (err) {
        console.warn('Alerts fetch error:', err);
      }
    }
    fetchLiveAlerts();
    return () => { isMounted = false; };
  }, [city, typeFilter]);

  const filtered = alertsList.filter((a) => {
    const matchesCity = city === 'All' || a.city.toLowerCase() === city.toLowerCase();
    const matchesType = typeFilter === 'All' || a.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesCity && matchesType;
  });

  const totalCount = alertsList.length;
  const criticalCount = alertsList.filter((a) => a.severity === 'poor').length;
  const weatherCount = alertsList.filter((a) => a.type === 'weather').length;
  const aqiCount = alertsList.filter((a) => a.type === 'aqi').length;

  const getAlertIcon = (type, severity) => {
    if (type === 'weather') return <CloudLightning size={16} />;
    if (severity === 'good') return <CheckCircle2 size={16} />;
    if (severity === 'poor') return <ShieldAlert size={16} />;
    return <AlertTriangle size={16} />;
  };

  const getAlertAccent = (severity) => {
    if (severity === 'poor') return 'var(--danger)';
    if (severity === 'moderate') return 'var(--warning)';
    return 'var(--fresh-green)';
  };

  const getSeverityBadgeClass = (severity) => {
    if (severity === 'poor') return 'badge-poor';
    if (severity === 'moderate') return 'badge-moderate';
    return 'badge-good';
  };

  const getSeverityLabel = (severity) => {
    if (severity === 'poor') return 'High Severity';
    if (severity === 'moderate') return 'Moderate Advisory';
    return 'Status Update';
  };

  return (
    <div className="page-container alerts-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-header__meta-row">
            <span className="eyebrow">Real-Time Broadcast</span>
            <span className="alerts__live-indicator">
              <span className="live-dot" /> Live Monitoring · 4 Zones
            </span>
          </div>
          <h1 className="page-title">Environmental &amp; AQI Alerts</h1>
          <p className="page-subtitle">
            Critical air quality threshold spikes, meteorological advisories, and zone notifications across India.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="alerts__header-controls">
          <CitySelector
            value={city}
            onChange={setCity}
            cities={['All', ...INDIAN_CITIES]}
          />
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="alerts__kpi-strip">
        <div className="alerts__kpi-chip">
          <span className="alerts__kpi-chip-label">Active Alerts</span>
          <strong className="alerts__kpi-chip-val">{totalCount}</strong>
        </div>
        <div className="alerts__kpi-chip alerts__kpi-chip--danger">
          <span className="alerts__kpi-chip-label">High Severity</span>
          <strong className="alerts__kpi-chip-val text-danger">{criticalCount}</strong>
        </div>
        <div className="alerts__kpi-chip">
          <span className="alerts__kpi-chip-label">AQI Spikes</span>
          <strong className="alerts__kpi-chip-val">{aqiCount}</strong>
        </div>
        <div className="alerts__kpi-chip">
          <span className="alerts__kpi-chip-label">Weather Warnings</span>
          <strong className="alerts__kpi-chip-val">{weatherCount}</strong>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="alerts__filter-bar">
        <div className="alerts__filter-pills">
          <button
            type="button"
            className={`alerts__filter-btn ${typeFilter === 'All' ? 'is-active' : ''}`}
            onClick={() => setTypeFilter('All')}
          >
            <Bell size={13} />
            <span>All Alerts</span>
            <span className="alerts__filter-count">{alerts.length}</span>
          </button>
          <button
            type="button"
            className={`alerts__filter-btn ${typeFilter === 'aqi' ? 'is-active' : ''}`}
            onClick={() => setTypeFilter('aqi')}
          >
            <Wind size={13} />
            <span>AQI Thresholds</span>
            <span className="alerts__filter-count">{aqiCount}</span>
          </button>
          <button
            type="button"
            className={`alerts__filter-btn ${typeFilter === 'weather' ? 'is-active' : ''}`}
            onClick={() => setTypeFilter('weather')}
          >
            <CloudLightning size={13} />
            <span>Weather Advisories</span>
            <span className="alerts__filter-count">{weatherCount}</span>
          </button>
        </div>

        {city !== 'All' && (
          <div className="alerts__active-filter-tag">
            <MapPin size={12} />
            <span>Filtered by: <strong>{city}</strong></span>
            <button
              type="button"
              className="alerts__clear-filter"
              onClick={() => setCity('All')}
              title="Clear city filter"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Alerts Feed List */}
      <div className="alerts__list">
        {filtered.length === 0 ? (
          <Card className="alerts__empty">
            <Filter size={24} className="text-muted" />
            <h4>No Active Alerts</h4>
            <p>
              There are no matching notifications for {city === 'All' ? 'the selected filter' : `${city} zone`} at this moment. Air quality parameters remain within standard operating ranges.
            </p>
            {(city !== 'All' || typeFilter !== 'All') && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: '8px' }}
                onClick={() => {
                  setCity('All');
                  setTypeFilter('All');
                }}
              >
                Reset All Filters
              </button>
            )}
          </Card>
        ) : (
          filtered.map((a) => {
            const accent = getAlertAccent(a.severity);
            const badgeClass = getSeverityBadgeClass(a.severity);
            const severityLabel = getSeverityLabel(a.severity);
            const icon = getAlertIcon(a.type, a.severity);

            return (
              <Card
                key={a.id}
                className="alerts__item-card"
                accent={accent}
              >
                <div className="alerts__item-layout">
                  {/* Left Severity Icon */}
                  <div className={`alerts__icon-box severity-${a.severity}`}>
                    {icon}
                  </div>

                  {/* Main Alert Body */}
                  <div className="alerts__body">
                    <div className="alerts__top-row">
                      <div className="alerts__meta-tags">
                        <span className={`badge ${badgeClass}`}>
                          {a.type === 'weather' ? 'Weather Warning' : 'AQI Threshold'}
                        </span>
                        <span className="alerts__severity-tag">
                          {severityLabel}
                        </span>
                        <span className="alerts__city-tag">
                          <MapPin size={11} /> {a.city}
                        </span>
                      </div>

                      <div className="alerts__time-wrap">
                        <Clock size={11} />
                        <span className="alerts__time">{a.time}</span>
                      </div>
                    </div>

                    <p className="alerts__message">{a.message}</p>

                    <div className="alerts__footer-row">
                      <span className="alerts__advisory-hint">
                        {a.severity === 'poor' ? (
                          <>
                            <Info size={12} className="text-danger" /> Sensitive groups should avoid prolonged outdoor exposure.
                          </>
                        ) : a.type === 'weather' ? (
                          <>
                            <Info size={12} className="text-warning" /> Expect localized rain and gusty winds in affected sectors.
                          </>
                        ) : (
                          <>
                            <Info size={12} className="text-green" /> Ambient air conditions are currently favorable.
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
