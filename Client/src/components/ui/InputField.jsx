import React from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiAlertCircle } from 'react-icons/fi';

const InputField = ({ 
  type = 'text', 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  icon, 
  error,
  required = false,
  extra,
  disabled = false
}) => {
  const getIcon = () => {
    switch(icon) {
      case 'email': return <FiMail className="input-icon" />;
      case 'password': return <FiLock className="input-icon" />;
      case 'user': return <FiUser className="input-icon" />;
      case 'phone': return <FiPhone className="input-icon" />;
      case 'location': return <FiMapPin className="input-icon" />;
      default: return null;
    }
  };

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'error' : ''}`}>
        {getIcon()}
        <input
          type={type}
          id={name}
          name={name}
          className="input-field"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        />
        {extra}
      </div>
      {error && (
        <div className="error-message">
          <FiAlertCircle /> {error}
        </div>
      )}
    </div>
  );
};

export default InputField;