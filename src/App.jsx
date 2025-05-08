import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import SignupForm from './pages/SignupForm';
import LoginForm from './pages/LoginForm';
import ForgotPass from './pages/ForgotPass';
import Homepage from './pages/HomePage';
import ChartPage from './pages/ChartPage'; 
import BudgetPage from './pages/BudgetPage';

import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/" element={<Homepage expenses={expenses} setExpenses={setExpenses} />} />
          <Route path="/chart" element={<ChartPage expenses={expenses} setExpenses={setExpenses} />} />
          <Route path="/budget" element={<BudgetPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
