import React, { useState, useEffect } from 'react'
import { 
  Container, Paper, TextField, Button, Typography, Box,
  Alert, CircularProgress, Link
} from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required')
})

const AdminLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [systemStatus, setSystemStatus] = useState(null)
  const navigate = useNavigate()

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: yupResolver(loginSchema)
  })

  const { adminLogin } = useAuth()

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/system/status')
        setSystemStatus(response.data.system)
      } catch (error) {
        console.log('System status check failed')
      }
    }
    checkSystemStatus()
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    
    try {
      const result = await adminLogin(data.email, data.password)
      if (!result.success) {
        throw new Error(result.error || 'Login failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" color="primary" gutterBottom>
            Admin Portal
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Clean Street Administration System
          </Typography>
        </Box>

        {systemStatus?.setupRequired && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" href="/setup">
                Setup
              </Button>
            }
          >
            No super administrator found. Please run the setup wizard first.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Admin Email"
            type="email"
            margin="normal"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={loading}
            autoComplete="email"
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={loading}
            autoComplete="current-password"
          />
          
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login as Admin'}
          </Button>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Regular user?{' '}
            <Link 
              href="/login" 
              underline="hover"
              sx={{ color: 'primary.main', fontWeight: 500 }}
            >
              Go to User Login
            </Link>
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Restricted access. Authorized personnel only.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default AdminLogin