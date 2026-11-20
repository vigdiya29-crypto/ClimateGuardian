/**
 * ClimateGuardian Centralized API Client
 * ---------------------------------------
 * Connects frontend3 views to the ClimateGuardian FastAPI backend.
 * Uses Vite proxy for local dev (/api/* -> http://127.0.0.1:8000/api/*)
 * or VITE_API_BASE_URL when explicitly specified.
 */

import {
  currentAqi as fallbackCurrentAqi,
  predictedAqi as fallbackPredictedAqi,
  weatherNow as fallbackWeather,
  alerts as fallbackAlerts,
  newsItems as fallbackNews,
  modelMetrics as fallbackMetrics,
  aqiCategories as fallbackCategories,
  pollutantInfo as fallbackPollutants,
} from '../data/placeholderData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Token storage key
const AUTH_TOKEN_KEY = 'cg_access_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Could not update stored token', e);
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.detail || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = errorData;
      throw error;
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    throw err;
  }
}

// ── 1. Live AQI & Prediction ────────────────────────────────────────────────
export async function getLiveAqi(city = 'Delhi') {
  try {
    const data = await request(`/api/aqi/predict?city=${encodeURIComponent(city)}`);
    return {
      city: data.city,
      aqi: Math.round(data.predicted_aqi),
      category: data.category,
      mainPollutant: 'PM2.5',
      updatedAt: new Date().toISOString(),
      confidence: data.confidence || 0.91,
      weather: data.weather,
      pollutants: data.pollutants,
    };
  } catch {
    return { ...fallbackCurrentAqi, city };
  }
}

export async function predictAqi(city = 'Delhi') {
  try {
    const data = await request(`/api/aqi/predict?city=${encodeURIComponent(city)}`);
    return {
      city: data.city,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      aqi: Math.round(data.predicted_aqi),
      confidence: data.confidence || 0.91,
      mainPollutant: 'PM2.5',
      category: data.category,
    };
  } catch {
    return { ...fallbackPredictedAqi, city };
  }
}

// ── 2. Weather ──────────────────────────────────────────────────────────────
export async function getCurrentWeather(city = 'Delhi') {
  try {
    const data = await request(`/api/weather/current?city=${encodeURIComponent(city)}`);
    return {
      city: data.city,
      temperatureC: Math.round(data.temperature),
      humidity: Math.round(data.relative_humidity),
      pressureHpa: Math.round(data.surface_pressure),
      windSpeedKmh: Math.round(data.wind_speed),
      rainMm: data.rain ?? 0,
      condition: data.weather_code <= 3 ? 'Clear / Partly Cloudy' : 'Cloudy',
    };
  } catch {
    return { ...fallbackWeather, city };
  }
}

// ── 3. Carbon Calculator ───────────────────────────────────────────────────
export async function calculateCarbonFootprint(payload) {
  try {
    return await request('/api/carbon/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Backend carbon calculation failed, falling back to local computation', err);
    throw err;
  }
}

export async function getCarbonFactors() {
  try {
    return await request('/api/carbon/factors');
  } catch {
    return null;
  }
}

// ── 4. Reports & Metrics ───────────────────────────────────────────────────
export async function getModelMetrics() {
  try {
    return await request('/api/reports/metrics');
  } catch {
    return fallbackMetrics;
  }
}

export async function getValidationData() {
  try {
    return await request('/api/reports/validation');
  } catch {
    return null;
  }
}

export async function getFeatureImportance() {
  try {
    return await request('/api/reports/feature-importance');
  } catch {
    return null;
  }
}

// ── 5. Alerts & Environmental News ─────────────────────────────────────────
export async function getAlerts(city = 'All', type = 'All') {
  try {
    const query = new URLSearchParams();
    if (city && city !== 'All') query.set('city', city);
    if (type && type !== 'All') query.set('type', type);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request(`/api/alerts${qs}`);
  } catch {
    return fallbackAlerts;
  }
}

export async function getEnvironmentalNews() {
  try {
    return await request('/api/news/environment');
  } catch {
    return fallbackNews;
  }
}

// ── 6. Insights & Atmospheric Standards ────────────────────────────────────
export async function getAqiCategories() {
  try {
    return await request('/api/insights/aqi-categories');
  } catch {
    return fallbackCategories;
  }
}

export async function getPollutantSpecs() {
  try {
    return await request('/api/insights/pollutants');
  } catch {
    return fallbackPollutants;
  }
}

export async function getAllInsights() {
  try {
    return await request('/api/insights');
  } catch {
    return null;
  }
}

// ── 7. Authentication ──────────────────────────────────────────────────────
export async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function register(name, email, password) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (data?.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function getCurrentUser() {
  return await request('/api/auth/me');
}

export async function requestForgotOtp(email) {
  return await request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email, otp) {
  return await request('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

export async function resetPassword(email, otp, newPassword) {
  return await request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, new_password: newPassword }),
  });
}

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    setStoredToken(null);
  }
}

// ── 8. AI & Gemini Assistant ───────────────────────────────────────────────
export async function getAiInsight(city = 'Delhi') {
  try {
    return await request(`/api/ai/insight?city=${encodeURIComponent(city)}`);
  } catch {
    return {
      city,
      confidence: 0.91,
      headline: 'AQI is expected to remain stable',
      insight: 'PM2.5 is currently the primary contributor. Consider limiting outdoor exposure during peak traffic hours.',
      recommendation: 'Sensitive groups should consider limiting prolonged outdoor exertion.',
    };
  }
}

export async function sendChatMessage(message, city = 'Delhi') {
  return await request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, city }),
  });
}
