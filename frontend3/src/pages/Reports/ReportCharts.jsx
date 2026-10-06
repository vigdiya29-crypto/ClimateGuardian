import { useState } from 'react';
import Card from '../../components/Card/Card';
import './ReportCharts.css';

// ---------------------------------------------------------------------------
// 1. Actual vs Predicted AQI Validation Chart
// ---------------------------------------------------------------------------
const VALIDATION_DATA = [
  { day: 'Day 1', actual: 152, predicted: 150 },
  { day: 'Day 2', actual: 168, predicted: 164 },
  { day: 'Day 3', actual: 175, predicted: 171 },
  { day: 'Day 4', actual: 142, predicted: 146 },
  { day: 'Day 5', actual: 180, predicted: 176 },
  { day: 'Day 6', actual: 165, predicted: 162 },
  { day: 'Day 7', actual: 158, predicted: 160 },
  { day: 'Day 8', actual: 172, predicted: 169 },
  { day: 'Day 9', actual: 185, predicted: 181 },
  { day: 'Day 10', actual: 160, predicted: 158 },
  { day: 'Day 11', actual: 168, predicted: 165 },
  { day: 'Day 12', actual: 174, predicted: 170 },
  { day: 'Day 13', actual: 155, predicted: 157 },
  { day: 'Day 14', actual: 168, predicted: 166 },
];

export function ActualVsPredictedChart() {
  const [hoveredIdx, setHoveredIdx] = useState(VALIDATION_DATA.length - 1);

  const width = 500;
  const height = 190;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 28;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const minVal = 130;
  const maxVal = 200;

  const getX = (idx) => padLeft + (idx / (VALIDATION_DATA.length - 1)) * chartW;
  const getY = (val) => padTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  const actualPoints = VALIDATION_DATA.map((d, i) => ({ x: getX(i), y: getY(d.actual), ...d }));
  const predPoints = VALIDATION_DATA.map((d, i) => ({ x: getX(i), y: getY(d.predicted), ...d }));

  const makePath = (pts) =>
    pts.reduce((acc, curr, i, arr) => {
      if (i === 0) return `M ${curr.x},${curr.y}`;
      const prev = arr[i - 1];
      const cpX = (prev.x + curr.x) / 2;
      return `${acc} C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
    }, '');

  const actualPathD = makePath(actualPoints);
  const predPathD = makePath(predPoints);

  const activeItem = VALIDATION_DATA[hoveredIdx] || VALIDATION_DATA[VALIDATION_DATA.length - 1];
  const delta = Math.abs(activeItem.actual - activeItem.predicted);

  return (
    <Card className="report-chart-card">
      <div className="report-chart-card__head">
        <div>
          <h4 className="report-chart-card__title">Actual vs. Predicted AQI</h4>
          <p className="report-chart-card__subtitle">
            14-day holdout validation set · R² = 0.94
          </p>
        </div>
        <div className="report-chart-card__readout">
          <span className="report-chart-card__readout-label">{activeItem.day}:</span>
          <strong>Actual {activeItem.actual}</strong> vs <strong>Pred {activeItem.predicted}</strong>
          <span className="report-chart-card__delta">(&Delta; {delta} pts)</span>
        </div>
      </div>

      <div className="report-chart-card__body">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="report-chart-svg"
          onMouseLeave={() => setHoveredIdx(VALIDATION_DATA.length - 1)}
        >
          {/* Y Axis Grid Lines */}
          {[140, 160, 180, 200].map((val) => {
            const y = getY(val);
            return (
              <g key={val} className="report-chart__grid-row">
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                <text x={padLeft - 6} y={y + 3.5} textAnchor="end" className="report-chart__axis-label">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Actual Line (Sky) */}
          <path d={actualPathD} fill="none" stroke="var(--sky)" strokeWidth="2.2" strokeLinecap="round" />

          {/* Predicted Line (Fresh Green) */}
          <path
            d={predPathD}
            fill="none"
            stroke="var(--fresh-green)"
            strokeWidth="2.2"
            strokeDasharray="4 2"
            strokeLinecap="round"
          />

          {/* Interactive Trigger Points */}
          {actualPoints.map((pt, i) => {
            const isHovered = i === hoveredIdx;
            return (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4.5 : 2.5}
                  fill="var(--sky)"
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                />
                <circle
                  cx={predPoints[i].x}
                  cy={predPoints[i].y}
                  r={isHovered ? 4.5 : 2.5}
                  fill="var(--fresh-green)"
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                />
                <rect
                  x={pt.x - chartW / VALIDATION_DATA.length / 2}
                  y={padTop}
                  width={chartW / VALIDATION_DATA.length}
                  height={chartH + padBottom}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {actualPoints.map((pt, i) => {
            if (i === 0 || i === 4 || i === 8 || i === 13) {
              return (
                <text
                  key={i}
                  x={pt.x}
                  y={padTop + chartH + 16}
                  textAnchor="middle"
                  className="report-chart__axis-label"
                >
                  {pt.day}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>

      <div className="report-chart-card__legend">
        <span className="report-chart-legend-item">
          <span className="report-chart-dot" style={{ backgroundColor: 'var(--sky)' }} /> Actual AQI
        </span>
        <span className="report-chart-legend-item">
          <span className="report-chart-dot" style={{ backgroundColor: 'var(--fresh-green)' }} /> XGBoost Forecast
        </span>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 2. Feature Importance Ranking (XGBoost Gain-Based Ranking)
// ---------------------------------------------------------------------------
const FEATURE_IMPORTANCE = [
  { name: 'PM2.5 Concentration', gain: 38, category: 'Particulate' },
  { name: 'PM10 Particulate', gain: 24, category: 'Particulate' },
  { name: 'Wind Speed & Dispersion', gain: 15, category: 'Meteorology' },
  { name: 'Relative Humidity', gain: 11, category: 'Meteorology' },
  { name: 'Ambient Temperature', gain: 7, category: 'Meteorology' },
  { name: 'NO₂ Vehicle Emissions', gain: 5, category: 'Combustion' },
];

export function FeatureImportanceChart() {
  return (
    <Card className="report-chart-card">
      <div className="report-chart-card__head">
        <div>
          <h4 className="report-chart-card__title">Feature Importance Ranking</h4>
          <p className="report-chart-card__subtitle">
            Relative gain contribution across ensemble decision trees
          </p>
        </div>
      </div>

      <div className="report-features-list">
        {FEATURE_IMPORTANCE.map((item, i) => (
          <div key={i} className="report-feature-row">
            <div className="report-feature-info">
              <span className="report-feature-name">{item.name}</span>
              <span className="report-feature-tag">{item.category}</span>
            </div>
            <div className="report-feature-bar-wrap">
              <div className="report-feature-track">
                <div
                  className="report-feature-fill"
                  style={{
                    width: `${item.gain}%`,
                    background: i === 0 ? 'var(--fresh-green)' : i === 1 ? '#57D97A' : 'var(--sky)',
                  }}
                />
              </div>
              <span className="report-feature-val">{item.gain}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 3. Residual Error Distribution Chart
// ---------------------------------------------------------------------------
const RESIDUAL_BINS = [
  { range: '-15 to -10', count: 6, label: '-12 µg/m³' },
  { range: '-10 to -5', count: 18, label: '-7 µg/m³' },
  { range: '-5 to 0', count: 42, label: '-2 µg/m³' },
  { range: '0 to +5', count: 48, label: '+2 µg/m³' },
  { range: '+5 to +10', count: 20, label: '+7 µg/m³' },
  { range: '+10 to +15', count: 8, label: '+12 µg/m³' },
];

export function ResidualPlotChart() {
  const maxCount = 50;

  return (
    <Card className="report-chart-card">
      <div className="report-chart-card__head">
        <div>
          <h4 className="report-chart-card__title">Residual Error Distribution</h4>
          <p className="report-chart-card__subtitle">
            Prediction variance centered at zero error · MAE &plusmn;8.2 µg/m³
          </p>
        </div>
      </div>

      <div className="report-histogram">
        {RESIDUAL_BINS.map((bin, idx) => (
          <div key={idx} className="report-histogram-col">
            <span className="report-histogram-val">{bin.count}</span>
            <div className="report-histogram-track">
              <div
                className="report-histogram-fill"
                style={{
                  height: `${(bin.count / maxCount) * 100}%`,
                  background:
                    idx === 2 || idx === 3
                      ? 'var(--fresh-green)'
                      : idx === 1 || idx === 4
                      ? 'var(--sky)'
                      : 'var(--warning)',
                }}
              />
            </div>
            <span className="report-histogram-label">{bin.label}</span>
          </div>
        ))}
      </div>

      <div className="report-chart-card__footer-note">
        <span>Zero Error Center (&plusmn;0 µg/m³)</span>
        <span className="report-badge-pill">Normal Gaussian Spread</span>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 4. 90-Day AQI Environmental Trend Chart
// ---------------------------------------------------------------------------
const TREND_90_DAYS = [
  { label: 'May W1', aqi: 188 },
  { label: 'May W3', aqi: 172 },
  { label: 'Jun W1', aqi: 154 },
  { label: 'Jun W3', aqi: 138 },
  { label: 'Jul W1', aqi: 118 },
  { label: 'Jul W3', aqi: 96 },
  { label: 'Aug W1', aqi: 110 },
  { label: 'Aug W3', aqi: 124 },
];

export function AQITrend90DayChart() {
  const width = 500;
  const height = 190;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 28;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const maxVal = 220;

  const getX = (idx) => padLeft + (idx / (TREND_90_DAYS.length - 1)) * chartW;
  const getY = (val) => padTop + chartH - (val / maxVal) * chartH;

  const points = TREND_90_DAYS.map((d, i) => ({ x: getX(i), y: getY(d.aqi), ...d }));

  const pathD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x},${curr.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${padTop + chartH} L ${points[0].x},${
    padTop + chartH
  } Z`;

  const safeLineY = getY(100);

  return (
    <Card className="report-chart-card">
      <div className="report-chart-card__head">
        <div>
          <h4 className="report-chart-card__title">90-Day Rolling AQI Trend</h4>
          <p className="report-chart-card__subtitle">
            Seasonal monsoon air quality recovery pattern
          </p>
        </div>
      </div>

      <div className="report-chart-card__body">
        <svg viewBox={`0 0 ${width} ${height}`} className="report-chart-svg">
          <defs>
            <linearGradient id="aqiTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--fresh-green)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--fresh-green)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[50, 100, 150, 200].map((val) => {
            const y = getY(val);
            return (
              <g key={val} className="report-chart__grid-row">
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                <text x={padLeft - 6} y={y + 3.5} textAnchor="end" className="report-chart__axis-label">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Standard 100 Target line */}
          <line
            x1={padLeft}
            y1={safeLineY}
            x2={width - padRight}
            y2={safeLineY}
            stroke="#57D97A"
            strokeDasharray="4 3"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <text
            x={width - padRight}
            y={safeLineY - 4}
            textAnchor="end"
            fill="#57D97A"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            Satisfactory Baseline (100)
          </text>

          {/* Area & Line */}
          <path d={areaD} fill="url(#aqiTrendGrad)" />
          <path d={pathD} fill="none" stroke="var(--fresh-green)" strokeWidth="2.4" strokeLinecap="round" />

          {/* Points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={3}
              fill="var(--fresh-green)"
              stroke="var(--surface)"
              strokeWidth="1.5"
            />
          ))}

          {/* X labels */}
          {points.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={padTop + chartH + 16}
              textAnchor="middle"
              className="report-chart__axis-label"
            >
              {pt.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="report-chart-card__footer-note">
        <span>Monsoon precipitation significantly reduces PM10 &amp; PM2.5 levels.</span>
      </div>
    </Card>
  );
}
