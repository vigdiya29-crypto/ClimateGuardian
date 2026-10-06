import HeroVisual from "./HeroVisual";
import "./Hero.css";
import { useNavigate } from "react-router-dom";

export default function Hero() {
   const navigate = useNavigate();
  return (

    <section className="hero">
      {/* Stars */}
      <div className="hero-stars">
        {Array.from({ length: 140 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`
            }}
          />
        ))}
      </div>


      {/* LEFT */}

      <div className="hero-left">

        <span className="hero-badge">
          AI Powered Environmental Intelligence
        </span>
<h1>
  Don't Just<br />
  Predict the Future.<br />
  <span>Create It.</span>
</h1>

        <p>
  Monitor air quality, measure your carbon footprint,
  and unlock AI-powered sustainability insights—
  all from one intelligent platform built for a cleaner,
  healthier, and greener tomorrow.
</p>

        <div className="hero-buttons">

          <button
onClick={()=>navigate("/login")}
className="primary-btn"
>
Get Started
</button>

<a href="#features" className="secondary-btn">
    Learn More
</a>

        </div>

      </div>

      {/* RIGHT */}

      <div className="hero-right">

          <HeroVisual />

      </div>

    </section>
  );
}