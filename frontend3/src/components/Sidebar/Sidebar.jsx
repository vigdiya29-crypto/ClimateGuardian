import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Radar, Radio, Leaf, FileBarChart2,
  BookOpen, BellRing, Settings, Info, Wind, ChevronsLeft,
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/prediction', label: 'AQI Prediction', icon: Radar },
  { to: '/live-aqi', label: 'Live AQI', icon: Radio },
  { to: '/carbon-calculator', label: 'Carbon Calculator', icon: Leaf },
  { to: '/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/insights', label: 'Insights', icon: BookOpen },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About', icon: Info },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar__brand">
        <span className="sidebar__logo"><Wind size={20} /></span>
        {!collapsed && <span className="sidebar__brand-text">ClimateGuardian</span>}
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <span className="sidebar__link-icon"><Icon size={18} /></span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__user">
        <span className="sidebar__user-avatar">AR</span>
        {!collapsed && (
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">Ayushmaan</span>
            <span className="sidebar__user-role">Environmental Researcher</span>
            <span className="sidebar__user-status"><span className="live-dot" /> Online</span>
          </div>
        )}
      </div>

      <button className="sidebar__collapse" onClick={onToggle} aria-label="Toggle sidebar">
        <ChevronsLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
