import { useState } from 'react';
import './PredictionGraphChart.css';

const DEFAULT_PREDICTION_DATA = [
  { time: '00:00', actual: 152, predicted: 150, delta: '-2', status: 'Historical' },
  { time: '04:00', actual: 144, predicted: 148, delta: '+4', status: 'Historical' },
  { time: '08:00', actual: 172, predicted: 168, delta: '-4', status: 'Historical' },
  { time: '12:00', actual: 165, predicted: 162, delta: '-3', status: 'Historical' },
  { time: '16:00', actual: 158, predicted: 160, delta: '+2', status: 'Historical' },
  { time: '20:00', actual: 168, predicted: 170, delta: '+2', status: 'Latest' },
  { time: 'Tomorrow', actual: null, predicted: 182, delta: 'Forecast', confidence: '91%', isForecast: true },
];

export default function PredictionGraphChart({
  title = 'Prediction Graph',
  subtitle = 'XGBoost ML forecast vs ground-truth actuals',
  data = DEFAULT_PREDICTION_DATA,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(data.length - 1); // Default to latest/forecast point

  const width = 520;
  const height = 180;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const maxVal = 250;

  const getY = (val) => (val == null ? null : padTop + chartH - (val / maxVal) * chartH);
  const getX = (idx) => padLeft + (idx / (data.length - 1)) * chartW;

  const actualPoints = data
    .map((d, i) => (d.actual != null ? { x: getX(i), y: getY(d.actual), idx: i, val: d.actual } : null))
    .filter(Boolean);

  const predictedPoints = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.predicted),
    idx: i,
    val: d.predicted,
    ...d,
  }));

  // Build Actual Path
  const actualPathD = actualPoints.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x},${curr.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }, '');

  // Build Predicted Path
  const predictedPathD = predictedPoints.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x},${curr.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }, '');

  const yTicks = [0, 50, 100, 150, 200, 250];
  const activeItem = data[hoveredIdx] || data[data.length - 1];
  const activeX = getX(hoveredIdx);

  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <div>
          <h4 className="chart-card__title">{title}</h4>
          <p className="chart-card__subtitle">{subtitle}</p>
        </div>
        <div className="chart-card__tags">
          <div className="chart-legend">
            <span className="chart-legend__item">
              <span className="chart-legend__dot chart-legend__dot--actual" /> Actual
            </span>
            <span className="chart-legend__item">
              <span className="chart-legend__dot chart-legend__dot--predicted" /> Predicted
            </span>
          </div>
          <span className="chart-card__demo-tag">
            <span className="chart-card__demo-dot" /> Demo data
          </span>
        </div>
      </div>

      <div className="chart-card__body">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="chart-card__svg"
          onMouseLeave={() => setHoveredIdx(data.length - 1)}
        >
          <defs>
            <linearGradient id="predAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#57D97A" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#57D97A" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val} className="chart-card__grid-row">
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  className="chart-card__grid-line"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="chart-card__axis-label"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Predicted Line (Dashed) */}
          <path
            d={predictedPathD}
            fill="none"
            stroke="#57D97A"
            strokeWidth="2.2"
            strokeDasharray="5 4"
            strokeLinecap="round"
            className="pred-chart__line-pred"
          />

          {/* Actual Line (Solid Cyan) */}
          <path
            d={actualPathD}
            fill="none"
            stroke="var(--sky)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="pred-chart__line-actual"
          />

          {/* Hover guideline */}
          {activeX != null && (
            <line
              x1={activeX}
              y1={padTop}
              x2={activeX}
              y2={padTop + chartH}
              className="chart-card__hover-line"
            />
          )}

          {/* Predicted Points */}
          {predictedPoints.map((pt, i) => {
            const isActive = i === hoveredIdx;
            return (
              <g key={`pred-${i}`} className="pred-chart__point">
                {isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    className="chart-card__point-ring"
                    style={{ stroke: '#57D97A' }}
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? "5" : "3.5"}
                  fill="#57D97A"
                />
              </g>
            );
          })}

          {/* Actual Points */}
          {actualPoints.map((pt, i) => {
            const isActive = pt.idx === hoveredIdx;
            return (
              <g key={`act-${i}`} className="pred-chart__point">
                {isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    className="chart-card__point-ring"
                    style={{ stroke: 'var(--sky)' }}
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? "5" : "3.5"}
                  fill="var(--sky)"
                />
              </g>
            );
          })}

          {/* Interactive Hitbox Columns */}
          {data.map((d, i) => {
            const x = getX(i);
            const isActive = i === hoveredIdx;
            return (
              <g
                key={`hit-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x - (chartW / (data.length - 1)) / 2}
                  y={padTop}
                  width={chartW / (data.length - 1)}
                  height={chartH}
                  fill="transparent"
                />
                <text
                  x={x}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  className={`chart-card__x-label ${isActive ? 'is-active' : ''}`}
                >
                  {d.time}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {activeItem && (
          <div
            className="chart-card__tooltip"
            style={{
              left: `${(activeX / width) * 100}%`,
            }}
          >
            <div className="chart-card__tooltip-head">
              <strong>{activeItem.time}</strong>
              {activeItem.isForecast ? (
                <span className="pred-tooltip__badge pred-tooltip__badge--forecast">
                  Forecast ({activeItem.confidence})
                </span>
              ) : (
                <span className="pred-tooltip__badge">
                  Δ {activeItem.delta}
                </span>
              )}
            </div>
            <div className="pred-tooltip__body">
              {activeItem.actual != null && (
                <div className="pred-tooltip__row">
                  <span className="pred-tooltip__label">
                    <span className="chart-legend__dot chart-legend__dot--actual" /> Actual:
                  </span>
                  <strong>{activeItem.actual} AQI</strong>
                </div>
              )}
              <div className="pred-tooltip__row">
                <span className="pred-tooltip__label">
                  <span className="chart-legend__dot chart-legend__dot--predicted" /> Predicted:
                </span>
                <strong style={{ color: '#57D97A' }}>{activeItem.predicted} AQI</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
