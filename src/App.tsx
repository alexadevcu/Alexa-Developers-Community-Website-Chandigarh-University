import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-load sub-routes to split chunks and speed up initial render
const Join = lazy(() => import('./pages/Join'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Team = lazy(() => import('./pages/Team'));
const TeamMemberDetail = lazy(() => import('./pages/TeamMemberDetail'));
const Legacy = lazy(() => import('./pages/Legacy'));
const HallOfFame = lazy(() => import('./pages/HallOfFame'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageFallback = () => (
  <div className="w-full min-h-[60vh] flex items-center justify-center pt-24">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-[#006783] rounded-full animate-spin" />
  </div>
);

function App() {
  useEffect(() => {
    // Dismiss initial HTML loader globally once App mounts
    const htmlLoader = document.getElementById('initial-loader');
    if (htmlLoader) {
      htmlLoader.classList.add('hidden');
      setTimeout(() => htmlLoader.remove(), 250);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/team" element={<Team />} />
                <Route path="/team/:id" element={<TeamMemberDetail />} />
                <Route path="/legacy" element={<Legacy />} />
                <Route path="/hall-of-fame" element={<HallOfFame />} />
                <Route path="/join" element={<Join />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
      {import.meta.env.PROD && <Analytics />}
    </ErrorBoundary>
  );
}

export default App;
