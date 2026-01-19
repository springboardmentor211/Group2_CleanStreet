import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHome, FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, 
  FiLock, FiGlobe, FiBell, FiShield, FiSave, FiCamera,
  FiCalendar, FiCheckCircle, FiLogOut
} from 'react-icons/fi';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import '../styles/pages.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: 'Demo User',
    username: 'demo_user',
    email: 'demo@cleanstreet.com',
    phone: '+1-555-123-4567',
    location: 'Downtown District',
    bio: 'Active citizen helping to improve our community through CleanStreet reporting',
    memberSince: '7/3/2025'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    // Save logic here
    setEditing(false);
    console.log('Profile saved:', profileData);
  };

  const handleSaveSecurity = () => {
    // Security save logic
    console.log('Security updated:', securityData);
    setSecurityData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
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
                  Report Issue
                </Link>
                <Link to="/profile" className="nav-link active">
                  <FiUser /> Profile
                </Link>
                <Button variant="secondary" icon="logout">
                  Logout
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="profile-main">
        <div className="container">
          <div className="profile-wrapper">
            {/* Sidebar */}
            <div className="profile-sidebar">
              <div className="profile-summary">
                <div className="profile-avatar">
                  <div className="avatar-large">DU</div>
                  <button className="avatar-edit">
                    <FiCamera />
                  </button>
                </div>
                <div className="profile-info">
                  <h3>{profileData.fullName}</h3>
                  <p className="username">@{profileData.username}</p>
                  <p className="user-role">
                    <FiUser /> Citizen
                  </p>
                  <p className="member-since">
                    <FiCalendar /> Member since {profileData.memberSince}
                  </p>
                </div>
              </div>

              <nav className="profile-nav">
                <button 
                  className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <FiUser /> Account Information
                </button>
                <button 
                  className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <FiLock /> Security Settings
                </button>
                <button 
                  className={`profile-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
                  onClick={() => setActiveTab('privacy')}
                >
                  <FiShield /> Privacy Settings
                </button>
                <button 
                  className={`profile-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <FiBell /> Notifications
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="profile-content">
              {activeTab === 'profile' && (
                <div className="profile-tab">
                  <div className="tab-header">
                    <h2>
                      <FiUser /> Account Information
                    </h2>
                    <p className="text-muted">Update your personal details</p>
                    <Button 
                      variant={editing ? 'primary' : 'secondary'}
                      icon={editing ? 'save' : 'edit'}
                      onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                    >
                      {editing ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                  </div>

                  <div className="profile-form">
                    <div className="form-section">
                      <h3>Personal Information</h3>
                      <div className="form-grid">
                        <InputField
                          label="Full Name"
                          name="fullName"
                          icon="user"
                          value={profileData.fullName}
                          onChange={handleProfileChange}
                          disabled={!editing}
                        />
                        <InputField
                          label="Username"
                          name="username"
                          icon="user"
                          value={profileData.username}
                          onChange={handleProfileChange}
                          disabled={!editing}
                        />
                        <InputField
                          type="email"
                          label="Email"
                          name="email"
                          icon="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          disabled={!editing}
                        />
                        <InputField
                          label="Phone Number"
                          name="phone"
                          icon="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          disabled={!editing}
                        />
                        <InputField
                          label="Location"
                          name="location"
                          icon="location"
                          value={profileData.location}
                          onChange={handleProfileChange}
                          disabled={!editing}
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Bio</h3>
                      <div className="textarea-group">
                        <label className="input-label">About You</label>
                        <textarea
                          className="textarea-field"
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          disabled={!editing}
                          rows="4"
                        />
                      </div>
                    </div>

                    {editing && (
                      <div className="form-actions">
                        <Button variant="secondary" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                        <Button variant="primary" icon="save" onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="profile-tab">
                  <div className="tab-header">
                    <h2>
                      <FiLock /> Security Settings
                    </h2>
                    <p className="text-muted">Manage your account security and privacy</p>
                  </div>

                  <div className="profile-form">
                    <div className="form-section">
                      <h3>Change Password</h3>
                      <div className="form-grid">
                        <InputField
                          type="password"
                          label="Current Password"
                          name="currentPassword"
                          icon="password"
                          value={securityData.currentPassword}
                          onChange={handleSecurityChange}
                        />
                        <InputField
                          type="password"
                          label="New Password"
                          name="newPassword"
                          icon="password"
                          value={securityData.newPassword}
                          onChange={handleSecurityChange}
                        />
                        <InputField
                          type="password"
                          label="Confirm New Password"
                          name="confirmPassword"
                          icon="password"
                          value={securityData.confirmPassword}
                          onChange={handleSecurityChange}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <Button variant="primary" icon="save" onClick={handleSaveSecurity}>
                        Update Password
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="profile-tab">
                  <div className="tab-header">
                    <h2>
                      <FiShield /> Privacy Settings
                    </h2>
                    <p className="text-muted">Control your privacy preferences</p>
                  </div>

                  <div className="privacy-settings">
                    <div className="privacy-item">
                      <div className="privacy-info">
                        <h4>Profile Visibility</h4>
                        <p>Control who can see your profile and activity</p>
                      </div>
                      <select className="privacy-select">
                        <option>Public</option>
                        <option>Community Only</option>
                        <option>Private</option>
                      </select>
                    </div>

                    <div className="privacy-item">
                      <div className="privacy-info">
                        <h4>Email Notifications</h4>
                        <p>Receive email updates about your reports</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="privacy-item">
                      <div className="privacy-info">
                        <h4>Show Location on Reports</h4>
                        <p>Display your approximate location on public reports</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="profile-footer">
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

export default ProfilePage;