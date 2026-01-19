import React from 'react';
import { FiAlertTriangle, FiClock, FiActivity, FiCheckCircle } from 'react-icons/fi';

const StatCard = ({ type, count, label }) => {
  const getIcon = () => {
    switch(type) {
      case 'total': return <FiAlertTriangle className="stat-icon total" />;
      case 'pending': return <FiClock className="stat-icon pending" />;
      case 'progress': return <FiActivity className="stat-icon progress" />;
      case 'resolved': return <FiCheckCircle className="stat-icon resolved" />;
      default: return <FiAlertTriangle />;
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-header">
        {getIcon()}
        <div className="stat-content">
          <h3>{count}</h3>
          <p>{label}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;