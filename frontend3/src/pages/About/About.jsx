import {
  Wind,
  GraduationCap,
  Cpu,
  Layers,
  Github,
  Code2,
  Database,
  Sparkles,
  User,
  Award,
  Building2,
  GitBranch,
  ShieldCheck,
  Server,
  Activity
} from 'lucide-react';
import Card from '../../components/Card/Card';
import './About.css';

const TECH_STACK = [
  {
    group: 'Frontend',
    icon: Code2,
    badgeClass: 'about__tag--frontend',
    items: ['React 18', 'Vite', 'React Router', 'Framer Motion'],
  },
  {
    group: 'Machine Learning',
    icon: Sparkles,
    badgeClass: 'about__tag--ml',
    items: ['Python', 'XGBoost', 'Pandas', 'Scikit-learn'],
  },
  {
    group: 'Data Sources',
    icon: Database,
    badgeClass: 'about__tag--data',
    items: ['Historical Air Quality Dataset', 'Historical Weather Dataset'],
  },
];

const ML_FEATURES = {
  pollutants: ['PM2.5', 'PM10', 'CO', 'NO₂', 'SO₂', 'Ozone'],
  weather: ['Temperature', 'Humidity', 'Pressure', 'Wind Speed', 'Rainfall', 'Weather Code'],
};

export default function About() {
  return (
    <div className="page-container about-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-header__meta-row">
            <span className="eyebrow">Final Year B.Tech Project</span>
            <span className="about__status-badge">
              <span className="live-dot" /> Production Ready Architecture · v1.0.0
            </span>
          </div>
          <h1 className="page-title">About ClimateGuardian</h1>
          <p className="page-subtitle">
            AI-powered air quality monitoring and carbon footprint analysis, built for India.
          </p>
        </div>
        <div className="about__header-meta">
          <span className="about__header-pill">
            <ShieldCheck size={14} /> Environmental AI Intelligence
          </span>
        </div>
      </div>

      {/* Main ClimateGuardian Hero / Introduction Card */}
      <Card className="about__hero-card" accent="var(--sky)">
        <div className="about__hero-main">
          <div className="about__hero-icon-wrap">
            <span className="about__hero-icon">
              <Wind size={26} />
            </span>
          </div>

          <div className="about__hero-content">
            <div className="about__hero-header-row">
              <div>
                <span className="eyebrow">Platform Overview</span>
                <h2 className="about__hero-title">ClimateGuardian</h2>
              </div>
              <span className="about__hero-tag">
                <Activity size={12} style={{ marginRight: 4 }} />
                Pan-India Telemetry & ML Forecasting
              </span>
            </div>

            <p className="about__hero-desc">
              ClimateGuardian predicts Air Quality Index using a trained XGBoost machine
              learning model, combining historical air quality and weather data across
              Indian cities. The platform gives citizens, researchers and government
              departments a single dashboard for live monitoring, forecasting and
              carbon footprint analysis.
            </p>
          </div>
        </div>

        {/* Hero Specs & Highlights Bar */}
        <div className="about__hero-specs">
          <div className="about__spec-item">
            <span className="about__spec-label">Predictive Engine</span>
            <span className="about__spec-val">XGBoost ML Regressor</span>
          </div>
          <div className="about__spec-divider" />
          <div className="about__spec-item">
            <span className="about__spec-label">Geographic Coverage</span>
            <span className="about__spec-val">Pan-India Metros & Urban Belts</span>
          </div>
          <div className="about__spec-divider" />
          <div className="about__spec-item">
            <span className="about__spec-label">Core Capabilities</span>
            <span className="about__spec-val">Live AQI · Forecasts · Carbon Auditing</span>
          </div>
          <div className="about__spec-divider" />
          <div className="about__spec-item">
            <span className="about__spec-label">Integration Tier</span>
            <span className="about__spec-val">Decoupled REST API Protocol</span>
          </div>
        </div>
      </Card>

      {/* 3 Information Cards Grid */}
      <div className="grid grid-3 about__grid">
        {/* Card 1: Machine Learning */}
        <Card className="about__info-card" accent="var(--sky)">
          <div className="about__card-top">
            <div className="about__card-header">
              <div className="about__card-icon about__card-icon--sky">
                <Cpu size={18} />
              </div>
              <div>
                <span className="eyebrow">Inference Pipeline</span>
                <h3 className="about__card-title">Machine Learning</h3>
              </div>
            </div>

            <p className="about__text">
              The prediction engine is a gradient-boosted XGBoost regressor trained on
              PM2.5, PM10, CO, NO₂, SO₂, Ozone, temperature, humidity, pressure, wind
              speed, rainfall and weather code features.
            </p>

            {/* Structured Feature Breakdown */}
            <div className="about__feature-section">
              <span className="about__subhead">12-Dimension Input Feature Vector</span>

              <div className="about__feature-group">
                <span className="about__feature-group-label">Pollutant Dynamics</span>
                <div className="about__feature-tags">
                  {ML_FEATURES.pollutants.map((feat) => (
                    <span key={feat} className="about__feature-tag about__feature-tag--pollutant">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="about__feature-group">
                <span className="about__feature-group-label">Meteorological Telemetry</span>
                <div className="about__feature-tags">
                  {ML_FEATURES.weather.map((feat) => (
                    <span key={feat} className="about__feature-tag about__feature-tag--weather">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="about__card-footer">
            <span className="about__card-footer-item">
              <strong>Algorithm:</strong> Gradient Boosted Decision Trees (XGBoost)
            </span>
          </div>
        </Card>

        {/* Card 2: Technology Stack */}
        <Card className="about__info-card" accent="var(--fresh-green)">
          <div className="about__card-top">
            <div className="about__card-header">
              <div className="about__card-icon about__card-icon--green">
                <Layers size={18} />
              </div>
              <div>
                <span className="eyebrow">Architecture & Data</span>
                <h3 className="about__card-title">Technology Stack</h3>
              </div>
            </div>

            <div className="about__stack">
              {TECH_STACK.map((group) => {
                const IconComponent = group.icon;
                return (
                  <div key={group.group} className="about__stack-group">
                    <div className="about__stack-label-row">
                      <IconComponent size={12} className="about__stack-icon" />
                      <span className="about__stack-label">{group.group}</span>
                    </div>
                    <div className="about__stack-tags">
                      {group.items.map((item) => (
                        <span key={item} className={`about__tag ${group.badgeClass}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="about__card-footer">
            <span className="about__card-footer-item">
              <strong>Stack Paradigm:</strong> Modular Component Architecture & ML Pipeline
            </span>
          </div>
        </Card>

        {/* Card 3: Academic Details */}
        <Card className="about__info-card" accent="var(--warning)">
          <div className="about__card-top">
            <div className="about__card-header">
              <div className="about__card-icon about__card-icon--amber">
                <GraduationCap size={18} />
              </div>
              <div>
                <span className="eyebrow">Project Identification</span>
                <h3 className="about__card-title">Academic Details</h3>
              </div>
            </div>

            <div className="about__academic-list">
              <div className="about__academic-row">
                <div className="about__academic-label-wrap">
                  <User size={14} className="about__academic-icon" />
                  <span className="about__academic-label">Developer</span>
                </div>
                <div className="about__academic-value-wrap">
                  <span className="about__academic-val about__academic-val--highlight">Ayushmaan</span>
                  <span className="about__val-pill">Lead Author</span>
                </div>
              </div>

              <div className="about__academic-row">
                <div className="about__academic-label-wrap">
                  <Award size={14} className="about__academic-icon" />
                  <span className="about__academic-label">Guide</span>
                </div>
                <div className="about__academic-value-wrap">
                  <span className="about__academic-val">To be added</span>
                  <span className="about__val-pill about__val-pill--muted">Faculty Supervisor</span>
                </div>
              </div>

              <div className="about__academic-row">
                <div className="about__academic-label-wrap">
                  <Building2 size={14} className="about__academic-icon" />
                  <span className="about__academic-label">College</span>
                </div>
                <div className="about__academic-value-wrap">
                  <span className="about__academic-val">To be added</span>
                  <span className="about__val-pill about__val-pill--muted">Department of CSE</span>
                </div>
              </div>

              <div className="about__academic-row">
                <div className="about__academic-label-wrap">
                  <GitBranch size={14} className="about__academic-icon" />
                  <span className="about__academic-label">Version</span>
                </div>
                <div className="about__academic-value-wrap">
                  <span className="about__academic-val about__academic-val--mono">1.0.0</span>
                  <span className="about__val-pill about__val-pill--active">Production v1</span>
                </div>
              </div>
            </div>
          </div>

          <div className="about__card-footer">
            <span className="about__card-footer-item">
              <strong>Capstone:</strong> B.Tech Final Year Engineering Project Demo
            </span>
          </div>
        </Card>
      </div>

      {/* Bottom API Integration Card */}
      <Card className="about__footer-card" accent="var(--sky)">
        <div className="about__footer-left">
          <div className="about__footer-icon-wrap">
            <Github size={20} />
          </div>
          <div className="about__footer-text-group">
            <div className="about__footer-head-row">
              <h4 className="about__footer-title">Backend REST API & Model Integration</h4>
              <span className="about__footer-status-pill">
                <Server size={11} style={{ marginRight: 4 }} />
                Endpoints Configured
              </span>
            </div>
            <p className="about__footer-desc">
              This frontend is designed to integrate with an existing Python + XGBoost backend
              via REST APIs. See inline <code className="about__inline-code">"API INTEGRATION"</code> comments
              throughout the codebase for connection points.
            </p>
          </div>
        </div>

        <div className="about__footer-badges">
          <span className="about__footer-pill">
            <span className="live-dot" /> FastAPI / Flask Compatible
          </span>
          <span className="about__footer-pill">JSON REST Protocol</span>
        </div>
      </Card>
    </div>
  );
}
