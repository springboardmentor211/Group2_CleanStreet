import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiHome } from 'react-icons/fi';
import Button from '../components/ui/Button';
import '../styles/pages.css';

const UnauthorizedPage = () => {
  return (
    <div className="unauthorized-page">
      <header className="login-header">
        <div className="container">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-logo">
                <FiHome className="logo-icon" />
                CleanStreet
              </Link>
              <div className="nav-links">
                <Link to="/login" className="btn btn-secondary">Login</Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="unauthorized-main">
        <div className="container">
          <div className="unauthorized-content">
            <div className="unauthorized-icon">
              <FiLock />
            </div>
            <h1>Access Denied</h1>
            <p className="text-muted">
              You don't have permission to access this page with your current role.
            </p>
            <div className="unauthorized-actions">
              <Link to="/dashboard">
                <Button variant="primary">
                  <FiHome /> Go to Dashboard
                </Button>
              </Link>
              <Link to="/">
                <Button variant="secondary">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnauthorizedPage;