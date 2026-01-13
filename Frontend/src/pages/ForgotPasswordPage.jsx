import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiMail, FiCheckCircle, FiArrowLeft, FiLock } from 'react-icons/fi';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import '../styles/pages.css';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setMessage('Verification code sent to your email');
    }, 1500);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      if (code === '123456') { // Demo code
        setStep(3);
        setMessage('Code verified! Set your new password');
      } else {
        setMessage('Invalid verification code');
      }
    }, 1500);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    // Simulate password reset
    setTimeout(() => {
      setLoading(false);
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    }, 1500);
  };

  return (
    <div className="forgot-password-page">
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
                <Link to="/login" className="nav-link">
                  <FiArrowLeft /> Back to Login
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="forgot-password-main">
        <div className="container">
          <div className="forgot-password-wrapper">
            <div className="forgot-password-card">
              <div className="forgot-password-header">
                <div className="password-icon">
                  <FiLock />
                </div>
                <h1>Reset Your Password</h1>
                <p className="text-muted">
                  {step === 1 && 'Enter your email to receive a verification code'}
                  {step === 2 && 'Enter the 6-digit code sent to your email'}
                  {step === 3 && 'Create your new password'}
                </p>
              </div>

              {message && (
                <div className={`alert ${step === 3 ? 'alert-success' : 'alert-info'}`}>
                  <FiCheckCircle /> {message}
                </div>
              )}

              {/* Step 1: Email Input */}
              {step === 1 && (
                <form className="forgot-password-form" onSubmit={handleSendCode}>
                  <InputField
                    type="email"
                    label="Email Address"
                    name="email"
                    icon="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  
                  <Button 
                    type="submit" 
                    variant="primary" 
                    loading={loading}
                    fullWidth
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </form>
              )}

              {/* Step 2: Code Verification */}
              {step === 2 && (
                <form className="forgot-password-form" onSubmit={handleVerifyCode}>
                  <div className="code-input-group">
                    <label className="input-label">Verification Code</label>
                    <div className="code-inputs">
                      {[...Array(6)].map((_, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          className="code-input"
                          value={code[index] || ''}
                          onChange={(e) => {
                            const newCode = code.split('');
                            newCode[index] = e.target.value;
                            setCode(newCode.join(''));
                            
                            // Auto-focus next input
                            if (e.target.value && index < 5) {
                              document.querySelectorAll('.code-input')[index + 1]?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            // Allow navigation with arrow keys
                            if (e.key === 'ArrowLeft' && index > 0) {
                              document.querySelectorAll('.code-input')[index - 1]?.focus();
                            }
                            if (e.key === 'ArrowRight' && index < 5) {
                              document.querySelectorAll('.code-input')[index + 1]?.focus();
                            }
                            // Handle backspace
                            if (e.key === 'Backspace' && !code[index] && index > 0) {
                              document.querySelectorAll('.code-input')[index - 1]?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                    <p className="code-hint">Enter the 6-digit code sent to {email}</p>
                  </div>
                  
                  <div className="button-group">
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={() => setStep(1)}
                      fullWidth
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      loading={loading}
                      fullWidth
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </Button>
                  </div>
                  
                  <div className="resend-code">
                    <p className="text-center">
                      Didn't receive the code?{' '}
                      <button 
                        type="button" 
                        className="resend-link"
                        onClick={handleSendCode}
                      >
                        Resend Code
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form className="forgot-password-form" onSubmit={handleResetPassword}>
                  <InputField
                    type="password"
                    label="New Password"
                    name="newPassword"
                    icon="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  
                  <InputField
                    type="password"
                    label="Confirm New Password"
                    name="confirmPassword"
                    icon="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  
                  <div className="button-group">
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={() => setStep(2)}
                      fullWidth
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      loading={loading}
                      fullWidth
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </div>
                </form>
              )}

              <div className="forgot-password-footer">
                <p className="text-center">
                  Remember your password?{' '}
                  <Link to="/login" className="login-link">
                    Back to Login
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
            &copy; {new Date().getFullYear()} CleanStreet Project
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;