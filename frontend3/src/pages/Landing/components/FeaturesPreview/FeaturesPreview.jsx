import "./FeaturesPreview.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wind, Leaf, BarChart3 } from "lucide-react";

const cards = [
  {
    icon: Wind,
    title: "AI AQI Prediction",
    value: "84",
    unit: "AQI",
    desc: "Forecast tomorrow's air quality using machine learning and historical environmental data.",
    color: "#1EF2D3",
    route: "/prediction",
  },
  {
    icon: Leaf,
    title: "Carbon Calculator",
    value: "126",
    unit: "kg",
    desc: "Measure your carbon footprint and receive personalized reduction suggestions.",
    color: "#4ED8FF",
    route: "/carbon-calculator",
  },
  {
    icon: BarChart3,
    title: "Smart Insights",
    value: "91",
    unit: "%",
    desc: "Get intelligent reports, trends and recommendations powered by AI.",
    color: "#4EF2C8",
    route: "/insights",
  },
];

export default function FeaturesPreview() {
   const navigate = useNavigate();
  return (
    <section
id="features"
className="features-section"
>
        <div className="orbits">
    <div className="orbit orbit1"></div>
    <div className="orbit orbit2"></div>
    <div className="orbit orbit3"></div>
</div>

<div className="stars">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
</div>

      <motion.div
        className="section-title"
        initial={{opacity:0,y:40}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:.7}}
        viewport={{once:true}}
      >

        <span>CORE FEATURES</span>

         <h2>
  Helping You Breathe Better, Live Greener,
  <br />
  <strong>and Create a More Sustainable Future.</strong>
</h2>
         <p className="section-desc">
    Powerful AI tools that predict air quality, measure carbon
    footprint and generate intelligent environmental insights.
</p>

      </motion.div>

      <div className="cards">

        {cards.map((card,index)=>(

          <motion.div
            key={index}
            className="feature-card"
            initial={{opacity:0,y:60}}
            whileInView={{opacity:1,y:0}}
            transition={{duration:.6,delay:index*.15}}
            viewport={{once:true}}
            whileHover={{
    y:-10,
    scale:1.02
}}
          >

            <motion.div
  className="feature-icon"
  style={{
    boxShadow: `0 0 18px ${card.color}`
  }}
>
              <card.icon size={24} strokeWidth={2.2} color={card.color} />
          </motion.div>

            <h3>{card.title}</h3>

            <div className="feature-number">

              {card.value}

              <span>{card.unit}</span>

            </div>

            <p>{card.desc}</p>
              <div className="card-footer">
    <button
  className="feature-btn"
  onClick={() => navigate(card.route)}
>
  Explore Feature →
</button>
</div>

          </motion.div>

        ))}

      </div>

    </section>
  );
}