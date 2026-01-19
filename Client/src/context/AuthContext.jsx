import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Demo user data (replace with actual API calls)
  const demoUsers = {
    citizen: {
      id: 1,
      name: 'Demo Citizen',
      email: 'citizen@demo.com',
      role: 'citizen',
      location: 'Downtown District'
    },
    volunteer: {
      id: 2,
      name: 'Demo Volunteer',
      email: 'volunteer@demo.com',
      role: 'volunteer',
      location: 'City Center',
      assignedZone: 'Zone A'
    },
    admin: {
      id: 3,
      name: 'Demo Admin',
      email: 'admin@demo.com',
      role: 'admin',
      location: 'City Hall'
    }
  };

  // Simulate login
  const login = async (email, password, role) => {
    setLoading(true);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo: Check if demo user exists for this role
        const demoUser = demoUsers[role];
        if (demoUser && email.includes(role)) {
          setUser(demoUser);
          localStorage.setItem('user', JSON.stringify(demoUser));
          localStorage.setItem('token', 'demo-token-' + role);
          localStorage.setItem('role', role);
          resolve({ success: true, user: demoUser });
        } else {
          resolve({ success: false, error: 'Invalid credentials' });
        }
        setLoading(false);
      }, 1000);
    });
  };

  const register = async (userData) => {
    setLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Date.now(),
          ...userData,
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage for demo
        const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
        users.push(newUser);
        localStorage.setItem('demo_users', JSON.stringify(users));
        
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', 'demo-token-' + userData.role);
        localStorage.setItem('role', userData.role);
        
        setLoading(false);
        resolve({ success: true, user: newUser });
      }, 1500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    userRole: user?.role
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};