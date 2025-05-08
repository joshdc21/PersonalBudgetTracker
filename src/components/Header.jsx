import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import WarningDialog from './WarningDialog'; 

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false); 
  const navigate = useNavigate();

  const confirmLogout = () => {
    setShowLogoutWarning(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutWarning(false);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <nav className="header-nav">
          <ul className="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/chart">Summary</a></li>
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
              <button onClick={() => setShowLogoutWarning(true)}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {showLogoutWarning && (
        <WarningDialog
        message="Are you sure you want to log out?"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        confirmText="Logout"
      />
      )}
    </header>
  );
};

export default Header;
