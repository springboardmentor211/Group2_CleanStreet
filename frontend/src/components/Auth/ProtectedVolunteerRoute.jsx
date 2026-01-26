import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CircularProgress, Box } from '@mui/material'

const ProtectedVolunteerRoute = ({ children }) => {
  const { user, loading, isVolunteerApproved } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/volunteer/login" />
  }

  if (user.role !== 'volunteer') {
    return <Navigate to="/dashboard" />
  }

  // Check if volunteer is approved (optional - depends on your requirements)
  if (!isVolunteerApproved && user.role === 'volunteer') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <h2>Approval Pending</h2>
        <p>Your volunteer application is pending admin approval.</p>
        <p>You'll be notified once approved.</p>
      </Box>
    )
  }

  return children
}

export default ProtectedVolunteerRoute