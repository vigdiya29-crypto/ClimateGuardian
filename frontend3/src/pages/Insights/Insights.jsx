import { ShieldCheck, BookOpen, Wind, Activity, CheckCircle2 } from 'lucide-react';
import Card from '../../components/Card/Card';
import { aqiCategories, pollutantInfo } from '../../data/placeholderData';
import './Insights.css';

export default function Insights() {
  return (
    <div className="page-container insights-page">
      {/* 1. Environmental Insights Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow">Knowledge &amp; Guidelines</span>
          <h1 className="page-title">Environmental Insights</h1>
          <p className="page-subtitle">
            Essential reference on air quality index standards, pollutant health impacts, and preventive action guidelines.
          </p>
        </div>
      </div>

      {/* 2. AQI Categories Table / List */}
      <Card className="insights__card">
        <div className="insights__card-header">
          <div className="insights__card-title-group">
            <div className="insights__badge-row">
              <span className="eyebrow">National Standards</span>
              <span className="insights__tag">
                <Activity size={12} /> CPCB NAQI Index
              </span>
            </div>
            <h3 className="insights__card-title">Air Quality Index (AQI) Categories</h3>
          </div>
          <p className="insights__card-desc">
            Standard health severity classification based on 24-hour ambient air monitoring.
          </p>
        </div>

        <div className="insights__table-wrapper">
          <div className="insights__table-head">
            <span className="insights__th insights__th--range">AQI Range</span>
            <span className="insights__th insights__th--category">Category</span>
            <span className="insights__th insights__th--effect">Health Effect &amp; Advisory</span>
          </div>

          <div className="insights__table-body">
            {aqiCategories.map((c) => (
              <div key={c.label} className="insights__table-row">
                <div className="insights__col-range">
                  <span className="insights__range-badge">{c.range}</span>
                </div>
                <div className="insights__col-category">
                  <span
                    className="insights__category-dot"
                    style={{ backgroundColor: c.color }}
                  />
                  <strong className="insights__category-name" style={{ color: c.color }}>
                    {c.label}
                  </strong>
                </div>
                <div className="insights__col-effect">
                  <p className="insights__effect-text">{c.effect}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 3. Major Pollutants Grid */}
      <div className="insights__section">
        <div className="insights__section-head">
          <div>
            <span className="eyebrow">Atmospheric Chemistry</span>
            <h3 className="insights__section-title">Key Air Pollutants</h3>
          </div>
          <span className="insights__pollutants-count">6 Regulated Pollutants</span>
        </div>

        <div className="insights__pollutants-grid">
          {pollutantInfo.map((p) => (
            <Card key={p.key} className="insights__pollutant-card">
              <div className="insights__pollutant-top">
                <div className="insights__pollutant-icon">
                  <Wind size={14} />
                </div>
                <h4 className="insights__pollutant-name">{p.name}</h4>
              </div>
              <p className="insights__pollutant-desc">{p.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Preventive Measures + Government Guidelines (Side-by-Side) */}
      <div className="insights__guidelines-grid">
        {/* Preventive Measures */}
        <Card className="insights__guide-card">
          <div className="insights__guide-head">
            <div className="insights__guide-icon-wrap insights__guide-icon-wrap--green">
              <ShieldCheck size={16} />
            </div>
            <div>
              <span className="eyebrow">Personal Health</span>
              <h3 className="insights__guide-title">Recommended Preventive Measures</h3>
            </div>
          </div>

          <ul className="insights__checklist">
            <li className="insights__checklist-item">
              <CheckCircle2 size={15} className="insights__check-icon" />
              <div>
                <strong>Wear N95/N99 respirators</strong>
                <p>Use certified particulate filtering masks outdoors on High or Critical AQI days.</p>
              </div>
            </li>
            <li className="insights__checklist-item">
              <CheckCircle2 size={15} className="insights__check-icon" />
              <div>
                <strong>Adjust exercise timing</strong>
                <p>Avoid strenuous outdoor cardio workouts when ambient AQI exceeds 200.</p>
              </div>
            </li>
            <li className="insights__checklist-item">
              <CheckCircle2 size={15} className="insights__check-icon" />
              <div>
                <strong>Deploy HEPA air filtration indoors</strong>
                <p>Run True-HEPA air purifiers in bedrooms and living spaces to reduce indoor PM2.5.</p>
              </div>
            </li>
            <li className="insights__checklist-item">
              <CheckCircle2 size={15} className="insights__check-icon" />
              <div>
                <strong>Incorporate purifying houseplants</strong>
                <p>Snake plants, Areca palms, and Peace Lilies help supplement indoor oxygenation.</p>
              </div>
            </li>
          </ul>
        </Card>

        {/* Government Guidelines */}
        <Card className="insights__guide-card">
          <div className="insights__guide-head">
            <div className="insights__guide-icon-wrap insights__guide-icon-wrap--sky">
              <BookOpen size={16} />
            </div>
            <div>
              <span className="eyebrow">Regulatory Policy</span>
              <h3 className="insights__guide-title">Government Frameworks &amp; Directives</h3>
            </div>
          </div>

          <ul className="insights__checklist">
            <li className="insights__checklist-item">
              <CheckCircle2 size={15} className="insights__check-icon insights__check-icon--sky" />
              <div>
                <strong>CPCB National Air Quality Index (NAQI)</strong>
                <p>One Number-One Color-One Description system standardizing daily national reporting.</p>
              </div>
            </li>
            <li className="insights__checklist-item">
              <CheckCircle2 size={15} className="insights__check-icon insights__check-icon--sky" />
              <div>
                <strong>Graded Response Action Plan (GRAP)</strong>
                <p>Emergency phased anti-pollution interventions deployed across NCR during winter smog spikes.</p>
              </div>
            </li>
            <li className="insights__checklist-item">
              <CheckCircle2 size={15} className="insights__check-icon insights__check-icon--sky" />
              <div>
                <strong>National Clean Air Programme (NCAP)</strong>
                <p>City-specific targeted reduction mandates aiming for a 20–30% PM reduction nationwide.</p>
              </div>
            </li>
            <li className="insights__checklist-item">
              <CheckCircle2 size={15} className="insights__check-icon insights__check-icon--sky" />
              <div>
                <strong>Bharat Stage VI (BS-VI) Emission Norms</strong>
                <p>Strict vehicular emission standard reducing NOx output by up to 70% in diesel vehicles.</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
