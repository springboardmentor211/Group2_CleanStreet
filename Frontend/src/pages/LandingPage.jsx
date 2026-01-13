import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHome, FiAlertCircle, FiEye, FiMapPin, FiCheckCircle, 
  FiUsers, FiArrowRight, FiUserPlus, FiLogIn 
} from 'react-icons/fi';
import Button from '../components/ui/Button';
import '../styles/pages.css';

const LandingPage = () => {
  const features = [
    {
      icon: <FiAlertCircle />,
      title: 'Report Issues',
      description: 'Easily report civic problems with photos and location details'
    },
    {
      icon: <FiEye />,
      title: 'Track Progress',
      description: 'Monitor the status of reported issues in real-time'
    },
    {
      icon: <FiUsers />,
      title: 'Community Impact',
      description: 'Vote and comment on issues to prioritize community needs'
    }
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-logo">
                <FiHome className="logo-icon" />
                CleanStreet
              </Link>
              <div className="nav-links">
                <Link to="/login" className="nav-link">
                  <FiLogIn /> Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  <FiUserPlus /> Get Started
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Make Your City Cleaner & Smarter</h1>
            <p className="hero-subtitle">
              Report civic issues, track progress, and help build a better community together.
            </p>
            <div className="hero-actions">
              <Link to="/register">
                <Button variant="primary" icon="arrow-right">
                  Report an Issue
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">
                  View Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How CleanStreet Works</h2>
          <p className="section-subtitle">
            Simple steps to make a difference in your community
          </p>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Make a Difference?</h2>
            <p>Join thousands of citizens already improving their communities</p>
            <Link to="/register">
              <Button variant="primary" size="large" icon="arrow-right">
                Join CleanStreet Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <FiHome className="footer-logo-icon" />
              CleanStreet
            </div>
            <p className="footer-tagline">
              Making cities cleaner, together.
            </p>
            <div className="footer-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
            <p className="copyright">
              &copy; {new Date().getFullYear()} CleanStreet Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;