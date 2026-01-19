import React from 'react';
import { FiArrowRight, FiPlus, FiEdit2, FiLogOut, FiCheck, FiSave, FiUser, FiLock, FiShield, FiBell } from 'react-icons/fi';

const Button = ({ 
  children, 
  variant = 'primary', 
  icon, 
  loading = false, 
  disabled = false,
  fullWidth = false,
  size = 'medium',
  ...props 
}) => {
  const getIcon = () => {
    if (loading) return <span className="spinner"></span>;
    switch(icon) {
      case 'arrow-right': return <FiArrowRight />;
      case 'plus': return <FiPlus />;
      case 'edit': return <FiEdit2 />;
      case 'logout': return <FiLogOut />;
      case 'check': return <FiCheck />;
      case 'save': return <FiSave />;
      case 'user': return <FiUser />;
      case 'lock': return <FiLock />;
      case 'shield': return <FiShield />;
      case 'bell': return <FiBell />;
      default: return null;
    }
  };

  const sizeClass = {
    small: 'py-2 px-4 text-sm',
    medium: 'py-3 px-6',
    large: 'py-4 px-8 text-lg'
  };

  return (
    <button 
      className={`btn btn-${variant} ${fullWidth ? 'full-width' : ''} ${sizeClass[size] || sizeClass.medium}`}
      disabled={disabled || loading}
      {...props}
    >
      {getIcon()}
      <span>{children}</span>
    </button>
  );
};

export default Button;