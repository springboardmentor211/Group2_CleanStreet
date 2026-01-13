import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiAlertCircle, FiUser, FiMail, FiPhone, FiMapPin, 
  FiLock, FiCheck, FiUserPlus, FiShield, FiUsers, FiGlobe 
} from 'react-icons/fi';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import '../styles/pages.css';

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
    role: 'citizen' // Default role
  });
  
  const [errors, setErrors] = useState({});

  const roles = [
    { 
      id: 'citizen', 
      label: 'Citizen', 
      icon: <FiUser />,
      description: 'Report issues and vote on community problems'
    },
    { 
      id: 'volunteer', 
      label: 'Volunteer', 
      icon: <FiUsers />,
      description: 'Help resolve issues and monitor progress'
    },
    { 
      id: 'admin', 
      label: 'Municipal Admin', 
      icon: <FiShield />,
      description: 'Manage complaints and generate reports'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <div className="register-page">
      {/* Header remains same... */}
      
      <main className="register-main">
        <div className="container">
          <div className="register-wrapper">
            <div className="register-card">
              <div className="register-header-content">
                <div className="logo-large">
                  <FiUserPlus />
                </div>
                <h1>Join CleanStreet</h1>
                <p className="text-muted">Create your account based on your role</p>
              </div>

              {errors.submit && (
                <div className="alert alert-error">
                  <FiAlertCircle /> {errors.submit}
                </div>
              )}

              <form className="register-form" onSubmit={handleSubmit}>
                {/* Role Selection */}
                <div className="form-section">
                  <h3>Select Your Role</h3>
                  <div className="role-selection">
                    {roles.map((role) => (
                      <label 
                        key={role.id}
                        className={`role-option ${formData.role === role.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.id}
                          checked={formData.role === role.id}
                          onChange={handleChange}
                          className="role-radio"
                        />
                        <div className="role-content">
                          <div className="role-icon">{role.icon}</div>
                          <div className="role-info">
                            <h4>{role.label}</h4>
                            <p>{role.description}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.role && <div className="error-message">{errors.role}</div>}
                </div>

                {/* Personal Information */}
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-grid">
                    <InputField
                      label="Full Name"
                      name="fullName"
                      icon="user"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      error={errors.fullName}
                      required
                    />

                    <InputField
                      label="Username"
                      name="username"
                      icon="user"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      error={errors.username}
                      required
                    />

                    <InputField
                      type="email"
                      label="Email"
                      name="email"
                      icon="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                    />

                    <InputField
                      type="tel"
                      label="Phone Number (Optional)"
                      name="phone"
                      icon="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />

                    {formData.role === 'volunteer' && (
                      <div className="form-full">
                        <InputField
                          label="Zone/Area of Operation"
                          name="zone"
                          icon="location"
                          placeholder="Enter your assigned zone (e.g., Zone A)"
                          value={formData.zone || ''}
                          onChange={handleChange}
                        />
                      </div>
                    )}

                    <InputField
                      label="Location"
                      name="location"
                      icon="location"
                      placeholder="Enter your city or district"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password Section */}
                <div className="form-section">
                  <h3>Security Information</h3>
                  <div className="form-grid">
                    <InputField
                      type="password"
                      label="Password"
                      name="password"
                      icon="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      required
                    />

                    <InputField
                      type="password"
                      label="Confirm Password"
                      name="confirmPassword"
                      icon="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      required
                    />
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="terms-agreement">
                  <label className="checkbox-label">
                    <input type="checkbox" required />
                    <span>
                      I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                      <Link to="/privacy">Privacy Policy</Link>
                    </span>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={loading}
                  fullWidth
                  icon="check"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="register-footer">
                <p className="text-center">
                  Already have an account?{' '}
                  <Link to="/login" className="login-link">
                    <FiUser /> Login here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

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

export default RegisterPage;