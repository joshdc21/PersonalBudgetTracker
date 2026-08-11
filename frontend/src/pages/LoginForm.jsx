import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const API_URL = import.meta.env.VITE_API_URL;

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please verify credentials.');
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.data.name, email: data.data.email }));

      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Server error. Please check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-container">
        <h1 className="login-title">Welcome Back!</h1>
        {serverError && <div className="alert alert-danger" style={{ fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem 1rem' }}>{serverError}</div>}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <input
            type="email"
            name="email"
            placeholder="Enter Your Email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className={`form-input ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <input
            type="password"
            name="password"
            placeholder="Enter Your Password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className={`form-input ${errors.password ? 'input-error' : ''}`}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <div className="button-wrapper">
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="forgot-password-link"
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>

          <div className="additional-links">
            <p className="login-prompt">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="signup-button"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
