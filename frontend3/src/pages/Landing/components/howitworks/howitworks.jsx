import "./howitworks.css";
import { motion } from "framer-motion";
import {
  Database,
   Workflow,
  BarChart3,
  Leaf
} from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Collect Data",
    desc: "Collect real-time air quality and weather information from trusted environmental sources."
  },
 {
  icon: Workflow,
  title: "Analyze Patterns",
  desc: "Analyze environmental trends to generate accurate air quality forecasts."
},
  {
    icon: BarChart3,
    title: "Generate Insights",
    desc: "Visualize climate data through interactive dashboards and meaningful analytics."
  },
  {
    icon: Leaf,
    title: "Take Action",
    desc: "Receive practical recommendations to reduce emissions and improve sustainability."
  }
];

export default function HowItWorks() {
  return (
    <section className="how-section">

      <motion.div
        className="how-title"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <span>HOW IT WORKS</span>

        <h2>
          From Environmental Data
          <br />
          <strong>To Intelligent Decisions</strong>
        </h2>
      </motion.div>

      <div className="timeline">

        <div className="timeline-line"></div>

        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="timeline-step"
            initial={{ opacity: 0, y: 70, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: index * 0.35,
              ease: "easeOut"
            }}
            viewport={{ once: true }}
          >
            <div className="circle">
    <step.icon size={24} strokeWidth={2.2} />
</div>

            <span className="step-number">
              STEP {String(index + 1).padStart(2, "0")}
            </span>

            <div className="step-card">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </motion.div>
        ))}

      </div>

    </section>
  );
}