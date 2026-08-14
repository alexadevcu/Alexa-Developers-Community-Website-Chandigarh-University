import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Join from './pages/Join';
import Events from './pages/Events';
import Team from './pages/Team';
import Legacy from './pages/Legacy';
import HallOfFame from './pages/HallOfFame';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  useEffect(() => {
    // Dismiss initial HTML loader globally once App mounts
    const htmlLoader = document.getElementById('initial-loader');
    if (htmlLoader) {
      htmlLoader.classList.add('hidden');
      setTimeout(() => htmlLoader.remove(), 500);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/team" element={<Team />} />
              <Route path="/legacy" element={<Legacy />} />
              <Route path="/hall-of-fame" element={<HallOfFame />} />
              <Route path="/join" element={<Join />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

