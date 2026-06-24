import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Dismiss the HTML loader immediately for any page that isn't Home.
// Home.tsx controls its own dismissal (waits for Spline 3D to load).
// For all other routes (/admin, /events, /team, /join etc.) we dismiss
// synchronously right here before React even renders — no flicker, no block.
const path = window.location.pathname;
if (path !== '/') {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.classList.add('hidden');
    // Remove from DOM after the CSS fade-out (0.5s transition)
    setTimeout(() => loader.remove(), 500);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
