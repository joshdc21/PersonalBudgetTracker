import React, { useState } from 'react';
import './LoginForm.css'; 
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ForgotPass() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send password reset email.');
      }

      setSuccess('If the email is registered, a password reset link has been sent.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-container">
        <h1 className="login-title">Reset Your Password</h1>
        {success && <div className="alert alert-success" style={{ color: 'var(--success-color, green)', marginBottom: '15px' }}>{success}</div>}
        {error && <div className="alert alert-danger" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          <input
            type="email"
            name="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={handleChange}
            className={`form-input ${error ? 'input-error' : ''}`}
            disabled={isLoading}
          />
          {error && <span className="error-text">{error}</span>}

          <div className="button-wrapper" style={{ marginTop: '20px' }}>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
          
          <div className="auth-redirect" style={{ marginTop: '15px', textAlign: 'center' }}>
            <span onClick={() => navigate('/login')} className="redirect-link" style={{ cursor: 'pointer', color: 'var(--primary-color)' }}>
              Back to Login
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPass;
