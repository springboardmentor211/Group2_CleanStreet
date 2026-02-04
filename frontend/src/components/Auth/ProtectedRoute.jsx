import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CircularProgress, Box } from '@mui/material'
import { getSubdomain } from '../../utils/subdomain'

const ProtectedRoute = ({ 
  children, 
  adminOnly = false, 
  allowedRoles = null,
  requireVolunteerVerified = false 
}) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth()
  const subdomain = getSubdomain()

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  // Check if volunteer verification is required
  if (requireVolunteerVerified && user?.role === 'volunteer') {
    // Only enforce verification check on volunteer subdomain
    if (subdomain === 'volunteer' && user?.volunteer_status !== 'active') {
      return <Navigate to="/verification-pending" replace />
    }
  }

  return children
}

export default ProtectedRoute