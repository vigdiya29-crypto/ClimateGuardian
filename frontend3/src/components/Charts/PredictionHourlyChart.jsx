import { useState } from 'react';
import { getAqiMeta } from '../../utils/aqiUtils';
import './PredictionHourlyChart.css';

const DEFAULT_HOURLY_DATA = [
  { time: '00:00', aqi: 152, mainPollutant: 'PM2.5' },
  { time: '03:00', aqi: 146, mainPollutant: 'PM2.5' },
  { time: '06:00', aqi: 165, mainPollutant: 'PM2.5' },
  { time: '09:00', aqi: 182, mainPollutant: 'PM2.5', isTarget: true },
  { time: '12:00', aqi: 174, mainPollutant: 'PM10' },
  { time: '15:00', aqi: 160, mainPollutant: 'PM2.5' },
  { time: '18:00', aqi: 188, mainPollutant: 'PM2.5' },
  { time: '21:00', aqi: 195, mainPollutant: 'PM2.5' },
  { time: '24:00', aqi: 178, mainPollutant: 'PM2.5' },
];

export default function PredictionHourlyChart({
  city = 'Delhi',
  date = '2026-07-10',
  time = '09:00',
  targetAqi = 182,
}) {
  // Construct dynamic data highlighting the target time
  const hourlyData = DEFAULT_HOURLY_DATA.map((d) => {
    const isTarget = d.time === time || (time >= '08:00' && time <= '10:00' && d.time === '09:00');
    return {
      ...d,
      aqi: isTarget && targetAqi ? targetAqi : d.aqi,
      isTarget,
    };
  });

  const defaultActiveIdx = hourlyData.findIndex((d) => d.isTarget) >= 0
    ? hourlyData.findIndex((d) => d.isTarget)
    : 3;

  const [hoveredIdx, setHoveredIdx] = useState(defaultActiveIdx);

  const width = 580;
  const height = 190;
  const padLeft = 42;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 32;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const maxVal = 250;

  const getY = (val) => padTop + chartH - (val / maxVal) * chartH;
  const getX = (idx) => padLeft + (idx / (hourlyData.length - 1)) * chartW;

  const points = hourlyData.map((d, i) => ({
    x: getX(i),
    y: getY(d.aqi),
    ...d,
  }));

  // Cubic spline path
  const pathD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x},${curr.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${padTop + chartH} L ${points[0].x},${padTop + chartH} Z`;

  const yTicks = [0, 50, 100, 150, 200, 250];
  const activePoint = points[hoveredIdx] || points[defaultActiveIdx];
  const activeMeta = getAqiMeta(activePoint.aqi);

  return (
    <div className="chart-card hourly-chart">
      <div className="chart-card__head">
        <div>
          <div className="hourly-chart__title-row">
            <h4 className="chart-card__title">24-Hour Projected AQI Curve</h4>
            <span className="hourly-chart__badge">
              {city} · {date} · {time} IST
            </span>
          </div>
          <p className="chart-card__subtitle">
            XGBoost continuous multi-step forecast with hourly diurnal pattern adjustment
          </p>
        </div>
        <div className="chart-card__tags">
          <span className="chart-card__stat-pill">
            24h Peak: <strong>195</strong> · Avg: <strong>171</strong>
          </span>
          <span className="chart-card__demo-tag">
            <span className="chart-card__demo-dot" /> Demo data
          </span>
        </div>
      </div>

      <div className="chart-card__body">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="chart-card__svg"
          onMouseLeave={() => setHoveredIdx(defaultActiveIdx)}
        >
          <defs>
            <linearGradient id="hourlyAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sky)" stopOpacity="0.32" />
              <stop offset="70%" stopColor="var(--fresh-green)" stopOpacity="0.06" />
              <stop offset="100%" stopColor="var(--fresh-green)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hourlyLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--sky)" />
              <stop offset="60%" stopColor="#57D97A" />
              <stop offset="100%" stopColor="#FFC107" />
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
          <path d={areaD} fill="url(#hourlyAreaGrad)" className="chart-card__area" />

          {/* Main Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#hourlyLineGrad)"
            strokeWidth="2.6"
            strokeLinecap="round"
            className="chart-card__line"
          />

          {/* Hover guideline */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={padTop + chartH}
              className="chart-card__hover-line"
            />
          )}

          {/* Data Points */}
          {points.map((pt, i) => {
            const isActive = i === hoveredIdx;
            const isTarget = pt.isTarget;
            const ptMeta = getAqiMeta(pt.aqi);

            return (
              <g
                key={i}
                className="chart-card__point-group"
                onMouseEnter={() => setHoveredIdx(i)}
                style={{ cursor: 'pointer' }}
              >
                {/* Hitbox */}
                <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                {/* Target Time highlight pin ring */}
                {isTarget && !isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    className="hourly-chart__target-ring"
                  />
                )}

                {/* Active Hover Glow Ring */}
                {isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="9"
                    className="chart-card__point-ring"
                    style={{ stroke: activeMeta.color }}
                  />
                )}

                {/* Main Node Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isTarget || isActive ? "5.5" : "3.5"}
                  className="chart-card__point-dot"
                  style={{
                    fill: isTarget ? '#FFC107' : isActive ? activeMeta.color : 'var(--sky)',
                  }}
                />

                {/* X-axis time labels */}
                <text
                  x={pt.x}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  className={`chart-card__x-label ${isActive ? 'is-active' : ''} ${isTarget ? 'is-target' : ''}`}
                >
                  {pt.time}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {activePoint && (
          <div
            className="chart-card__tooltip"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
            }}
          >
            <div className="chart-card__tooltip-head">
              <strong>{activePoint.time} IST</strong>
              {activePoint.isTarget ? (
                <span className="hourly-tooltip__target-tag">Target Time</span>
              ) : (
                <span className="chart-card__tooltip-badge" style={{ color: activeMeta.color }}>
                  {activeMeta.label}
                </span>
              )}
            </div>
            <div className="chart-card__tooltip-val">
              <span style={{ color: activeMeta.color }}>{activePoint.aqi} AQI</span>
              <span className="chart-card__tooltip-sub">Dominant: {activePoint.mainPollutant}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
