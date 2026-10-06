import "./CTA.css";
import { useNavigate } from "react-router-dom";

function CTA() {
    const navigate = useNavigate();
  return (
    <section className="cta-section">

      <div className="cta-glow"></div>

      <div className="cta-box">

        <span className="cta-tag">
          READY TO BUILD A GREENER FUTURE?
        </span>

        <h2>
          Start Using <span>ClimateGuardian</span> Today.
        </h2>

        <p>
          Predict air quality, calculate your carbon footprint,
          monitor weather and receive intelligent AI recommendations —
          all in one beautifully designed platform.
        </p>

        <div className="cta-buttons">

         <button
    className="primary-btn"
    onClick={() => navigate("/login")}
>
    Get Started
</button>

        <button
    className="secondary-btn"
    onClick={() => navigate("/dashboard")}
>
    Explore Dashboard
</button>
        </div>

      </div>

    </section>
  );
}

export default CTA;