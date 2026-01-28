import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import PageSkeleton from './components/ui/PageSkeleton';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UrbanVisionPage = lazy(() => import('./pages/UrbanVisionPage'));
const DistrictsPage = lazy(() => import('./pages/DistrictsPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PredictiveInsightsPage = lazy(() => import('./pages/PredictiveInsightsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Suspense fallback={<PageSkeleton />}><DashboardPage /></Suspense>} />
          <Route path="/vision" element={<Suspense fallback={<PageSkeleton />}><UrbanVisionPage /></Suspense>} />
          <Route path="/districts" element={<Suspense fallback={<PageSkeleton />}><DistrictsPage /></Suspense>} />
          <Route path="/analytics" element={<Suspense fallback={<PageSkeleton />}><AnalyticsPage /></Suspense>} />
          <Route path="/alerts" element={<Suspense fallback={<PageSkeleton />}><AlertsPage /></Suspense>} />
          <Route path="/insights" element={<Suspense fallback={<PageSkeleton />}><PredictiveInsightsPage /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<PageSkeleton />}><AboutPage /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
