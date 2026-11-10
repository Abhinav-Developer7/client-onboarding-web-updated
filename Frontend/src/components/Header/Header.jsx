import React from 'react';
import { Link } from 'react-router-dom';
import tortillonLogo from '../../assets/tortillon-logo.png';
import './Header.css';

export const Header = () => {
  return (
    <header className="app-header glass-bar">
      <div className="container header-container">
        <Link to="/onboarding" className="brand-logo" aria-label="Tortillon onboarding">
          <img
            src={tortillonLogo}
            alt="Tortillon"
            className="brand-wordmark"
          />
        </Link>
      </div>
    </header>
  );
};
