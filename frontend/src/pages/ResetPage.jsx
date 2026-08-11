import React, { useState } from 'react';
import './LoginForm.css'; 
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ResetPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  const validatePasswords = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setSuccess('Your password has been successfully reset.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
        
        {success && (
          <div className="alert alert-success" style={{ color: 'var(--success-color, green)', marginBottom: '15px' }}>
            {success} Redirecting to login...
          </div>
        )}
        {error && (
          <div className="alert alert-danger" style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="signup-form" noValidate>
            <input
              type="password"
              name="password"
              placeholder="New Password (min 6 characters)"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
              className={`form-input ${error && !password ? 'input-error' : ''}`}
              disabled={isLoading}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
              className={`form-input ${error && password !== confirmPassword ? 'input-error' : ''}`}
              disabled={isLoading}
              required
            />

            <div className="button-wrapper" style={{ marginTop: '20px' }}>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
        
        <div className="auth-redirect" style={{ marginTop: '15px', textAlign: 'center' }}>
          <span onClick={() => navigate('/login')} className="redirect-link" style={{ cursor: 'pointer', color: 'var(--primary-color)' }}>
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResetPage;
