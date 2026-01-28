// import React, { useState } from 'react'
// import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress, Link } from '@mui/material'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../../contexts/AuthContext'
// import toast from 'react-hot-toast'

// const Login = () => {
//   const navigate = useNavigate()
//   const { login } = useAuth()
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   })

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     try {
//       await login(formData.email, formData.password)
//       toast.success('Login successful!')
//       navigate('/volunteer/dashboard')
//     } catch (err) {
//       setError(err.response?.data?.error || 'Login failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Container maxWidth="sm" sx={{ py: 8 }}>
//       <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
//         <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
//           Volunteer Login
//         </Typography>
//         <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
//           Sign in to access your volunteer dashboard
//         </Typography>

//         {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//         <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//           <TextField
//             label="Email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             fullWidth
//           />
//           <TextField
//             label="Password"
//             name="password"
//             type="password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             fullWidth
//           />

//           <Button type="submit" variant="contained" size="large" disabled={loading}>
//             {loading ? <CircularProgress size={24} /> : 'Login'}
//           </Button>

//           <Box sx={{ textAlign: 'center', mt: 2 }}>
//             <Typography variant="body2">
//               Don't have an account?{' '}
//               <Link 
//                 onClick={() => navigate('/register')}
//                 sx={{ cursor: 'pointer', fontWeight: 600, color: 'primary.main' }}
//               >
//                 Join as a Volunteer
//               </Link>
//             </Typography>
//           </Box>
//         </Box>
//       </Paper>
//     </Container>
//   )
// }

// export default Login



import React, { useState } from 'react'
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress, 
  Link,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Helmet } from 'react-helmet';

// ... rest of the code remains the same
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear field-specific error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }
    
    setError('')
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password, rememberMe)
      
      if (result.success) {
        toast.success('Login successful! Welcome back!')
        // On volunteer subdomain, use /dashboard not /volunteer/dashboard
        navigate('/dashboard')
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message ||
                          err.message || 
                          'Login failed. Please check your credentials and try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Volunteer Login | VolunteerHub</title>
        <meta name="description" content="Login to access your volunteer dashboard and manage your activities." />
      </Helmet>
      
      <Container maxWidth="sm" sx={{ 
        py: { xs: 4, md: 8 },
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Paper elevation={0} sx={{ 
          p: { xs: 3, sm: 4 }, 
          borderRadius: 3, 
          border: '1px solid #e0e0e0',
          width: '100%'
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Volunteer Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access your volunteer dashboard
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
            noValidate
          >
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              fullWidth
              autoComplete="email"
              aria-label="Email address"
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              autoFocus
            />

            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              fullWidth
              autoComplete="current-password"
              aria-label="Password"
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 1
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    size="small"
                  />
                }
                label="Remember me"
              />
              <Link 
                onClick={() => !loading && navigate('/forgot-password')}
                sx={{ 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 500, 
                  fontSize: '0.875rem',
                  color: loading ? 'text.disabled' : 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={loading}
              sx={{ 
                mt: 2, 
                py: 1.5,
                position: 'relative'
              }}
            >
              {loading ? (
                <>
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      position: 'absolute',
                      left: '50%',
                      marginLeft: '-12px'
                    }} 
                  />
                  <span style={{ opacity: 0 }}>Login</span>
                </>
              ) : 'Login'}
            </Button>

            <Box sx={{ 
              textAlign: 'center', 
              mt: 3, 
              pt: 3, 
              borderTop: '1px solid #e0e0e0' 
            }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  onClick={() => !loading && navigate('/register')}
                  sx={{ 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 600, 
                    color: loading ? 'text.disabled' : 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Join as a Volunteer
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export default Login