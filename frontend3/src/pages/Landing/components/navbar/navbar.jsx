import { Link } from "react-router-dom";
import { Wind } from "lucide-react";
import { useEffect, useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="landing-nav-container">
        {/* Logo */}
        <Link to="/" className="landing-nav-logo">
          <div className="landing-nav-logo-icon">
            <Wind size={18} />
          </div>
          <span>ClimateGuardian</span>
        </Link>

        {/* Links */}
        <nav className="landing-nav-links">
          <a href="#features">Features</a>
          <Link to="/about">About</Link>
          <a href="#faq">FAQ</a>
        </nav>

        {/* Actions */}
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-nav-login-btn">
            Login
          </Link>
          <Link to="/login" className="landing-nav-start-btn">
            Get Started
            <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}