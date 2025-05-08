import React, { useState } from 'react';
import './SignupForm.css';
import { useNavigate } from 'react-router-dom';

function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
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
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      navigate('/');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="signup-container">
        <h1 className="signup-title">Sign Up</h1>
        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          <input
            type="text"
            name="name"
            placeholder="Enter Your Name"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? 'input-error' : ''}`}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}

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

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Your Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

          <button type="submit" className="submit-button">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
