import "./WhySection.css";
import {
  Wind,
  Leaf,
 CloudSun,
  LayoutDashboard,
  FileText,
  Lightbulb,
  BrainCircuit,
} from "lucide-react";

const leftModules = [
  {
    icon: <Wind size={20} strokeWidth={2.2} />,
    title: "AQI Prediction",
    desc: "Forecast tomorrow's air quality using historical environmental data."
  },
  {
    icon: <Leaf size={20} strokeWidth={2.2} />,
    title: "Carbon Calculator",
    desc: "Measure your carbon footprint and discover ways to reduce emissions."
  },
  {
    icon: <CloudSun size={20} strokeWidth={2.2} />,
    title: "Weather Analysis",
    desc: "Monitor temperature, humidity and weather conditions in real time."
  }
];

const rightModules = [
  {
    icon: <LayoutDashboard size={20} strokeWidth={2.2} />,
    title: "Dashboard",
    desc: "Track environmental metrics through an interactive dashboard."
  },
  {
    icon: <FileText size={20} strokeWidth={2.2} />,
    title: "Reports",
    desc: "Generate professional environmental reports with one click."
  },
  {
    icon: <Lightbulb size={20} strokeWidth={2.2} />,
    title: "Smart Insights",
    desc: "Receive personalized recommendations based on environmental trends."
  }
];
function ModuleCard({ icon, title, desc }) {
  return (
    <div className="module-wrapper">
      <div className="module-card">
        <div className="module-icon">{icon}</div>

        <h3>{title}</h3>

        <p>{desc}</p>

        <div className="card-glow"></div>
      </div>

      <div className="connector"></div>
    </div>
  );
}
export default function WhySection() {
  return (
    <section className="why-section">
      <div className="bg-blur blur1"></div>
      <div className="bg-blur blur2"></div>

      {/* ---------- Header ---------- */}

      <div className="why-header">

        <span className="why-tag">
          WHY CLIMATEGUARDIAN
        </span>

        <h2>
          One AI.
          <br />
          <span>Six Intelligent Systems.</span>
        </h2>

        <p>
          ClimateGuardian combines prediction, sustainability,
          analytics and intelligent recommendations into one
          connected environmental ecosystem.
        </p>

      </div>

      {/* ---------- Main Layout ---------- */}

      <div className="why-layout">

        {/* LEFT */}

        <div className="modules-column">

          {leftModules.map((item, index) => (
            <ModuleCard
              key={index}
              {...item}
            />
          ))}

        </div>

        {/* CENTER */}

        <div className="why-ai-center">

          <div className="orbit orbit1"></div>
          <div className="orbit orbit2"></div>
          <div className="orbit orbit3"></div>
          <div className="particles">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>

          <div className="why-ai-core">

            <div className="outer-ring"></div>

            <div className="inner-core">

              <div className="robot">
  <BrainCircuit
    size={46}
    strokeWidth={2}
  />
</div>

            </div>

          </div>

          <h3 className="why-ai-title">
            ClimateGuardian Core
          </h3>

          <p className="why-ai-subtitle">
            Unified Environmental Intelligence
          </p>

        </div>

        {/* RIGHT */}

        <div className="modules-column">

          {rightModules.map((item, index) => (
            <ModuleCard
              key={index}
              {...item}
            />
          ))}

        </div>

      </div>

    </section>
  );
}