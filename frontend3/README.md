# ClimateGuardian — Frontend

AI-powered air quality monitoring & carbon footprint analysis platform for India.
This repository is **frontend only** — it is built to integrate with an existing
Python + XGBoost backend.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. The app starts at the Splash screen → Login →
Dashboard (and the rest of the app behind the sidebar).

## Project structure

```
src/
  components/     Reusable UI: Sidebar, Navbar, Card, AQIGauge, GraphPlaceholder,
                   StatCard, PollutantCard, CitySelector, DateSelector, Loader, Breadcrumbs
  pages/           One folder per page, each with its own .jsx + .css
    Splash/        Animated logo + loading screen
    Login/         Auth screen
    Dashboard/     Main overview (AQI, prediction, carbon, weather, alerts, news)
    Prediction/    AQI Prediction form + result cards
    LiveAQI/       Live pollutant + weather monitoring
    Carbon/        Carbon Footprint Calculator
    Reports/       Model evaluation metrics & graph placeholders
    Insights/      Educational AQI/pollutant/guideline content
    Alerts/        AQI & weather alerts feed
    Settings/      Theme, language, notifications, profile
    About/         Project, tech stack, academic details
  layouts/         MainLayout (sidebar+navbar shell), AuthLayout (splash/login)
  context/         ThemeContext (light/dark mode)
  data/            placeholderData.js — mock API responses (see below)
  utils/           aqiUtils.js — AQI category/color logic shared across pages
  hooks/           useMediaQuery.js
  styles/          variables.css (design tokens), globals.css
```

## Connecting the backend

Every screen currently reads from `src/data/placeholderData.js`. Each export in
that file has a comment stating the intended endpoint, e.g.:

```js
// GET /api/aqi/current?city=
export const currentAqi = { city: 'Delhi', aqi: 168, ... };
```

To wire up the real backend:

1. Replace the static import with a `fetch`/`axios` call inside the page
   component (or lift it into a small `services/` layer if preferred).
2. Keep the same object shape the components already expect — every card,
   gauge and graph placeholder is written against these shapes, so the UI
   needs no restructuring once real data arrives.
3. `GraphPlaceholder` is a stand-in for whichever chart library you choose
   (Recharts, Chart.js, etc.) — swap its internals only, keep the wrapper
   markup (title/subtitle/tag) for visual consistency.
4. The AQI Prediction page's `handlePredict` and the Carbon Calculator's
   `handleCalculate` are the two places that should become real API calls
   (`POST /api/predict`, `POST /api/carbon/calculate`).

## Design tokens

Colors, gradients, spacing, radii and motion timing all live in
`src/styles/variables.css`, including a `[data-theme='dark']` override block.
The signature visual is `AQIGauge` — a breathing arc gauge whose pulse speed
scales with severity — used on the Dashboard, Prediction and Live AQI pages.

## Notes

- No backend or ML code is included, per the brief.
- All graphs are intentionally placeholders (animated skeleton line/bar charts).
- Built with React 18, Vite, React Router, Framer Motion and lucide-react icons.
