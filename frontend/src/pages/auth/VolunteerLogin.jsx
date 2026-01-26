import React, { useState } from 'react'
import {
  Container, Paper, TextField, Button, Typography, Box,
  Alert, CircularProgress, Divider, Fade, Zoom, Grow,
  InputAdornment, alpha, useTheme, Link as MuiLink,
  FormControlLabel, Checkbox
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  VolunteerActivism as VolunteerIcon,
  Shield as ShieldIcon,
  WorkspacePremium as PremiumIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { keyframes } from '@emotion/react'

// Animation keyframes
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`

const shimmerAnimation = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`

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
  email: yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
})

const VolunteerLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const { volunteerLogin } = useAuth()
  const theme = useTheme()

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid },
    watch
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange'
  })

  const email = watch('email', '')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    
    try {
      const result = await volunteerLogin(data.email, data.password)
      if (!result.success) {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password', { state: { email, fromVolunteer: true } })
  }

  const volunteerBenefits = [
    {
      icon: <ShieldIcon />,
      title: 'Verified Access',
      description: 'Approved volunteers get special access to community issues',
      color: '#4CAF50'
    },
    {
      icon: <VolunteerIcon />,
      title: 'Community Impact',
      description: 'Directly contribute to cleaner streets in your area',
      color: '#2196F3'
    },
    {
      icon: <PremiumIcon />,
      title: 'Priority Access',
      description: 'Get assigned to issues and track resolution progress',
      color: '#9C27B0'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ 
      mt: { xs: 2, md: 4 }, 
      mb: 8,
      animation: `${fadeInUp} 0.8s ease-out`
    }}>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 6,
        alignItems: 'center'
      }}>
        {/* Left Side - Form */}
        <Zoom in timeout={800}>
          <Paper elevation={0} sx={{ 
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Animated background elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(76, 175, 80, 0.08) 0%, rgba(33, 150, 243, 0.08) 100%)',
                zIndex: 0,
                animation: `${floatAnimation} 6s ease-in-out infinite`
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Grow in timeout={1000}>
                  <Box>
                    <VolunteerIcon sx={{ 
                      fontSize: 64, 
                      color: '#4CAF50',
                      mb: 2,
                      animation: `${floatAnimation} 4s ease-in-out infinite`
                    }} />
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}
                    >
                      Volunteer Login
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Access your volunteer dashboard
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
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      backdropFilter: 'blur(10px)'
                    }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: 'grid', gap: 2.5 }}>
                  {/* Email Field */}
                  <Grow in timeout={1200} style={{ transitionDelay: '200ms' }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      {...register('email')}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={loading}
                      autoComplete="email"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'text.secondary', opacity: 0.7 }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover fieldset': {
                            borderColor: '#4CAF50',
                            borderWidth: 2
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4CAF50',
                            boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)'
                          }
                        }
                      }}
                    />
                  </Grow>

                  {/* Password Field */}
                  <Grow in timeout={1200} style={{ transitionDelay: '300ms' }}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      {...register('password')}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      disabled={loading}
                      autoComplete="current-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'text.secondary', opacity: 0.7 }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover fieldset': {
                            borderColor: '#4CAF50',
                            borderWidth: 2
                          }
                        }
                      }}
                    />
                  </Grow>

                  {/* Remember Me & Forgot Password */}
                  <Grow in timeout={1400} style={{ transitionDelay: '400ms' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            color="primary"
                            sx={{
                              '&.Mui-checked': {
                                color: '#4CAF50',
                              }
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" color="text.secondary">
                            Remember me
                          </Typography>
                        }
                      />
                      <MuiLink
                        component="button"
                        type="button"
                        onClick={handleForgotPassword}
                        variant="body2"
                        sx={{ 
                          color: '#2196F3',
                          fontWeight: 600,
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        Forgot password?
                      </MuiLink>
                    </Box>
                  </Grow>

                  {/* Submit Button */}
                  <Grow in timeout={1600} style={{ transitionDelay: '500ms' }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading || !isValid}
                      startIcon={<LoginIcon />}
                      sx={{ 
                        mt: 1,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.9)} 0%, ${alpha('#2196F3', 0.9)} 100%)`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          animation: `${shimmerAnimation} 3s infinite`,
                        },
                        '&:hover': {
                          background: `linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)`,
                          transform: 'translateY(-3px)',
                          boxShadow: '0 15px 30px rgba(76, 175, 80, 0.4)'
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {loading ? (
                        <CircularProgress 
                          size={24} 
                          sx={{ color: 'white' }} 
                        />
                      ) : (
                        'Login as Volunteer'
                      )}
                    </Button>
                  </Grow>
                </Box>
              </form>

              {/* Alternative Login Options */}
              <Fade in timeout={1800}>
                <Box>
                  <Divider sx={{ my: 3 }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        px: 2,
                        bgcolor: 'background.paper',
                        fontWeight: 500
                      }}
                    >
                      Not a volunteer?
                    </Typography>
                  </Divider>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      component={Link}
                      to="/login"
                      variant="outlined"
                      startIcon={<PersonIcon />}
                      sx={{
                        py: 1,
                        borderRadius: 2,
                        borderColor: alpha(theme.palette.divider, 0.3),
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.04)
                        }
                      }}
                    >
                      Login as Citizen
                    </Button>

                    <Button
                      component={Link}
                      to="/admin/login"
                      variant="outlined"
                      startIcon={<ShieldIcon />}
                      sx={{
                        py: 1,
                        borderRadius: 2,
                        borderColor: alpha(theme.palette.divider, 0.3),
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: theme.palette.warning.main,
                          bgcolor: alpha(theme.palette.warning.main, 0.04)
                        }
                      }}
                    >
                      Login as Admin
                    </Button>

                    <Button
                      component={Link}
                      to="/volunteer/register"
                      variant="text"
                      sx={{
                        py: 1,
                        borderRadius: 2,
                        fontWeight: 600,
                        color: '#4CAF50',
                        '&:hover': {
                          bgcolor: alpha('#4CAF50', 0.08)
                        }
                      }}
                    >
                      Apply to become a volunteer
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Box>
          </Paper>
        </Zoom>

        {/* Right Side - Volunteer Benefits */}
        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}
              >
                Volunteer Dashboard Access
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 3, mb: 4 }}>
                {volunteerBenefits.map((benefit, index) => (
                  <Grow in timeout={1200} key={index} style={{ transitionDelay: `${index * 200}ms` }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,255,0.9) 100%)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(10px)',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                          borderColor: alpha(benefit.color, 0.3)
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${alpha(benefit.color, 0.1)} 0%, ${alpha(benefit.color, 0.2)} 100%)`,
                          color: benefit.color
                        }}
                      >
                        {benefit.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {benefit.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grow>
                ))}
              </Box>

              {/* Volunteer Stats */}
              <Fade in timeout={2000}>
                <Paper sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
                  border: `1px solid ${alpha('#4CAF50', 0.1)}`
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#4CAF50' }}>
                    Volunteer Impact
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    {[
                      { value: '5K+', label: 'Issues Resolved' },
                      { value: '500+', label: 'Active Volunteers' },
                      { value: '95%', label: 'Satisfaction Rate' }
                    ].map((stat, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#4CAF50' }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Fade>

              {/* Important Note */}
              <Fade in timeout={2200}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 4,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'info.light',
                    bgcolor: alpha(theme.palette.info.main, 0.05)
                  }}
                >
                  <Typography variant="body2">
                    <strong>Note:</strong> Only approved volunteers can login. 
                    If your application is pending, you'll receive an email once approved.
                  </Typography>
                </Alert>
              </Fade>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Container>
  )
}

export default VolunteerLogin