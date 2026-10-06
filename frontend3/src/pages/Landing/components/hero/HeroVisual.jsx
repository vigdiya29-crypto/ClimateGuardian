
import { motion } from "framer-motion";
import "./HeroVisual.css";
import earth from "../../assets/earth.png";

export default function HeroVisual() {
  
  return (
    <div className="visual">

      {/* Glow */}
      <div className="earth-glow"></div>

      {/* Rings */}
      <div className="ring ring1"></div>
      <div className="ring ring2"></div>
      <div className="ring ring3"></div>
      <div className="ring ring4"></div>

      <div className="orbit-dot orbit-dot1"></div>
      <div className="orbit-dot orbit-dot2"></div>
      <div className="orbit-dot orbit-dot3"></div>

      {/* Earth */}

      <motion.img
        src={earth}
        alt="Earth"
        className="earth"
        animate={{
          y: [0, -12, 0],
          rotate: 360
        }}
        transition={{
          y: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 120,
            repeat: Infinity,
            ease: "linear"
          }
        }}
      />
      <div className="earth-particles">

  {Array.from({ length: 40 }).map((_, i) => (

    <span
      key={i}
      className="earth-particle"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`
      }}
    ></span>

  ))}
  <svg className="connection-lines" viewBox="0 0 800 800">

  <line x1="400" y1="300" x2="650" y2="180" />

  <line x1="400" y1="430" x2="170" y2="390" />

  <line x1="420" y1="520" x2="650" y2="600" />

</svg>
<div className="node node1"></div>
<div className="node node2"></div>
<div className="node node3"></div>

</div>
      <div className="glass-card card-top">
    <span className="card-title">
    <span className="status-dot"></span>
    LIVE AQI
</span>
    <h2>84</h2>
    <p>Good</p>
</div>

<div className="glass-card card-left">
   <span className="card-title">
    <span className="status-dot"></span>
    PREDICTION
</span>
    <h2>91%</h2>
    <p>Accuracy</p>
</div>

<div className="glass-card card-bottom">
    <span className="card-title">
    <span className="status-dot"></span>
    CARBON SAVED
</span>
    <h2>126 kg</h2>
    <p>This Month</p>
</div>

    </div>
  );
}