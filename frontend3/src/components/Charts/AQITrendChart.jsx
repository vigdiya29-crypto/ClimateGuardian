import { useState } from 'react';
import { getAqiMeta } from '../../utils/aqiUtils';
import './AQITrendChart.css';

const DEFAULT_TREND_DATA = [
  { day: 'Mon', date: 'Jul 14', aqi: 142, mainPollutant: 'PM2.5' },
  { day: 'Tue', date: 'Jul 15', aqi: 156, mainPollutant: 'PM2.5' },
  { day: 'Wed', date: 'Jul 16', aqi: 148, mainPollutant: 'PM2.5' },
  { day: 'Thu', date: 'Jul 17', aqi: 175, mainPollutant: 'PM10' },
  { day: 'Fri', date: 'Jul 18', aqi: 162, mainPollutant: 'PM2.5' },
  { day: 'Sat', date: 'Jul 19', aqi: 180, mainPollutant: 'PM2.5' },
  { day: 'Sun', date: 'Today', aqi: 168, mainPollutant: 'PM2.5', isToday: true },
];

export default function AQITrendChart({
  title = 'AQI Trend — Last 7 Days',
  subtitle = 'Delhi · 24h rolling average',
  data = DEFAULT_TREND_DATA,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(data.length - 1); // Default to today

  // Chart dimensions and coordinate mapping
  const width = 520;
  const height = 180;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const maxVal = 250;

  const getY = (val) => padTop + chartH - (val / maxVal) * chartH;
  const getX = (idx) => padLeft + (idx / (data.length - 1)) * chartW;

  // Generate SVG path points
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.aqi), ...d }));

  // Build smooth cubic bezier curve path
  const pathD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x},${curr.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${padTop + chartH} L ${points[0].x},${padTop + chartH} Z`;

  const yTicks = [0, 50, 100, 150, 200, 250];
  const activePoint = points[hoveredIdx] || points[points.length - 1];
  const activeMeta = getAqiMeta(activePoint.aqi);

  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <div>
          <h4 className="chart-card__title">{title}</h4>
          <p className="chart-card__subtitle">{subtitle}</p>
        </div>
        <div className="chart-card__tags">
          <span className="chart-card__stat-pill">7d Avg: <strong>161</strong></span>
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
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sky)" stopOpacity="0.32" />
              <stop offset="80%" stopColor="var(--fresh-green)" stopOpacity="0.04" />
              <stop offset="100%" stopColor="var(--fresh-green)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--sky)" />
              <stop offset="100%" stopColor="#57D97A" />
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

          {/* Fill Area */}
          <path d={areaD} fill="url(#trendGradient)" className="chart-card__area" />

          {/* Main Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#trendStroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="chart-card__line"
          />

          {/* Active hover vertical guideline */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={padTop + chartH}
              className="chart-card__hover-line"
            />
          )}

          {/* Data Points and invisible hover hitboxes */}
          {points.map((pt, i) => {
            const isActive = i === hoveredIdx;
            return (
              <g
                key={i}
                className="chart-card__point-group"
                onMouseEnter={() => setHoveredIdx(i)}
              >
                {/* Invisible larger hitbox for easy hovering */}
                <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" style={{ cursor: 'pointer' }} />

                {isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    className="chart-card__point-ring"
                    style={{ stroke: activeMeta.color }}
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? "5" : "3.5"}
                  className="chart-card__point-dot"
                  style={{ fill: isActive ? activeMeta.color : 'var(--sky)' }}
                />

                {/* X-axis labels */}
                <text
                  x={pt.x}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  className={`chart-card__x-label ${isActive ? 'is-active' : ''}`}
                >
                  {pt.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip info bar */}
        {activePoint && (
          <div
            className="chart-card__tooltip"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
            }}
          >
            <div className="chart-card__tooltip-head">
              <strong>{activePoint.date}</strong>
              <span className="chart-card__tooltip-badge" style={{ color: activeMeta.color }}>
                {activeMeta.label}
              </span>
            </div>
            <div className="chart-card__tooltip-val">
              <span>{activePoint.aqi} AQI</span>
              <span className="chart-card__tooltip-sub">Main: {activePoint.mainPollutant}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
