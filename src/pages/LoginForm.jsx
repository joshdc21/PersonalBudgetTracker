import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from "axios"
import './LoginForm.css';

function LoginForm() {
    const { setUserID } = useUser();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const res = await axios.post("http://localhost:3000/api/login", {
                    username: formData.username,
                    password: formData.password
                })
                
                if(res.status === 200) {
                    setUserID(res.data.userID)
                    navigate("/");
                }
            } catch (err) {
                setErrors({
                    login: "Invalid username or password"
                });
            };
        }
    };

    return (
        <div className="page-wrapper">
            <div className="login-container">
                <h1 className="login-title">Welcome Back!</h1>
                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter Your Username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`form-input ${errors.username ? 'input-error' : ''}`}
                    />
                    {errors.username && <span className="error-text">{errors.username}</span>}

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
