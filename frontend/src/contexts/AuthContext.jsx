import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

const API_BASE_URL = '/api'

// Create axios instance for auth with proper config
const authClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await authClient.get('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Regular login for citizens
  const login = async (email, password) => {
    try {
      const response = await authClient.post('/auth/login', {
        email,
        password
      })
      
      const userData = response.data.user
      setUser(userData)
      toast.success('Login successful!')
      
      // Redirect based on role
      switch (userData.role) {
        case 'admin':
        case 'super-admin':
          window.location.href = import.meta.env.VITE_ADMIN_URL || '/admin'
          break
        case 'volunteer':
          navigate('/volunteer/dashboard')
          break
        default: // citizen
          navigate('/dashboard')
      }
      
      return { success: true, user: userData }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Citizen registration
  const register = async (userData) => {
    try {
      const response = await authClient.post('/auth/register', userData)
      toast.success('Registration successful! Check your email for verification.')
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Volunteer registration
  const registerVolunteer = async (volunteerData) => {
    try {
      const response = await authClient.post('/volunteer/register', volunteerData)
      toast.success('Volunteer application submitted! Check your email for verification.')
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.error || 'Volunteer application failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Admin login
  const adminLogin = async (email, password) => {
    try {
      const response = await authClient.post('/admin/login', {
        email,
        password
      })

      const adminUser = response.data.user
      setUser(adminUser)
      toast.success('Admin login successful!')

      // Redirect based on host (subdomain vs path)
      const isAdminSubdomain = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')
      if (adminUser?.requiresPasswordChange) {
        navigate(isAdminSubdomain ? '/change-password' : '/admin/change-password')
      } else {
        // Verify session is active by checking auth status
        setTimeout(() => checkAuthStatus(), 500)
        navigate(isAdminSubdomain ? '/dashboard' : '/admin/dashboard')
      }

      return { success: true, user: adminUser }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Volunteer login (separate endpoint)
  const volunteerLogin = async (email, password) => {
    try {
      const response = await authClient.post('/volunteer/login', {
        email,
        password
      })

      const volunteerUser = response.data.user
      setUser(volunteerUser)
      toast.success('Volunteer login successful!')
      
      // Refresh auth status to ensure session is properly established
      await checkAuthStatus()
      
      navigate('/volunteer/dashboard')
      return { success: true, user: volunteerUser }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Email verification (works for both citizens and volunteers)
  const verifyEmail = async (email, otp, isVolunteer = false) => {
    try {
      const endpoint = isVolunteer ? '/volunteer/verify-email' : '/auth/verify-email'
      const response = await authClient.post(endpoint, {
        email,
        otp
      })
      
      setUser(response.data.user)
      toast.success('Email verified successfully!')
      
      // Redirect based on user type
      if (isVolunteer) {
        navigate('/volunteer/login')
      } else {
        navigate('/dashboard')
      }
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Verification failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await authClient.post('/auth/logout')
      setUser(null)
      
      // Redirect to appropriate login page based on current path
      const currentPath = window.location.pathname
      if (currentPath.includes('/admin')) {
        navigate('/admin/login')
      } else if (currentPath.includes('/volunteer')) {
        navigate('/volunteer/login')
      } else {
        navigate('/login')
      }
      
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await authClient.post('/auth/forgot-password', { email })
      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send reset email'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await authClient.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      })
      
      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Password reset failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const resendVerification = async (email, isVolunteer = false) => {
    try {
      const endpoint = isVolunteer ? '/volunteer/resend-verification' : '/auth/resend-verification'
      const response = await authClient.post(endpoint, { email })
      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to resend verification'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Update user profile (works for all roles)
  const updateProfile = async (profileData) => {
    try {
      const response = await authClient.put('/auth/profile', profileData)
      setUser(response.data.user)
      toast.success('Profile updated successfully')
      return { success: true, user: response.data.user }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Update volunteer profile (additional fields)
  const updateVolunteerProfile = async (volunteerData) => {
    try {
      const response = await authClient.put('/volunteer/profile', volunteerData)
      setUser(response.data.user)
      toast.success('Volunteer profile updated successfully')
      return { success: true, user: response.data.user }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update volunteer profile'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Check if volunteer is approved
  const isVolunteerApproved = () => {
    return user?.role === 'volunteer' && 
           user?.isActive && 
           user?.volunteerInfo?.status === 'approved'
  }

  // Check if volunteer application is pending
  const isVolunteerPending = () => {
    return user?.role === 'volunteer' && 
           !user?.isActive && 
           user?.volunteerInfo?.status === 'pending'
  }

  const value = {
    // State
    user,
    loading,
    
    // Authentication status
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super-admin',
    isSuperAdmin: user?.isSuperAdmin === true,
    isVolunteer: user?.role === 'volunteer',
    isCitizen: user?.role === 'citizen',
    isVolunteerApproved,
    isVolunteerPending,
    
    // Authentication methods
    login,
    adminLogin,
    volunteerLogin,
    register,
    registerVolunteer,
    verifyEmail,
    logout,
    forgotPassword,
    resetPassword,
    resendVerification,
    
    // Profile methods
    updateProfile,
    updateVolunteerProfile,
    
    // Utility
    refreshUser: checkAuthStatus,
    
    // Role-based redirect helper
    getDashboardPath: () => {
      if (!user) return '/login'
      
      switch (user.role) {
        case 'admin':
        case 'super-admin':
          return '/admin/dashboard'
        case 'volunteer':
          return '/volunteer/dashboard'
        default:
          return '/dashboard'
      }
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}