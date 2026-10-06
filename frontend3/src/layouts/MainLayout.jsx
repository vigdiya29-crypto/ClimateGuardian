import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import { useTheme } from '../context/ThemeContext';
import './MainLayout.css';

const BREADCRUMB_MAP = {
  '/dashboard': ['ClimateGuardian', 'Dashboard'],
  '/prediction': ['ClimateGuardian', 'AQI Prediction'],
  '/live-aqi': ['ClimateGuardian', 'Live AQI'],
  '/carbon-calculator': ['ClimateGuardian', 'Carbon Calculator'],
  '/reports': ['ClimateGuardian', 'Reports & Analytics'],
  '/insights': ['ClimateGuardian', 'Environmental Insights'],
  '/alerts': ['ClimateGuardian', 'Alerts'],
  '/settings': ['ClimateGuardian', 'Settings'],
  '/about': ['ClimateGuardian', 'About Project'],
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const breadcrumbs = BREADCRUMB_MAP[location.pathname] || ['ClimateGuardian'];
  const { theme } = useTheme();

  return (
    <div className="main-layout" data-theme={theme}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="main-layout__content">
        <Navbar onMenuClick={() => setCollapsed((c) => !c)} breadcrumbs={breadcrumbs} />
        <main className="main-layout__page">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
