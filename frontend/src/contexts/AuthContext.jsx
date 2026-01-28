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

  const login = async (email, password) => {
    try {
      const response = await authClient.post('/auth/login', {
        email,
        password
      })
      
      setUser(response.data.user)
      
      return { success: true, user: response.data.user }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      throw error
    }
  }

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

  const verifyEmail = async (email, otp) => {
    try {
      const response = await authClient.post('/auth/verify-email', {
        email,
        otp
      })
      
      setUser(response.data.user)
      toast.success('Email verified successfully!')
      
      navigate('/dashboard')
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
      navigate('/login')
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

  const resendVerification = async (email) => {
    try {
      const response = await authClient.post('/auth/resend-verification', { email })
      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to resend verification'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super-admin',
    isSuperAdmin: user?.isSuperAdmin === true,
    isVolunteer: user?.role === 'volunteer',
    login,
    adminLogin,
    register,
    verifyEmail,
    logout,
    forgotPassword,
    resetPassword,
    resendVerification,
    refreshUser: checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}