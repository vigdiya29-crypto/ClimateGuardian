import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Leaf,
  Award,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Card from '../../components/Card/Card';
import StatCard from '../../components/StatCard/StatCard';
import { modelMetrics } from '../../data/placeholderData';
import {
  CARBON_STORAGE_KEY,
  calculateCarbonFootprint,
  initialForm,
} from '../Carbon/Carbon';
import {
  ActualVsPredictedChart,
  FeatureImportanceChart,
  ResidualPlotChart,
  AQITrend90DayChart,
} from './ReportCharts';
import './Reports.css';

export default function Reports() {
  const [showTechnicalNotes, setShowTechnicalNotes] = useState(false);
  const [carbonData, setCarbonData] = useState(() => {
    try {
      const saved = localStorage.getItem(CARBON_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.total_emission !== 'undefined') {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return calculateCarbonFootprint(initialForm);
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CARBON_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.total_emission !== 'undefined') {
          setCarbonData(parsed);
        }
      }
    } catch (err) {
      console.warn('Could not read carbon result in reports', err);
    }
  }, []);

  const totalMonthly = Number(carbonData.total_emission || carbonData.totalKg || 0);
  const annualTonnes = ((totalMonthly * 12) / 1000).toFixed(2);
  const perPerson = Number(carbonData.per_person || carbonData.perPersonKg || totalMonthly).toFixed(2);
  const trees = carbonData.trees_required ?? carbonData.treesRequired ?? Math.round(totalMonthly / 21);
  const sustainabilityScore = carbonData.score ?? carbonData.sustainabilityScore ?? 85;
  const category = carbonData.category || 'Moderate';
  const badgeClass = carbonData.badgeClass || 'badge-moderate';

  const electricityVal = carbonData.electricity_emission ?? 0;
  const vehicleVal = carbonData.vehicle_emission ?? 0;
  const gasVal = carbonData.gas_emission ?? 0;
  const foodVal = carbonData.food_emission ?? 0;

  const breakdown = carbonData.breakdown || [
    { label: 'Electricity', value: electricityVal, percentage: 70, color: '#3B82F6' },
    { label: 'Transportation', value: vehicleVal, percentage: 15, color: '#10B981' },
    { label: 'Cooking Fuel', value: gasVal, percentage: 5, color: '#F59E0B' },
    { label: 'Food', value: foodVal, percentage: 10, color: '#EC4899' },
  ];

  const largestContributor = carbonData.largestContributor || breakdown[0];
  const recommendations = carbonData.recommendations || [];

  return (
    <div className="page-container reports-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow">Audit &amp; Intelligence</span>
          <h1 className="page-title">Reports &amp; Analytics</h1>
          <p className="page-subtitle">
            Comprehensive audit of household carbon footprint diagnostics and AQI forecasting accuracy.
          </p>
        </div>
        <div className="reports__actions">
          <button className="btn btn-ghost btn-sm">
            <FileText size={14} /> Export PDF
          </button>
          <button className="btn btn-ghost btn-sm">
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm">
            <Download size={14} /> Download Report
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CARBON FOOTPRINT AUDIT SECTION */}
      {/* ========================================================================= */}
      <div className="reports__section-header">
        <div className="reports__section-title-wrap">
          <div className="reports__section-icon-wrap">
            <Leaf size={15} />
          </div>
          <div>
            <h2 className="reports__section-title">Household Carbon Footprint Audit</h2>
            <p className="reports__section-subtitle">
              GHG Protocol standards assessment from your latest habit parameters.
            </p>
          </div>
        </div>
        <Link to="/carbon-calculator" className="reports__recalc-btn">
          <span>Recalculate Footprint</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Carbon KPI Grid (6 Compact Cards) */}
      <div className="reports__kpi-grid">
        <StatCard
          label="Monthly Footprint"
          value={totalMonthly}
          unit="kg CO₂/mo"
          accent="var(--fresh-green)"
        />
        <StatCard
          label="Estimated Annual"
          value={annualTonnes}
          unit="tonnes/yr"
          accent="var(--sky)"
        />
        <StatCard
          label="Per-Person Emission"
          value={perPerson}
          unit="kg/mo"
          accent="var(--warning)"
        />
        <StatCard
          label="Sustainability Score"
          value={`${sustainabilityScore}/100`}
          accent="var(--fresh-green)"
        />
        <StatCard
          label="Trees Required"
          value={trees}
          unit="trees/yr"
          accent="var(--fresh-green)"
        />
        <StatCard
          label="Impact Category"
          value={category}
          accent={
            category === 'Low'
              ? 'var(--fresh-green)'
              : category === 'Moderate'
              ? 'var(--warning)'
              : 'var(--danger)'
          }
        />
      </div>

      {/* Emission Sources Breakdown & Recommendations Row */}
      <div className="reports__dual-grid">
        {/* Source Breakdown Card */}
        <Card className="reports__card">
          <div className="reports__card-head">
            <div>
              <span className="eyebrow">Distribution</span>
              <h3 className="reports__card-title">Emission Sources Breakdown</h3>
            </div>
            <span className={`badge ${badgeClass}`}>{category} Impact</span>
          </div>

          <div className="reports__sources-list">
            {breakdown.map((item, idx) => {
              const pct = item.percentage || item.pct || 0;
              return (
                <div key={item.key || idx} className="reports__source-item">
                  <div className="reports__source-labels">
                    <div className="reports__source-info">
                      <span
                        className="reports__source-dot"
                        style={{ backgroundColor: item.color || 'var(--fresh-green)' }}
                      />
                      <span className="reports__source-name">{item.label}</span>
                    </div>
                    <div className="reports__source-vals">
                      <strong>{item.value} kg</strong>
                      <span className="reports__source-pct">({pct}%)</span>
                    </div>
                  </div>
                  <div className="reports__source-track">
                    <div
                      className="reports__source-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color || 'var(--fresh-green)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {largestContributor && (
            <div className="reports__top-source-box">
              <AlertTriangle size={15} className="reports__top-source-icon" />
              <div>
                <strong>Primary Contributor: {largestContributor.label}</strong>
                <p>
                  Generates {largestContributor.value} kg CO₂/month ({largestContributor.percentage || largestContributor.pct}% of total emissions).
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Action Recommendations Card */}
        <Card className="reports__card">
          <div className="reports__card-head">
            <div>
              <span className="eyebrow">Reduction Strategy</span>
              <h3 className="reports__card-title">Key Action Recommendations</h3>
            </div>
            <span className="reports__recs-count">{recommendations.length} Action Items</span>
          </div>

          <div className="reports__recs-list">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="reports__rec-item">
                <div className="reports__rec-icon-wrap">
                  <TrendingUp size={13} />
                </div>
                <div className="reports__rec-body">
                  <div className="reports__rec-header">
                    <span className="reports__rec-title">{rec.title}</span>
                    {rec.saving && (
                      <span className="reports__rec-badge">{rec.saving}</span>
                    )}
                  </div>
                  <p className="reports__rec-desc">{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 2. AQI PREDICTION MODEL EVALUATION SECTION */}
      {/* ========================================================================= */}
      <div className="reports__section-header" style={{ marginTop: 'var(--space-5)' }}>
        <div className="reports__section-title-wrap">
          <div
            className="reports__section-icon-wrap"
            style={{
              background: 'rgba(var(--sky-rgb), 0.12)',
              color: 'var(--sky)',
            }}
          >
            <Award size={15} />
          </div>
          <div>
            <h2 className="reports__section-title">AQI Prediction Model Evaluation</h2>
            <p className="reports__section-subtitle">
              Validation accuracy benchmarks for the XGBoost ensemble forecasting engine.
            </p>
          </div>
        </div>
      </div>

      {/* Model Metrics Grid */}
      <div className="reports__kpi-grid">
        <StatCard label="R² Score" value={modelMetrics.r2} accent="var(--fresh-green)" />
        <StatCard label="Mean Absolute Error" value={modelMetrics.mae} unit="µg/m³" accent="var(--sky)" />
        <StatCard label="Root Mean Sq. Error" value={modelMetrics.rmse} unit="µg/m³" accent="var(--warning)" />
        <StatCard label="MAPE" value={`${modelMetrics.mape}%`} accent="var(--danger)" />
        <StatCard label="Cross-Validation" value={modelMetrics.cvScore} accent="var(--fresh-green)" />
        <StatCard label="Prediction Confidence" value={`${Math.round(modelMetrics.confidence * 100)}%`} accent="var(--sky)" />
      </div>

      {/* Real Charts Grid 1 */}
      <div className="reports__dual-grid">
        <ActualVsPredictedChart />
        <FeatureImportanceChart />
      </div>

      {/* Real Charts Grid 2 */}
      <div className="reports__dual-grid">
        <ResidualPlotChart />
        <AQITrend90DayChart />
      </div>

      {/* ========================================================================= */}
      {/* 3. TECHNICAL NOTES & API REFERENCE (COLLAPSIBLE DRAWER) */}
      {/* ========================================================================= */}
      <div className="reports__notes-drawer">
        <button
          type="button"
          className="reports__notes-toggle"
          onClick={() => setShowTechnicalNotes((prev) => !prev)}
          aria-expanded={showTechnicalNotes}
        >
          <div className="reports__notes-toggle-left">
            <Code2 size={14} className="text-muted" />
            <span>Technical Reference &amp; API Integration Notes</span>
          </div>
          {showTechnicalNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showTechnicalNotes && (
          <div className="reports__notes-content">
            <p className="reports__note">
              Model metrics reflect standard test splits. Live API bindings can replace <code>modelMetrics</code> in{' '}
              <code>src/data/placeholderData.js</code> via <code>GET /api/reports/metrics</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
