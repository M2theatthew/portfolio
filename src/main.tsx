import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { applyEffectsTierAttribute } from './lib/effectsTier';
import './index.css';

// Runs before first paint — every component and stylesheet rule that
// gates on data-fx-tier / data-reduced-motion needs this decided up
// front, not after the tree has already mounted at full effects.
applyEffectsTierAttribute();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
