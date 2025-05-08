import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <nav className="header-nav">
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/chart">Chart</a></li>
          <li><a href="/budget">Budget</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;