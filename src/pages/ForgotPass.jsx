import React, { useState } from 'react';
import './LoginForm.css'; 
import { useNavigate } from 'react-router-dom';

function ForgotPass() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    setError('');
    return true;
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateEmail()) {
      navigate('/');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-container">
        <h1 className="login-title">Reset Your Password</h1>
        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          <input
            type="email"
            name="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={handleChange}
            className={`form-input ${error ? 'input-error' : ''}`}
          />
          {error && <span className="error-text">{error}</span>}

          <div className="button-wrapper">
            <button type="submit" className="submit-button">Send Reset Link</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPass;
