import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Mobile viewport height handler for iOS Safari
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial value
setVH();

// Update on resize (keyboard open/close)
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

createRoot(document.getElementById("root")!).render(<App />);
