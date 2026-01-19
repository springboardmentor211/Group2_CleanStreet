import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiAlertCircle, FiEye, FiEyeOff, FiUserPlus, 
  FiMail, FiLock, FiArrowRight, FiUser  // Added FiUser here
} from 'react-icons/fi';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';  // Added useAuth import
import '../styles/pages.css';

const LoginPage = () => {
  const { login, loading } = useAuth();  // Use AuthContext
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'citizen'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const result = await login(formData.email, formData.password, formData.role);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div className="container">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-logo">
                <FiHome className="logo-icon" />
                CleanStreet
              </Link>
              <div className="nav-links">
                <Link to="/dashboard" className="nav-link">
                  <FiHome /> Dashboard
                </Link>
                <Link to="/report" className="nav-link">
                  <FiAlertCircle /> Report Issue
                </Link>
                <Link to="/login" className="nav-link active">
                  Login
                </Link>
                <Link to="/register" className="btn btn-secondary">
                  <FiUserPlus /> Register
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="container">
          <div className="login-wrapper">
            <div className="login-card">
              {/* Logo/Header */}
              <div className="login-header-content">
                <div className="logo-large">
                  <FiHome />
                </div>
                <h1>Login to CleanStreet</h1>
                <p className="text-muted">Enter your credentials to access your account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-error">
                  <FiAlertCircle /> {error}
                </div>
              )}

              {/* Login Form */}
              <form className="login-form" onSubmit={handleSubmit}>
                <InputField
                  type="email"
                  label="Email"
                  name="email"
                  icon="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <InputField
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  name="password"
                  icon="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  extra={
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  }
                />

                {/* Role Selection Dropdown */}
                <div className="input-group">
                  <label htmlFor="role" className="input-label">Login As</label>
                  <div className="role-dropdown-wrapper">
                    <FiUser className="input-icon" />
                    <select
                      id="role"
                      name="role"
                      className="input-field role-dropdown"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="citizen">Citizen</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="admin">Municipal Admin</option>
                    </select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={loading}
                  fullWidth
                  icon="arrow-right"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              {/* Forgot Password Link */}
              <div className="forgot-password-link">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot your password?
                </Link>
              </div>

              {/* Divider */}
              <div className="divider">
                <span>or</span>
              </div>

              {/* Footer Links */}
              <div className="login-footer">
                <p className="text-center">
                  Don't have an account?{' '}
                  <Link to="/register" className="register-link">
                    <FiUserPlus /> Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer-section">
        <div className="container">
          <p className="text-center">
            <FiHome className="footer-icon" />
            &copy; {new Date().getFullYear()} CleanStreet Project. Making cities cleaner, together.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;