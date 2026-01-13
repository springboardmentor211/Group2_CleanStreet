import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHome, FiAlertCircle, FiEye, FiUser, FiLogOut, FiBell, 
  FiCheckCircle, FiClock, FiActivity, FiTrendingUp,
  FiMapPin, FiMessageSquare, FiThumbsUp, FiEdit2
} from 'react-icons/fi';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import '../styles/pages.css';

// Mock data
const userStats = {
  totalIssues: 12,
  pending: 4,
  inProgress: 5,
  resolved: 3
};

const recentActivity = [
  {
    id: 1,
    title: 'Pothole on Main Street resolved',
    time: '2 hours ago',
    type: 'resolved',
    icon: <FiCheckCircle />
  },
  {
    id: 2,
    title: 'New streetlight issue reported',
    time: '4 hours ago',
    type: 'reported',
    icon: <FiAlertCircle />
  },
  {
    id: 3,
    title: 'Garbage dump complaint updated',
    time: '6 hours ago',
    type: 'updated',
    icon: <FiEdit2 />
  },
  {
    id: 4,
    title: 'Water leak marked in progress',
    time: '1 day ago',
    type: 'progress',
    icon: <FiActivity />
  }
];

const userComplaints = [
  {
    id: 1,
    title: 'Large pothole on Main Street',
    description: 'Massive pothole causing traffic delays and vehicle damage',
    location: 'Main Street & Oak Avenue',
    status: 'resolved',
    votes: 15,
    comments: 3,
    time: '1 day ago'
  },
  {
    id: 2,
    title: 'Illegal garbage dump',
    description: 'Trash accumulation behind shopping center',
    location: 'Westfield Shopping Center',
    status: 'in_progress',
    votes: 8,
    comments: 2,
    time: '2 days ago'
  },
  {
    id: 3,
    title: 'Broken streetlight',
    description: 'Streetlight out for over a month - safety hazard',
    location: 'Pine Street & 2nd Avenue',
    status: 'pending',
    votes: 12,
    comments: 5,
    time: '3 days ago'
  }
];

const DashboardPage = () => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', icon: <FiClock />, text: 'Pending' },
      in_progress: { class: 'status-progress', icon: <FiActivity />, text: 'In Progress' },
      resolved: { class: 'status-resolved', icon: <FiCheckCircle />, text: 'Resolved' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-logo">
                <FiHome className="logo-icon" />
                CleanStreet
              </Link>
              <div className="nav-links">
                <Link to="/dashboard" className="nav-link active">
                  <FiHome /> Dashboard
                </Link>
                <Link to="/report" className="nav-link">
                  <FiAlertCircle /> Report Issue
                </Link>
                <Link to="/complaints" className="nav-link">
                  <FiEye /> View Complaints
                </Link>
                <Link to="/profile" className="nav-link">
                  <FiUser /> Profile
                </Link>
                <div className="notification-badge">
                  <FiBell />
                  <span className="badge-count">3</span>
                </div>
                <Button variant="secondary" icon="logout">
                  Logout
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {/* Welcome Section */}
          <div className="welcome-content">
  <h1>
    Welcome back, {user?.name}!
    <span className={`role-badge ${user?.role}`}>
      {user?.role === 'citizen' && <FiUser />}
      {user?.role === 'volunteer' && <FiUsers />}
      {user?.role === 'admin' && <FiShield />}
      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
    </span>
  </h1>
  <p className="text-muted">
    {user?.role === 'citizen' && 'Here\'s what\'s happening in your community'}
    {user?.role === 'volunteer' && 'Track your assigned issues and community impact'}
    {user?.role === 'admin' && 'Monitor system activity and manage complaints'}
  </p>
</div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard type="total" count={userStats.totalIssues} label="Total Issues" />
            <StatCard type="pending" count={userStats.pending} label="Pending" />
            <StatCard type="progress" count={userStats.inProgress} label="In Progress" />
            <StatCard type="resolved" count={userStats.resolved} label="Resolved" />
          </div>

          {/* Dashboard Content Grid */}
          <div className="dashboard-content">
            {/* Recent Activity */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>
                  <FiClock /> Recent Activity
                </h2>
                <Link to="/activity" className="view-all">View All</Link>
              </div>
              <div className="activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Complaints */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>
                  <FiAlertCircle /> Your Recent Complaints
                </h2>
                <Link to="/complaints" className="view-all">View All</Link>
              </div>
              <div className="complaints-list">
                {userComplaints.map(complaint => (
                  <div key={complaint.id} className="complaint-item">
                    <div className="complaint-header">
                      <h4>{complaint.title}</h4>
                      {getStatusBadge(complaint.status)}
                    </div>
                    <p className="complaint-desc">{complaint.description}</p>
                    <div className="complaint-meta">
                      <span className="meta-item">
                        <FiMapPin /> {complaint.location}
                      </span>
                      <span className="meta-item">
                        <FiThumbsUp /> {complaint.votes} votes
                      </span>
                      <span className="meta-item">
                        <FiMessageSquare /> {complaint.comments} comments
                      </span>
                      <span className="meta-item">
                        {complaint.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Impact */}
            <div className="dashboard-card full-width">
              <div className="card-header">
                <h2>
                  <FiTrendingUp /> Community Impact
                </h2>
              </div>
              <div className="impact-content">
                <div className="impact-stats">
                  <div className="impact-stat">
                    <h3>0</h3>
                    <p>Issues resolved this month</p>
                  </div>
                  <div className="impact-stat">
                    <h3>24</h3>
                    <p>Active community members</p>
                  </div>
                  <div className="impact-stat">
                    <h3>85%</h3>
                    <p>Issue resolution rate</p>
                  </div>
                </div>
                <div className="impact-message">
                  <p>
                    Thanks to citizen reports and community engagement, 
                    we've resolved {userStats.resolved} issues this month, 
                    making our city cleaner and safer for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
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

export default DashboardPage;