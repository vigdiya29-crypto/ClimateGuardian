import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Zap,
  Flame,
  Utensils,
  Recycle,
  Sun,
  Building2,
  Leaf,
  TrendingUp,
  AlertTriangle,
  Award,
  TreeDeciduous,
  FileText,
  Sparkles,
} from 'lucide-react';

import Card from '../../components/Card/Card';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import { Spinner } from '../../components/Loader/Loader';
import CarbonOffsetVisualizer from './CarbonOffsetVisualizer';
import { calculateCarbonFootprint as calculateCarbonApi } from '../../services/api';
import './Carbon.css';

export const CARBON_STORAGE_KEY = 'climateguardian_carbon_result';

// --- Form Options ---
export const VEHICLE_OPTIONS = [
  { value: 'car', label: 'Car (Petrol/Diesel)' },
  { value: 'bus', label: 'Public Bus' },
  { value: 'bike', label: 'Motorbike / Scooter' },
  { value: 'electric', label: 'Electric Vehicle (EV)' },
];

export const RENEWABLE_OPTIONS = [
  { value: 1, label: 'None' },
  { value: 2, label: 'Solar Panels' },
  { value: 3, label: 'Solar Water Heater' },
  { value: 4, label: 'Both (Solar Panels + Water Heater)' },
];

export const BUILDING_OPTIONS = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
];

export const FOOD_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian' },
];

// --- Initial Form State ---
export const initialForm = {
  choice: 1, // 1: Bill (₹), 2: Units (kWh)
  bill: 1200,
  electricity: 160,
  vehicle: 'car',
  distance: 350,
  cylinder: 1,
  renewable: 1,
  building: 'residential',
  food: 'vegetarian',
  members: 3,
  recycle: 'yes',
};

// --- Emission Model Logic ---
export function calculateCarbonFootprint(form) {
  // 1. Electricity Calculation
  const electricityUnits =
    Number(form.choice) === 1
      ? (Number(form.bill) || 0) / 8
      : Number(form.electricity) || 0;
  let electricityEmission = electricityUnits * 0.82;

  // Renewable energy reduction factor
  const renewableVal = Number(form.renewable);
  if (renewableVal === 2) {
    electricityEmission *= 0.85;
  } else if (renewableVal === 3) {
    electricityEmission *= 0.92;
  } else if (renewableVal === 4) {
    electricityEmission *= 0.7;
  }

  // Building factor
  if (form.building === 'commercial') {
    electricityEmission *= 1.15;
  } else if (form.building === 'industrial') {
    electricityEmission *= 1.35;
  }

  // 2. Transportation Calculation
  const distance = Math.max(0, Number(form.distance) || 0);
  let vehicleFactor = 0.19; // car default
  if (form.vehicle === 'bus') vehicleFactor = 0.08;
  else if (form.vehicle === 'bike') vehicleFactor = 0.1;
  else if (form.vehicle === 'electric') vehicleFactor = 0.04;

  const vehicleEmission = distance * vehicleFactor;

  // 3. Cooking Fuel Calculation (LPG)
  const cylinder = Math.max(0, Number(form.cylinder) || 0);
  const gasEmission = cylinder * 42;

  // 4. Food Habit Calculation (Not multiplied by members)
  let foodEmission = 40; // vegetarian default
  if (form.food === 'eggetarian') foodEmission = 55;
  else if (form.food === 'non-vegetarian') foodEmission = 80;

  // Total before recycling
  const subtotal =
    electricityEmission + vehicleEmission + gasEmission + foodEmission;

  // 5. Waste Recycling Reduction (3% if yes)
  let totalEmission = form.recycle === 'yes' ? subtotal * 0.97 : subtotal;

  // Category & Badge & Score
  let category = 'Low';
  let badgeClass = 'badge-good';
  let score = 95;

  if (totalEmission <= 100) {
    category = 'Low';
    badgeClass = 'badge-good';
    score = 95;
  } else if (totalEmission <= 300) {
    category = 'Moderate';
    badgeClass = 'badge-moderate';
    score = 85;
  } else if (totalEmission <= 600) {
    category = 'High';
    badgeClass = 'badge-poor';
    score = 65;
  } else {
    category = 'Critical';
    badgeClass = 'badge-poor';
    score = 40;
  }

  // Tree Offset & Per Person
  const treesRequired = Math.round(totalEmission / 21);
  const members = Math.max(1, Number(form.members) || 1);
  const perPerson = totalEmission / members;

  // Precision formatted numerical values
  const formattedTotal = Number(totalEmission.toFixed(2));
  const formattedPerPerson = Number(perPerson.toFixed(2));
  const formattedElectricity = Number(electricityEmission.toFixed(2));
  const formattedVehicle = Number(vehicleEmission.toFixed(2));
  const formattedGas = Number(gasEmission.toFixed(2));
  const formattedFood = Number(foodEmission.toFixed(2));

  // Breakdown items
  const breakdown = [
    {
      key: 'electricity',
      label: 'Electricity',
      value: formattedElectricity,
      percentage:
        formattedTotal > 0
          ? Math.round((formattedElectricity / formattedTotal) * 100)
          : 0,
      pct:
        formattedTotal > 0
          ? Math.round((formattedElectricity / formattedTotal) * 100)
          : 0,
      color: '#3B82F6',
      icon: Zap,
    },
    {
      key: 'vehicle',
      label: 'Transportation',
      value: formattedVehicle,
      percentage:
        formattedTotal > 0
          ? Math.round((formattedVehicle / formattedTotal) * 100)
          : 0,
      pct:
        formattedTotal > 0
          ? Math.round((formattedVehicle / formattedTotal) * 100)
          : 0,
      color: '#10B981',
      icon: Car,
    },
    {
      key: 'gas',
      label: 'Cooking Fuel',
      value: formattedGas,
      percentage:
        formattedTotal > 0
          ? Math.round((formattedGas / formattedTotal) * 100)
          : 0,
      pct:
        formattedTotal > 0
          ? Math.round((formattedGas / formattedTotal) * 100)
          : 0,
      color: '#F59E0B',
      icon: Flame,
    },
    {
      key: 'food',
      label: 'Food',
      value: formattedFood,
      percentage:
        formattedTotal > 0
          ? Math.round((formattedFood / formattedTotal) * 100)
          : 0,
      pct:
        formattedTotal > 0
          ? Math.round((formattedFood / formattedTotal) * 100)
          : 0,
      color: '#EC4899',
      icon: Utensils,
    },
  ];

  // Largest Contributor
  const largestContributor = breakdown.reduce(
    (max, item) => (item.value > max.value ? item : max),
    breakdown[0]
  );

  // Dynamic Recommendations
  const recommendations = [];

  if (formattedElectricity > 80 && Number(form.renewable) === 1) {
    recommendations.push({
      title: 'Switch to Solar Energy',
      desc: 'Installing rooftop solar panels or a solar water heater can reduce your electricity emissions by up to 30%.',
      saving: '~30% Electricity CO₂',
    });
  }

  if (formattedVehicle > 40 && form.vehicle === 'car') {
    recommendations.push({
      title: 'Consider EV or Public Transit',
      desc: 'Switching to an EV, carpooling, or public buses significantly drops transportation emissions.',
      saving: 'Up to 0.15 kg/km',
    });
  }

  if (form.food === 'non-vegetarian') {
    recommendations.push({
      title: 'Shift Toward Plant-Based Meals',
      desc: 'Reducing meat consumption lowers your food carbon footprint by up to 50%.',
      saving: '-40 kg CO₂/mo',
    });
  }

  if (form.recycle === 'no') {
    recommendations.push({
      title: 'Enable Household Recycling',
      desc: 'Sorting paper, plastics, and metals grants an immediate 3% model reduction.',
      saving: '-3% Total CO₂',
    });
  }

  if (formattedGas > 40) {
    recommendations.push({
      title: 'Optimize Cooking Efficiency',
      desc: 'Using induction cooktops or pressure cookers helps reduce monthly LPG cylinder consumption.',
      saving: '-20 kg CO₂/mo',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Maintain Eco-Friendly Habits',
      desc: 'Your current choices keep emissions low. Continue tracking monthly to sustain high efficiency.',
      saving: 'Optimal Impact',
    });
  }

  return {
    total_emission: formattedTotal,
    totalKg: formattedTotal,
    category,
    badgeClass,
    trees_required: treesRequired,
    treesRequired,
    score,
    sustainabilityScore: score,
    per_person: formattedPerPerson,
    perPersonKg: formattedPerPerson,
    electricity_emission: formattedElectricity,
    vehicle_emission: formattedVehicle,
    gas_emission: formattedGas,
    food_emission: formattedFood,
    breakdown,
    largestContributor,
    recommendations,
  };
}

export default function Carbon() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Restore saved calculation from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CARBON_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.total_emission !== 'undefined') {
          setResult(parsed);
          if (parsed.form) {
            setForm((prev) => ({ ...prev, ...parsed.form }));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load saved carbon calculation', err);
    }
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCalculate(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const calculated = await calculateCarbonApi(form);
      setResult(calculated);
      try {
        localStorage.setItem(
          CARBON_STORAGE_KEY,
          JSON.stringify({
            ...calculated,
            form,
            calculatedAt: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.warn('Failed to persist carbon result', err);
      }
    } catch {
      const calculated = calculateCarbonFootprint(form);
      setResult(calculated);
      try {
        localStorage.setItem(
          CARBON_STORAGE_KEY,
          JSON.stringify({
            ...calculated,
            form,
            calculatedAt: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.warn('Failed to persist carbon result', err);
      }
    } finally {
      setLoading(false);
    }
  }

  const breakdownData = result?.breakdown || [];
  const largestContributor = result?.largestContributor || null;
  const recommendations = result?.recommendations || [];

  return (
    <div className="page-container carbon-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-header__meta-row">
            <span className="eyebrow">GHG Protocol Emission Model</span>

            <span className="carbon__header-tag">
              <span className="live-dot" />
              Verified Standards · 0.82 kg/kWh · 42 kg/LPG
            </span>
          </div>

          <h1 className="page-title">Carbon Footprint Calculator</h1>

          <p className="page-subtitle">
            Calculate estimated monthly CO₂ emissions from electricity,
            transportation, cooking fuel, food habits, and household waste.
          </p>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="carbon__grid-layout">
        {/* ================= INPUT COLUMN ================= */}
        <div className="carbon__inputs-column">
          <Card className="carbon__form-card">
            <div className="carbon__form-header">
              <span className="eyebrow">Input Parameters</span>
              <h3 className="carbon__form-title">Your Monthly Habits</h3>
            </div>

            <form onSubmit={handleCalculate} className="carbon__form">
              {/* Electricity */}
              <div className="carbon__section-box">
                <div className="carbon__section-head">
                  <Zap size={15} className="carbon__section-icon" />
                  <span>Electricity Consumption</span>
                </div>

                <div className="carbon__fields-grid">
                  <div className="carbon__field carbon__field--full">
                    <div className="carbon__field-label-row">
                      <label>Input Method</label>

                      <div className="carbon__mode-toggle">
                        <button
                          type="button"
                          className={`carbon__mode-btn ${
                            form.choice === 1 ? 'is-active' : ''
                          }`}
                          onClick={() => update('choice', 1)}
                        >
                          Bill (₹)
                        </button>

                        <button
                          type="button"
                          className={`carbon__mode-btn ${
                            form.choice === 2 ? 'is-active' : ''
                          }`}
                          onClick={() => update('choice', 2)}
                        >
                          Units (kWh)
                        </button>
                      </div>
                    </div>

                    {form.choice === 1 ? (
                      <div className="carbon__input-with-icon">
                        <input
                          type="number"
                          min="0"
                          max="50000"
                          value={form.bill}
                          onChange={(e) =>
                            update('bill', e.target.value === '' ? '' : Math.max(0, +e.target.value))
                          }
                          placeholder="e.g. 1200"
                          required
                        />
                        <span className="carbon__input-unit">₹ / month</span>
                      </div>
                    ) : (
                      <div className="carbon__input-with-icon">
                        <input
                          type="number"
                          min="0"
                          max="5000"
                          value={form.electricity}
                          onChange={(e) =>
                            update('electricity', e.target.value === '' ? '' : Math.max(0, +e.target.value))
                          }
                          placeholder="e.g. 160"
                          required
                        />
                        <span className="carbon__input-unit">kWh / month</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transportation */}
              <div className="carbon__section-box">
                <div className="carbon__section-head">
                  <Car size={15} className="carbon__section-icon" />
                  <span>Transportation</span>
                </div>

                <div className="carbon__fields-grid">
                  <div className="carbon__field">
                    <label>Vehicle Type</label>
                    <CustomSelect
                      value={form.vehicle}
                      onChange={(val) => update('vehicle', val)}
                      options={VEHICLE_OPTIONS}
                      icon={Car}
                    />
                  </div>

                  <div className="carbon__field">
                    <div className="carbon__field-label-row">
                      <label>Distance Travelled</label>
                      <span className="carbon__field-unit">km</span>
                    </div>

                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={form.distance}
                      onChange={(e) =>
                        update('distance', e.target.value === '' ? '' : Math.max(0, +e.target.value))
                      }
                      placeholder="e.g. 350"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Cooking Fuel */}
              <div className="carbon__section-box">
                <div className="carbon__section-head">
                  <Flame size={15} className="carbon__section-icon" />
                  <span>Cooking Fuel</span>
                </div>

                <div className="carbon__fields-grid">
                  <div className="carbon__field carbon__field--full">
                    <div className="carbon__field-label-row">
                      <label>LPG Cylinders Used</label>
                      <span className="carbon__field-unit">cylinders / month</span>
                    </div>

                    <input
                      type="number"
                      min="0"
                      max="15"
                      step="0.5"
                      value={form.cylinder}
                      onChange={(e) =>
                        update('cylinder', e.target.value === '' ? '' : Math.max(0, +e.target.value))
                      }
                      placeholder="e.g. 1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Renewable + Building */}
              <div className="carbon__section-box">
                <div className="carbon__section-head">
                  <Sun size={15} className="carbon__section-icon" />
                  <span>Renewable Energy &amp; Building</span>
                </div>

                <div className="carbon__fields-grid">
                  <div className="carbon__field">
                    <label>Renewable Energy Source</label>
                    <CustomSelect
                      value={form.renewable}
                      onChange={(val) => update('renewable', Number(val))}
                      options={RENEWABLE_OPTIONS}
                      icon={Sun}
                    />
                  </div>

                  <div className="carbon__field">
                    <label>Building Type</label>
                    <CustomSelect
                      value={form.building}
                      onChange={(val) => update('building', val)}
                      options={BUILDING_OPTIONS}
                      icon={Building2}
                    />
                  </div>
                </div>
              </div>

              {/* Food + Household */}
              <div className="carbon__section-box">
                <div className="carbon__section-head">
                  <Utensils size={15} className="carbon__section-icon" />
                  <span>Food &amp; Household</span>
                </div>

                <div className="carbon__fields-grid">
                  <div className="carbon__field">
                    <label>Food Habit</label>
                    <CustomSelect
                      value={form.food}
                      onChange={(val) => update('food', val)}
                      options={FOOD_OPTIONS}
                      icon={Utensils}
                    />
                  </div>

                  <div className="carbon__field">
                    <div className="carbon__field-label-row">
                      <label>Family Members</label>
                      <span className="carbon__field-unit">people</span>
                    </div>

                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={form.members}
                      onChange={(e) =>
                        update('members', e.target.value === '' ? '' : Math.max(1, Math.min(30, +e.target.value)))
                      }
                      required
                    />
                  </div>

                  <div className="carbon__field carbon__field--full">
                    <div className="carbon__field-label-row">
                      <label>Waste Recycling</label>
                      <span className="carbon__field-unit">3% reduction if yes</span>
                    </div>

                    <div className="carbon__toggle-pills">
                      <button
                        type="button"
                        className={`carbon__pill-btn ${
                          form.recycle === 'yes' ? 'is-active' : ''
                        }`}
                        onClick={() => update('recycle', 'yes')}
                      >
                        <Recycle size={13} />
                        Yes
                      </button>

                      <button
                        type="button"
                        className={`carbon__pill-btn ${
                          form.recycle === 'no' ? 'is-active' : ''
                        }`}
                        onClick={() => update('recycle', 'no')}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <button
                type="submit"
                className="btn btn-primary carbon__submit-action"
                disabled={loading}
              >
                {loading ? <Spinner size={16} /> : <Leaf size={16} />}
                <span>
                  {loading
                    ? 'Calculating Footprint…'
                    : 'Calculate Carbon Footprint'}
                </span>
              </button>
            </form>
          </Card>
        </div>

        {/* ================= RESULTS COLUMN ================= */}
        <div className="carbon__results-column">
          {result ? (
            <>
              {/* Primary KPI Hero Card */}
              <Card className="carbon__kpi-hero">
                <div className="carbon__kpi-hero-layout">
                  <div className="carbon__kpi-hero-left">
                    <span className="eyebrow">Monthly CO₂ Footprint</span>
                    <div className="carbon__kpi-hero-val-wrap">
                      <span className="carbon__kpi-hero-number">
                        {result.total_emission}
                      </span>
                      <div className="carbon__kpi-hero-units">
                        <span className="carbon__kpi-hero-unit-main">
                          kg CO₂ / month
                        </span>
                        <span className="carbon__kpi-hero-annual">
                          ≈{' '}
                          {((result.total_emission * 12) / 1000).toFixed(2)}{' '}
                          tonnes/yr
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="carbon__kpi-hero-right">
                    <span className={`badge ${result.badgeClass}`}>
                      {result.category} Impact
                    </span>
                    <div className="carbon__kpi-meta-list">
                      <div className="carbon__kpi-meta-item">
                        <span>Per Person:</span>
                        <strong>{result.per_person} kg/mo</strong>
                      </div>
                      <div className="carbon__kpi-meta-item">
                        <span>Trees Needed:</span>
                        <strong>{result.trees_required} trees/yr</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Compact Insights Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                <Card className="carbon__card-compact">
                  <div className="carbon__card-compact-head">
                    <span className="eyebrow">Sustainability</span>
                    <Award size={16} className="carbon__accent-icon" />
                  </div>
                  <h4 className="carbon__card-compact-title">
                    Score: {result.score} / 100
                  </h4>
                  <p className="carbon__card-compact-desc">
                    Based on standard benchmark thresholds for personal carbon efficiency.
                  </p>
                </Card>

                <Card className="carbon__card-compact">
                  <div className="carbon__card-compact-head">
                    <span className="eyebrow">Top Source</span>
                    <AlertTriangle size={16} className="carbon__accent-icon" />
                  </div>
                  <h4 className="carbon__card-compact-title">
                    {largestContributor?.label} ({largestContributor?.percentage || largestContributor?.pct}%)
                  </h4>
                  <p className="carbon__card-compact-desc">
                    Generates <strong>{largestContributor?.value} kg CO₂</strong> per month.
                  </p>
                </Card>
              </div>

              {/* Emission Breakdown Card */}
              <Card className="carbon__breakdown-card">
                <div className="carbon__breakdown-head">
                  <div>
                    <span className="eyebrow">Distribution</span>
                    <h3 className="carbon__breakdown-title">
                      Emission Breakdown
                    </h3>
                  </div>
                  <span className="carbon__breakdown-tag">4 Key Sources</span>
                </div>

                {/* Visual Bar */}
                <div className="carbon__breakdown-bar">
                  {breakdownData.map((item, idx) => (
                    <div
                      key={item.key || idx}
                      className="carbon__breakdown-segment"
                      style={{
                        width: `${item.percentage || item.pct}%`,
                        backgroundColor: item.color,
                      }}
                      title={`${item.label}: ${item.value} kg (${item.percentage || item.pct}%)`}
                    />
                  ))}
                </div>

                {/* Items Grid */}
                <div className="carbon__breakdown-grid">
                  {breakdownData.map((item, idx) => (
                    <div key={item.key || idx} className="carbon__breakdown-item">
                      <span
                        className="carbon__breakdown-dot"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="carbon__breakdown-text">
                        <span className="carbon__breakdown-name">
                          {item.label}
                        </span>
                        <strong className="carbon__breakdown-amount">
                          {item.value} kg ({item.percentage || item.pct}%)
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recommendations Card */}
              <Card className="carbon__recommendations-card">
                <div className="carbon__recommendations-head">
                  <span className="eyebrow">Action Plan</span>
                  <h3 className="carbon__recommendations-title">
                    Tailored Recommendations
                  </h3>
                </div>

                <div className="carbon__recommendations-list">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="carbon__rec-row">
                      <div className="carbon__rec-left">
                        <TrendingUp size={16} className="carbon__rec-bullet" />
                        <div>
                          <span className="carbon__rec-title">
                            {rec.title}
                          </span>
                          <p className="carbon__rec-desc">{rec.desc}</p>
                        </div>
                      </div>
                      <span className="carbon__rec-saving">{rec.saving}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Carbon Offset & Tree Planting Dynamic Visualization */}
              <CarbonOffsetVisualizer monthlyEmission={result.total_emission} />

              {/* Link to Full Reports */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  to="/reports"
                  className="btn btn-ghost"
                  style={{ gap: '8px', fontSize: '13px' }}
                >
                  <FileText size={15} />
                  <span>View Detailed Environmental Report &rarr;</span>
                </Link>
              </div>
            </>
          ) : (
            <Card className="carbon__empty-card">
              <Leaf size={32} />
              <h4>Ready to Assess Your Carbon Footprint</h4>
              <p>
                Adjust your transportation, energy, and household parameters on
                the left to compute your detailed emissions breakdown.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}