import "./Footer.css";
import {
FaGithub,
FaLinkedin,
FaEnvelope,
FaGlobe
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Wind } from "lucide-react";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* LEFT */}

        <div className="footer-brand">

        <Link to="/" className="footer-logo">
  <div className="logo-icon">
    <Wind size={18} />
  </div>

  <span className="footer-logo-text">
    ClimateGuardian
  </span>
</Link>

          <p>
            AI-powered sustainability platform helping people
            monitor, predict and improve environmental impact
            through intelligent insights.
          </p>

          <div className="socials">

            <a
  href="https://github.com/"
  target="_blank"
  rel="noopener noreferrer"
>
  <FaGithub />
</a>

              <a><FaEnvelope/></a>

              <a><FaLinkedin/></a>

                <a><FaGlobe/></a>

          </div>
         <div className="footer-divider"></div>

        </div>

        {/* LINKS */}

        <div className="footer-links">

          <h4>Platform</h4>

          <a href="#">Features</a>

         <Link to="/dashboard">Dashboard</Link>

          <Link to="/reports">Reports</Link>

<Link to="/insights">AI Insights</Link>

        </div>

        <div className="footer-links">

          <h4>Resources</h4>

          <a href="#">Documentation</a>

          <a href="#">FAQ</a>

          <a href="#">Support</a>

          <a href="#">Contact</a>

        </div>

        <div className="footer-links">

          <h4>Legal</h4>

          <a href="#">Privacy Policy</a>

          <a href="#">Terms</a>

          <a href="#">License</a>

        </div>

      </div>

      <div className="footer-bottom">

        <span>
         © 2026 ClimateGuardian • All Rights Reserved
        </span>

        <span>
          Built with ❤️ for a Sustainable Future
        </span>

      </div>

    </footer>
  );
}

export default Footer;