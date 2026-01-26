import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CircularProgress, Box } from '@mui/material'

const ProtectedRoute = ({ children, adminOnly = false, volunteerOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin, isVolunteer } = useAuth()

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

  if (volunteerOnly && user?.role !== 'volunteer') {
    return <Navigate to="/volunteer/dashboard" replace />
  }

  // If a volunteer accesses a regular user route, redirect to volunteer dashboard
  if (isVolunteer && !adminOnly && !volunteerOnly) {
    return <Navigate to="/volunteer/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
