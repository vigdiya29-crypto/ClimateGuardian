import { useState, useId } from 'react';
import {
  TreeDeciduous,
  Sprout,
  Leaf,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Card from '../../components/Card/Card';
import './CarbonOffsetVisualizer.css';

// Configurable standard tree absorption rates
export const TREE_TYPES = [
  {
    id: 'mature',
    label: 'Mature Tree',
    absorptionPerYear: 22,
    badge: 'Standard',
    icon: TreeDeciduous,
    desc: 'Dense canopy & root system absorbing ~22 kg CO₂/yr',
  },
  {
    id: 'fast_growing',
    label: 'Fast-Growing Tree',
    absorptionPerYear: 25,
    badge: 'High biomass',
    icon: Leaf,
    desc: 'Bamboo, Poplar, Subabul with fast biomass growth',
  },
  {
    id: 'sapling',
    label: 'Young Sapling',
    absorptionPerYear: 8,
    badge: '1–5 yrs',
    icon: Sprout,
    desc: 'Early growth phase focusing on root formation',
  },
];

export default function CarbonOffsetVisualizer({ monthlyEmission = 179.64 }) {
  const [selectedTypeId, setSelectedTypeId] = useState('mature');
  const [viewMode, setViewMode] = useState('forest'); // 'forest' or 'single'
  const [hoveredYear, setHoveredYear] = useState(5);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const uniqueId = useId().replace(/:/g, '');

  const monthlyKg = Number(monthlyEmission) || 0;
  const annualKg = Math.round(monthlyKg * 12 * 100) / 100;
  const annualTonnes = (annualKg / 1000).toFixed(2);

  const activeType =
    TREE_TYPES.find((t) => t.id === selectedTypeId) || TREE_TYPES[0];

  // Number of trees required to offset annual emissions
  const treesRequired = Math.max(
    1,
    Math.ceil(annualKg / activeType.absorptionPerYear)
  );

  // Single tree equivalent years to offset the full annual footprint
  const singleTreeYears =
    annualKg > 0
      ? Math.ceil(annualKg / activeType.absorptionPerYear)
      : 1;

  // -------------------------------------------------------------------------
  // Graph Projection Data (Years 1 to 15)
  // -------------------------------------------------------------------------
  const totalYears = 15;
  const years = Array.from({ length: totalYears }, (_, i) => i + 1);

  let runningForestCumulative = 0;
  let runningSingleCumulative = 0;

  const chartData = years.map((year) => {
    // Dynamic absorption rate based on growth stage
    let baseRate = 6; // Young sapling
    let stage = 'Sapling (Years 1–3)';

    if (year > 8) {
      baseRate = 22; // Mature canopy
      stage = 'Mature Canopy (Years 9+)';
    } else if (year > 3) {
      baseRate = 14; // Growing tree
      stage = 'Growing (Years 4–8)';
    }

    // Scale by selected tree type
    const scaledRate = (baseRate / 22) * activeType.absorptionPerYear;

    const singleAnnual = scaledRate;
    const forestAnnual = treesRequired * scaledRate;

    runningSingleCumulative += singleAnnual;
    runningForestCumulative += forestAnnual;

    return {
      year,
      stage,
      singleAnnual: Math.round(singleAnnual * 10) / 10,
      forestAnnual: Math.round(forestAnnual),
      singleCumulative: Math.round(runningSingleCumulative),
      forestCumulative: Math.round(runningForestCumulative),
      activeCumulative:
        viewMode === 'forest'
          ? Math.round(runningForestCumulative)
          : Math.round(runningSingleCumulative),
    };
  });

  // Break-even milestone point
  const breakEvenPoint =
    chartData.find((d) => d.activeCumulative >= annualKg) ||
    (viewMode === 'forest' ? chartData[0] : null);

  const activePoint =
    chartData.find((d) => d.year === hoveredYear) ||
    chartData[Math.min(4, chartData.length - 1)];

  // SVG Chart Geometry
  const width = 560;
  const height = 230;
  const padLeft = 54;
  const padRight = 20;
  const padTop = 26;
  const padBottom = 34;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(
    annualKg * 1.25,
    chartData[chartData.length - 1].activeCumulative * 1.05,
    100
  );

  const getX = (year) => padLeft + ((year - 1) / (totalYears - 1)) * chartW;
  const getY = (val) => padTop + chartH - (val / maxVal) * chartH;

  const points = chartData.map((d) => ({
    x: getX(d.year),
    y: getY(d.activeCumulative),
    ...d,
  }));

  const curveD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x},${curr.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }, '');

  const areaD = `${curveD} L ${points[points.length - 1].x},${
    padTop + chartH
  } L ${points[0].x},${padTop + chartH} Z`;

  const targetLineY = getY(annualKg);

  return (
    <Card className="offset-card">
      {/* Section Header */}
      <div className="offset-card__head">
        <div className="offset-card__title-group">
          <div className="offset-card__eyebrow-row">
            <span className="eyebrow">Carbon Sequestration Impact</span>
            <span className="offset-card__tag">
              <span className="live-dot" />
              Tree Planting Offset Model
            </span>
          </div>
          <h3 className="offset-card__title">
            🌱 Carbon Offset &amp; Tree Impact
          </h3>
          <p className="offset-card__subtitle">
            How your calculated emissions translate into nature-based biological carbon sequestration.
          </p>
        </div>

        {/* Tree Type Selector Pills */}
        <div className="offset-card__type-pills">
          {TREE_TYPES.map((type) => {
            const isSelected = type.id === selectedTypeId;
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                className={`offset-card__type-btn ${
                  isSelected ? 'is-active' : ''
                }`}
                onClick={() => setSelectedTypeId(type.id)}
              >
                <Icon size={13} />
                <span>{type.label}</span>
                <span className="offset-card__type-rate">
                  ~{type.absorptionPerYear} kg/yr
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MAIN RESULT HERO CARD */}
      {/* ========================================================================= */}
      <div className="offset-hero">
        <div className="offset-hero__block">
          <span className="offset-hero__label">Your Annual Carbon Footprint</span>
          <div className="offset-hero__val-row">
            <span className="offset-hero__number">
              {annualKg.toLocaleString()}
            </span>
            <span className="offset-hero__unit">kg CO₂ / year</span>
          </div>
          <p className="offset-hero__hint">
            ≈ {annualTonnes} tonnes/year (calculated from your {monthlyKg} kg/month footprint)
          </p>
        </div>

        <div className="offset-hero__divider" />

        <div className="offset-hero__block offset-hero__block--accent">
          <span className="offset-hero__label">Trees Required to Offset It</span>
          <div className="offset-hero__val-row">
            <span className="offset-hero__number offset-hero__number--green">
              {treesRequired.toLocaleString()}
            </span>
            <span className="offset-hero__unit">
              {activeType.label.toLowerCase()}s
            </span>
          </div>
          <p className="offset-hero__hint">
            Based on ~{activeType.absorptionPerYear} kg CO₂ estimated annual absorption per {activeType.label.toLowerCase()}.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE VISUALIZATION GRAPH */}
      {/* ========================================================================= */}
      <div className="offset-chart-section">
        <div className="offset-chart-head">
          <div>
            <h4 className="offset-chart-title">
              How Trees Offset Your Carbon Footprint Over Time
            </h4>
            <p className="offset-chart-subtitle">
              Cumulative CO₂ absorption as trees grow from saplings into expansive leaf canopies.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="offset-view-toggle">
            <button
              type="button"
              className={`offset-view-btn ${
                viewMode === 'forest' ? 'is-active' : ''
              }`}
              onClick={() => setViewMode('forest')}
            >
              Planted Trees ({treesRequired})
            </button>
            <button
              type="button"
              className={`offset-view-btn ${
                viewMode === 'single' ? 'is-active' : ''
              }`}
              onClick={() => setViewMode('single')}
            >
              1 Single Tree
            </button>
          </div>
        </div>

        {/* Readout Status Bar */}
        <div className="offset-readout-bar">
          <div className="offset-readout-left">
            <Clock size={13} className="text-green" />
            <span>
              Year {activePoint.year}:{' '}
              <strong>{activePoint.activeCumulative.toLocaleString()} kg CO₂</strong>{' '}
              cumulative absorption ({activePoint.stage})
            </span>
          </div>
          <span className="offset-readout-badge">
            {annualKg > 0
              ? `${Math.round(
                  (activePoint.activeCumulative / annualKg) * 100
                )}% of 1-yr footprint`
              : '100%'}
          </span>
        </div>

        {/* SVG Curve Chart */}
        <div className="offset-svg-container">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="offset-svg"
            onMouseLeave={() => setHoveredYear(5)}
          >
            <defs>
              <linearGradient
                id={`offsetGrad-${uniqueId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--fresh-green)"
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor="var(--fresh-green)"
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>

            {/* Grid Y Lines */}
            {[0, 0.33, 0.66, 1].map((pct) => {
              const val = Math.round(maxVal * pct);
              const y = getY(val);
              return (
                <g key={pct} className="offset-grid-row">
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="var(--border)"
                    strokeDasharray="2 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="offset-axis-label"
                  >
                    {val >= 1000
                      ? `${(val / 1000).toFixed(1)}t`
                      : `${val}kg`}
                  </text>
                </g>
              );
            })}

            {/* Target Line: Annual Carbon Footprint */}
            {annualKg > 0 && targetLineY >= padTop && targetLineY <= padTop + chartH && (
              <g className="offset-target-group">
                <line
                  x1={padLeft}
                  y1={targetLineY}
                  x2={width - padRight}
                  y2={targetLineY}
                  stroke="#FFC107"
                  strokeDasharray="4 3"
                  strokeWidth="1.5"
                />
                <text
                  x={width - padRight}
                  y={targetLineY - 6}
                  textAnchor="end"
                  fill="#FFC107"
                  fontSize="10.5"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  Your Annual Footprint: {annualKg.toLocaleString()} kg CO₂
                </text>
              </g>
            )}

            {/* Shaded Area */}
            <path
              d={areaD}
              fill={`url(#offsetGrad-${uniqueId})`}
              className="offset-area-fill"
            />

            {/* Main Sequestration Curve */}
            <path
              d={curveD}
              fill="none"
              stroke="var(--fresh-green)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Break-even Marker */}
            {breakEvenPoint && (
              <g
                transform={`translate(${getX(breakEvenPoint.year)}, ${getY(
                  breakEvenPoint.activeCumulative
                )})`}
                className="offset-breakeven-point"
              >
                <circle r="6" fill="#57D97A" />
                <circle r="10" fill="#57D97A" opacity="0.3" />
              </g>
            )}

            {/* Interactive Data Points */}
            {points.map((pt) => {
              const isHovered = pt.year === hoveredYear;
              return (
                <g key={pt.year}>
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padTop + chartH}
                    stroke={isHovered ? 'rgba(87, 217, 122, 0.4)' : 'transparent'}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 3}
                    fill={isHovered ? '#FFFFFF' : 'var(--fresh-green)'}
                    stroke="var(--surface)"
                    strokeWidth="2"
                    className="offset-data-dot"
                  />
                  {/* Mouse Touch Hitbox */}
                  <rect
                    x={pt.x - chartW / totalYears / 2}
                    y={padTop}
                    width={chartW / totalYears}
                    height={chartH + padBottom}
                    fill="transparent"
                    onMouseEnter={() => setHoveredYear(pt.year)}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              );
            })}

            {/* X-Axis Labels */}
            {points.map((pt) => {
              if (pt.year === 1 || pt.year % 2 === 1 || pt.year === totalYears) {
                return (
                  <text
                    key={pt.year}
                    x={pt.x}
                    y={padTop + chartH + 18}
                    textAnchor="middle"
                    className={`offset-x-label ${
                      pt.year === hoveredYear ? 'is-active' : ''
                    }`}
                  >
                    Yr {pt.year}
                  </text>
                );
              }
              return null;
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="offset-chart-legend">
          <div className="offset-legend-item">
            <span className="offset-legend-line offset-legend-line--green" />
            <span>
              Cumulative Carbon Absorption (
              {viewMode === 'forest'
                ? `${treesRequired} trees`
                : '1 single tree'}
              )
            </span>
          </div>
          <div className="offset-legend-item">
            <span className="offset-legend-line offset-legend-line--yellow" />
            <span>Your Annual Footprint Baseline ({annualKg.toLocaleString()} kg)</span>
          </div>
        </div>

        {/* 2 Clear Core Takeaways */}
        <div className="offset-takeaways-grid">
          <div className="offset-takeaway-card offset-takeaway-card--primary">
            <CheckCircle2 size={16} className="text-green offset-takeaway-icon" />
            <div>
              <strong className="offset-takeaway-title">
                Planting {treesRequired} {activeType.label.toLowerCase()}s can offset approximately 1 year of emissions.
              </strong>
              <p className="offset-takeaway-desc">
                Together, this cluster provides ~{Math.round(treesRequired * activeType.absorptionPerYear).toLocaleString()} kg CO₂ of annual photosynthetic sequestration capacity.
              </p>
            </div>
          </div>

          <div className="offset-takeaway-card">
            <Clock size={16} className="offset-takeaway-icon text-muted" />
            <div>
              <strong className="offset-takeaway-title">
                1 single tree alone would take approximately {singleTreeYears} years.
              </strong>
              <p className="offset-takeaway-desc">
                To sequester this entire {annualKg.toLocaleString()} kg footprint through individual growth over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SCIENTIFIC ASSUMPTIONS (COLLAPSIBLE FOOTNOTE) */}
      {/* ========================================================================= */}
      <div className="offset-assumptions">
        <button
          type="button"
          className="offset-assumptions__toggle"
          onClick={() => setShowAssumptions((prev) => !prev)}
          aria-expanded={showAssumptions}
        >
          <div className="offset-assumptions__toggle-left">
            <HelpCircle size={14} className="text-green" />
            <span>How is this estimated? (Methodology &amp; Scientific Notes)</span>
          </div>
          {showAssumptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAssumptions && (
          <div className="offset-assumptions__content">
            <ul className="offset-assumptions__list">
              <li>
                <strong>Annual Emissions vs. Sequestration:</strong> Your annual footprint ({annualKg.toLocaleString()} kg) represents fossil fuel emissions produced over 12 months. Biological sequestration occurs gradually as planted trees grow over decades.
              </li>
              <li>
                <strong>Standard Benchmark (~22 kg/tree/yr):</strong> Based on EPA and European Environment Agency forestry models for mature broadleaf trees (15–30 years of age).
              </li>
              <li>
                <strong>Growth Stages:</strong> Young saplings absorb ~6–8 kg/yr, developing trees absorb ~14–18 kg/yr, and mature canopies achieve full ~22–25 kg/yr sequestration.
              </li>
              <li>
                <strong>Source Reduction Priority:</strong> Tree planting acts as an essential long-term carbon sink, but reducing emissions directly at source (solar, transit, clean energy) remains the immediate climate priority.
              </li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
