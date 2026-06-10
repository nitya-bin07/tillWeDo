import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CoupleProvider } from './context/CoupleContext';
import { VaultProvider } from './context/VaultContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CoupleProvider>
          <VaultProvider>
            <App />
          </VaultProvider>
        </CoupleProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);