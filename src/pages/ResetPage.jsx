import React, { useState } from 'react';
import './SignupForm.css'; 
import { useNavigate } from 'react-router-dom';

function ResetPage() {
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
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
      navigate('/login'); 
    }
  };

  return (
    <div className="page-wrapper">
      <div className="signup-container">
        <h1 className="signup-title">Reset Password</h1>
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
            type="password"
            name="currentPassword"
            placeholder="Enter Current Password"
            value={formData.currentPassword}
            onChange={handleChange}
            className={`form-input ${errors.currentPassword ? 'input-error' : ''}`}
          />
          {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}

          <input
            type="password"
            name="newPassword"
            placeholder="Enter New Password"
            value={formData.newPassword}
            onChange={handleChange}
            className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
          />
          {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}

          <button type="submit" className="submit-button">Reset Password</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPage;
