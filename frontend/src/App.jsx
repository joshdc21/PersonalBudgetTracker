import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupForm from './pages/SignupForm';
import LoginForm from './pages/LoginForm';
import ForgotPass from './pages/ForgotPass';
import Homepage from './pages/HomePage';
import ChartPage from './pages/ChartPage'; 
import BudgetPage from './pages/BudgetPage';

import './App.css';

// Guard component to redirect unauthenticated users to login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
          <Route path="/chart" element={<ProtectedRoute><ChartPage /></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
