import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Prediction from './pages/Prediction/Prediction';
import LiveAQI from './pages/LiveAQI/LiveAQI';
import Carbon from './pages/Carbon/Carbon';
import Reports from './pages/Reports/Reports';
import Insights from './pages/Insights/Insights';
import Alerts from './pages/Alerts/Alerts';
import Settings from './pages/Settings/Settings';
import About from './pages/About/About';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/live-aqi" element={<LiveAQI />} />
        <Route path="/carbon-calculator" element={<Carbon />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
