import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      navigate('/')
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-container">
        <h1 className="login-title">Welcome Back!</h1>
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <input
            type="email"
            name="email"
            placeholder="Enter Your Email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <input
            type="password"
            name="password"
            placeholder="Enter Your Password"
            value={formData.password}
            onChange={handleChange}
            className={`form-input ${errors.password ? 'input-error' : ''}`}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <div className="button-wrapper">
            <button type="submit" className="submit-button">Login</button>
            <button type="button" onClick={() => navigate('/reset-password')} className="forgot-password-link">
              Forgot Password?
            </button>
          </div>

          <div className="additional-links">
            <p className="login-prompt">
              Don't have an account? <button onClick={() => navigate('/signup')} className="signup-button">Sign Up</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
