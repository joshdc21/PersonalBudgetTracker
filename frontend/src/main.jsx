import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Intercept all fetch requests globally to handle 401 token expiration/invalidity
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401) {
    const pathsToIgnore = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const isAuthPage = pathsToIgnore.some(path => window.location.pathname.includes(path));
    if (!isAuthPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
