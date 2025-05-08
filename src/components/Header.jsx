import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform any logout logic here (e.g., clearing localStorage/session)
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <nav className="header-nav">
          <ul className="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/chart">Chart</a></li>
            <li><a href="/budget">Budget</a></li>
          </ul>
        </nav>
        <div className="user-icon-container">
          <span
            className="material-icons user-icon"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            account_circle
          </span>
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
