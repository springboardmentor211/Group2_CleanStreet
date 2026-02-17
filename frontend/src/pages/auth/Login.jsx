import React, { useState } from 'react'
import { 
  Container, Paper, TextField, Button, Typography, Box,
  Alert, CircularProgress, Divider, Fade, Zoom, Grow,
  InputAdornment, IconButton, alpha, useTheme
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { keyframes } from '@emotion/react'

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const loginSchema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
})

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const theme = useTheme()

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid } 
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    
    const result = await login(data.email, data.password)
    if (!result.success) {
      setError(result.error || 'Invalid email or password. Please try again.')
    }
    
    setLoading(false)
  }

  const handleGoogleLogin = () => {
    setGoogleLoading(true)
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Container maxWidth="sm" sx={{ 
      mt: { xs: 4, md: 8 }, 
      mb: 8,
      animation: `${fadeInUp} 0.6s ease-out`
    }}>
      <Zoom in timeout={800}>
        <Paper elevation={0} sx={{ 
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
              zIndex: 0
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(33, 150, 243, 0.05) 100%)',
              zIndex: 0
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Grow in timeout={1000}>
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Sign in to continue making your community better
                  </Typography>
                </Box>
              </Grow>
            </Box>

            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'error.light',
                    bgcolor: alpha(theme.palette.error.main, 0.05)
                  }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Google Login Button */}
            <Grow in timeout={1200} style={{ transitionDelay: '200ms' }}>
              <Box sx={{ mb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: alpha(theme.palette.divider, 0.3),
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: '#DB4437',
                      bgcolor: alpha('#DB4437', 0.05),
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {googleLoading ? <CircularProgress size={20} /> : 'Continue with Google'}
                </Button>
              </Box>
            </Grow>

            <Divider sx={{ mb: 4 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  px: 2,
                  bgcolor: 'background.paper'
                }}
              >
                Or continue with email
              </Typography>
            </Divider>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grow in timeout={1400} style={{ transitionDelay: '300ms' }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  margin="normal"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={loading}
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                />
              </Grow>
              
              <Grow in timeout={1400} style={{ transitionDelay: '400ms' }}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                />
              </Grow>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 2, 
                mb: 3 
              }}>
                <Typography variant="body2" color="text.secondary">
                  <Link 
                    to="/register"
                    style={{ 
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Need an account?
                  </Link>
                </Typography>
                <Link 
                  to="/forgot-password"
                  style={{ 
                    textDecoration: 'none',
                    color: theme.palette.primary.main,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>
              
              <Grow in timeout={1600} style={{ transitionDelay: '500ms' }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !isValid}
                  sx={{ 
                    mt: 2, 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #cccccc 0%, #aaaaaa 100%)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? (
                    <CircularProgress 
                      size={24} 
                      sx={{ color: 'white' }} 
                    />
                  ) : (
                    'Sign In to Your Account'
                  )}
                </Button>
              </Grow>
            </form>

            {/* Security Note */}
            <Fade in timeout={1800}>
              <Box sx={{ 
                mt: 4, 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                textAlign: 'center'
              }}>
                <Typography variant="caption" color="text.secondary">
                  🔒 Your data is protected with end-to-end encryption
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Paper>
      </Zoom>

      {/* Benefits Section */}
      <Fade in timeout={2000}>
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Why join Clean Street?
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: 3,
            mt: 2
          }}>
            {[
              'Real-time issue tracking',
              'Community collaboration',
              'Government accountability',
              'Cleaner neighborhoods'
            ].map((item, index) => (
              <Box 
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 20,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Fade>
    </Container>
  )
}

export default Login