import { useState } from 'react';
import {
  Moon,
  Sun,
  Globe,
  Bell,
  User,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Monitor,
  MapPin,
  Mail,
  AlertTriangle,
  FileBarChart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import { useTheme } from '../../context/ThemeContext';
import './Settings.css';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState({
    aqiAlerts: true,
    weatherAlerts: true,
    weeklyReport: false,
  });

  function toggleNotif(key) {
    setNotifications((n) => ({ ...n, [key]: !n[key] }));
  }

  return (
    <div className="page-container settings-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow">Account &amp; Preferences</span>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Manage your profile, appearance, language, and notification preferences.
          </p>
        </div>
      </div>

      {/* ===== Profile Section ===== */}
      <Card className="settings__card">
        <div className="settings__card-head">
          <User size={14} className="settings__card-head-icon" />
          <span className="eyebrow">Profile</span>
        </div>
        <div className="settings__profile">
          <span className="settings__avatar">AR</span>
          <div className="settings__profile-info">
            <h4 className="settings__profile-name">Ayushmaan</h4>
            <p className="settings__profile-meta">
              <MapPin size={12} /> Jammu, India · Filmmaker
            </p>
          </div>
          <button className="btn btn-ghost btn-sm settings__edit-btn">
            Edit Profile
          </button>
        </div>
      </Card>

      {/* ===== Theme & Language Row ===== */}
      <div className="settings__dual-grid">
        {/* Theme Card */}
        <Card className="settings__card">
          <div className="settings__card-head">
            <Monitor size={14} className="settings__card-head-icon" />
            <span className="eyebrow">Appearance</span>
          </div>
          <div className="settings__option-row">
            <div className="settings__option-info">
              <span className="settings__option-icon-wrap">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </span>
              <div>
                <span className="settings__option-label">Dark Mode</span>
                <span className="settings__option-hint">
                  {theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
                </span>
              </div>
            </div>
            <button
              className={`settings__toggle ${theme === 'dark' ? 'is-on' : ''}`}
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <span className="settings__toggle-knob" />
            </button>
          </div>
          <p className="settings__theme-note">
            Theme applies only to the dashboard. Landing and login pages keep their original design.
          </p>
        </Card>

        {/* Language Card */}
        <Card className="settings__card">
          <div className="settings__card-head">
            <Globe size={14} className="settings__card-head-icon" />
            <span className="eyebrow">Language &amp; Region</span>
          </div>
          <div className="settings__option-row">
            <div className="settings__option-info">
              <span className="settings__option-icon-wrap">
                <Globe size={16} />
              </span>
              <div>
                <span className="settings__option-label">Display Language</span>
                <span className="settings__option-hint">Interface language preference</span>
              </div>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="settings__select"
          >
            <option>English</option>
            <option>हिन्दी (Hindi)</option>
            <option>বাংলা (Bengali)</option>
            <option>தமிழ் (Tamil)</option>
          </select>
        </Card>
      </div>

      {/* ===== Notifications Section ===== */}
      <Card className="settings__card">
        <div className="settings__card-head">
          <Bell size={14} className="settings__card-head-icon" />
          <span className="eyebrow">Notifications</span>
        </div>

        <div className="settings__notif-list">
          {[
            {
              key: 'aqiAlerts',
              label: 'AQI Threshold Alerts',
              hint: 'Receive alerts when air quality exceeds safe limits.',
              icon: AlertTriangle,
            },
            {
              key: 'weatherAlerts',
              label: 'Severe Weather Warnings',
              hint: 'Get notified about extreme weather events in your area.',
              icon: Shield,
            },
            {
              key: 'weeklyReport',
              label: 'Weekly Summary Report',
              hint: 'Receive a weekly email digest of environmental trends.',
              icon: FileBarChart,
            },
          ].map((item) => (
            <div className="settings__notif-row" key={item.key}>
              <div className="settings__option-info">
                <span className="settings__option-icon-wrap">
                  <item.icon size={15} />
                </span>
                <div>
                  <span className="settings__option-label">{item.label}</span>
                  <span className="settings__option-hint">{item.hint}</span>
                </div>
              </div>
              <button
                className={`settings__toggle ${notifications[item.key] ? 'is-on' : ''}`}
                onClick={() => toggleNotif(item.key)}
                aria-label={`Toggle ${item.label}`}
              >
                <span className="settings__toggle-knob" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* ===== Help & Logout Actions ===== */}
      <div className="settings__dual-grid">
        <Card className="settings__action-card">
          <div className="settings__action-left">
            <div className="settings__action-icon settings__action-icon--green">
              <HelpCircle size={18} />
            </div>
            <div>
              <h4 className="settings__action-title">Help &amp; Support</h4>
              <p className="settings__action-desc">FAQs, documentation, and contact support.</p>
            </div>
          </div>
          <ChevronRight size={16} className="settings__action-arrow" />
        </Card>

        <Card
          className="settings__action-card settings__action-card--danger"
          onClick={() => navigate('/login')}
        >
          <div className="settings__action-left">
            <div className="settings__action-icon settings__action-icon--danger">
              <LogOut size={18} />
            </div>
            <div>
              <h4 className="settings__action-title">Log Out</h4>
              <p className="settings__action-desc">Sign out of your ClimateGuardian account.</p>
            </div>
          </div>
          <ChevronRight size={16} className="settings__action-arrow" />
        </Card>
      </div>
    </div>
  );
}
