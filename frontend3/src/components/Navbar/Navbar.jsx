import { useState, useRef, useEffect } from 'react';
import { Bell, Settings, Menu, Sun, Moon, ChevronDown, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import './Navbar.css';

export default function Navbar({ onMenuClick, breadcrumbs = ['Dashboard'] }) {
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  return (
    <header className="navbar">
      <div className="navbar__left">
        <button
          className="navbar__icon-btn navbar__menu"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
          title="Toggle menu"
        >
          <Menu size={17} />
        </button>
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="navbar__right">
        <button
          className="navbar__icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          className="navbar__icon-btn navbar__bell"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="navbar__dot" />
        </button>

        <Link
          to="/settings"
          className="navbar__icon-btn"
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={16} />
        </Link>

        <div className="navbar__profile" ref={profileRef}>
          <button
            className={`navbar__profile-btn ${profileOpen ? 'is-open' : ''}`}
            onClick={() => setProfileOpen((o) => !o)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="User profile menu"
          >
            <span className="navbar__avatar">AR</span>
            <span className="navbar__profile-name">Ayushmaan</span>
            <ChevronDown size={13} className={`navbar__chevron ${profileOpen ? 'is-open' : ''}`} />
          </button>

          {profileOpen && (
            <div className="navbar__dropdown" role="menu">
              <div className="navbar__dropdown-header">
                <div className="navbar__dropdown-user">
                  <strong>Ayushmaan</strong>
                  <span>Environmental Researcher</span>
                </div>
                <span className="navbar__status-tag">
                  <span className="live-dot" /> Online
                </span>
              </div>

              <div className="navbar__dropdown-menu">
                <Link
                  to="/settings"
                  className="navbar__dropdown-item"
                  onClick={() => setProfileOpen(false)}
                  role="menuitem"
                >
                  <User size={15} />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="navbar__dropdown-item"
                  onClick={() => setProfileOpen(false)}
                  role="menuitem"
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </Link>
                <div className="navbar__dropdown-divider" />
                <Link
                  to="/"
                  className="navbar__dropdown-item navbar__dropdown-item--danger"
                  onClick={() => setProfileOpen(false)}
                  role="menuitem"
                >
                  <LogOut size={15} />
                  <span>Log out</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
