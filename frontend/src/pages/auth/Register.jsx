import React, { useState } from 'react'
import {
  Container, Paper, TextField, Button, Typography, Box,
  Alert, CircularProgress, Divider, Fade, Zoom, Grow,
  InputAdornment, alpha, useTheme, FormControlLabel, Checkbox
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import PhoneIcon from '@mui/icons-material/Phone'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ShieldIcon from '@mui/icons-material/Shield'
import GroupsIcon from '@mui/icons-material/Groups'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { keyframes } from '@emotion/react'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'

// Animation keyframes
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

const shimmerAnimation = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const registerSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
  email: yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  phone: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .optional()
})

const Register = () => {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const theme = useTheme()

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid },
    watch,
    trigger
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange'
  })

  const password = watch('password', '')

  // Calculate password strength
  React.useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    setPasswordStrength(strength)
  }, [password])

  const getPasswordStrengthColor = () => {
    const colors = [
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.success.main
    ]
    return colors[passwordStrength] || theme.palette.grey[500]
  }

  const getPasswordStrengthText = () => {
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    return texts[passwordStrength] || 'Very Weak'
  }

  const onSubmit = async (data) => {
    if (!acceptedTerms) {
      setError('Please accept the Terms & Conditions and Privacy Policy')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await registerUser(data)
      if (result.success) {
        setSuccess('✅ Registration successful! Redirecting to email verification...')
        // Redirect to verify email page
        setTimeout(() => navigate('/verify-email', { state: { email: data.email } }), 2000)
      } else {
        setError(result.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = () => {
    setGoogleLoading(true)
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

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
            boxShadow: '0 25px 75px rgba(0,0,0,0.1)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Animated background elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                zIndex: 0,
                animation: `${floatAnimation} 6s ease-in-out infinite`
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(76, 201, 240, 0.08) 0%, rgba(76, 175, 80, 0.08) 100%)',
                zIndex: 0,
                animation: `${floatAnimation} 7s ease-in-out infinite`
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Grow in timeout={1000}>
                  <Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}
                    >
                      Join Our Community
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Start your journey to cleaner streets today
                    </Typography>
                  </Box>
                </Grow>
                <Button
                  component={Link}
                  to="/volunteer/register"
                  variant="contained"
                  color="success"
                  startIcon={<VolunteerActivismIcon />}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
                  }}
                >
                  Become a Volunteer
                </Button>
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

              {success && (
                <Fade in>
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'success.light',
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {success}
                  </Alert>
                </Fade>
              )}

              {/* Google Button */}
              <Grow in timeout={1200} style={{ transitionDelay: '200ms' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleRegister}
                  disabled={googleLoading || loading}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 3,
                    borderColor: alpha(theme.palette.divider, 0.3),
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#DB4437',
                      bgcolor: alpha('#DB4437', 0.04),
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(219, 68, 55, 0.15)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {googleLoading ? <CircularProgress size={20} /> : 'Continue with Google'}
                </Button>
              </Grow>

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
                  or register with email
                </Typography>
              </Divider>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: 'grid', gap: 2.5 }}>
                  {/* Name Field */}
                  <Grow in timeout={1400} style={{ transitionDelay: '300ms' }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      {...register('name')}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={loading}
                      autoComplete="name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: 'text.secondary', opacity: 0.7 }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 2
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                          }
                        }
                      }}
                    />
                  </Grow>

                  {/* Email Field */}
                  <Grow in timeout={1400} style={{ transitionDelay: '400ms' }}>
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
                            borderColor: 'primary.main',
                            borderWidth: 2
                          }
                        }
                      }}
                    />
                  </Grow>

                  {/* Phone Field */}
                  <Grow in timeout={1400} style={{ transitionDelay: '500ms' }}>
                    <TextField
                      fullWidth
                      label="Phone Number (Optional)"
                      {...register('phone')}
                      error={!!errors.phone}
                      helperText={errors.phone?.message || '10 digits without spaces'}
                      disabled={loading}
                      autoComplete="tel"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: 'text.secondary', opacity: 0.7 }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 2
                          }
                        }
                      }}
                    />
                  </Grow>

                  {/* Password Field with Strength Indicator */}
                  <Grow in timeout={1400} style={{ transitionDelay: '600ms' }}>
                    <Box>
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        disabled={loading}
                        autoComplete="new-password"
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
                              borderColor: 'primary.main',
                              borderWidth: 2
                            }
                          }
                        }}
                      />
                      {password && (
                        <Fade in>
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Password strength:
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: getPasswordStrengthColor() }}>
                                {getPasswordStrengthText()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <Box
                                  key={level}
                                  sx={{
                                    flex: 1,
                                    height: 4,
                                    borderRadius: 2,
                                    bgcolor: level <= passwordStrength ? getPasswordStrengthColor() : alpha(theme.palette.grey[500], 0.2),
                                    transition: 'all 0.3s ease'
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Fade>
                      )}
                    </Box>
                  </Grow>

                  {/* Confirm Password */}
                  <Grow in timeout={1400} style={{ transitionDelay: '700ms' }}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      {...register('confirmPassword')}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      disabled={loading}
                      autoComplete="new-password"
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
                            borderColor: 'primary.main',
                            borderWidth: 2
                          }
                        }
                      }}
                    />
                  </Grow>

                  {/* Terms & Conditions */}
                  <Grow in timeout={1400} style={{ transitionDelay: '800ms' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          color="primary"
                          sx={{
                            '&.Mui-checked': {
                              color: 'primary.main',
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          I agree to the{' '}
                          <Link 
                            to="/terms" 
                            style={{ 
                              color: theme.palette.primary.main,
                              textDecoration: 'none',
                              fontWeight: 600
                            }}
                          >
                            Terms & Conditions
                          </Link>
                          {' '}and{' '}
                          <Link 
                            to="/privacy" 
                            style={{ 
                              color: theme.palette.primary.main,
                              textDecoration: 'none',
                              fontWeight: 600
                            }}
                          >
                            Privacy Policy
                          </Link>
                        </Typography>
                      }
                    />
                  </Grow>

                  {/* Submit Button */}
                  <Grow in timeout={1600} style={{ transitionDelay: '900ms' }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading || !isValid || !acceptedTerms}
                      sx={{ 
                        mt: 1,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
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
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          transform: 'translateY(-3px)',
                          boxShadow: '0 15px 30px rgba(102, 126, 234, 0.4)'
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
                        'Create Free Account'
                      )}
                    </Button>
                  </Grow>
                </Box>
              </form>

              {/* Login Link */}
              <Fade in timeout={1800}>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link 
                      to="/login"
                      style={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        textDecoration: 'none',
                        position: 'relative',
                        '&:hover': {
                          '&:after': {
                            width: '100%'
                          }
                        },
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -2,
                          left: 0,
                          width: 0,
                          height: 2,
                          background: theme.palette.primary.main,
                          transition: 'width 0.3s ease'
                        }
                      }}
                    >
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Paper>
        </Zoom>

        {/* Right Side - Benefits */}
        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}
              >
                Join Thousands Making a Difference
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 3 }}>
                {[
                  {
                    icon: <ShieldIcon />,
                    title: 'Safe & Secure',
                    description: 'Bank-level encryption keeps your data protected',
                    color: '#4CAF50'
                  },
                  {
                    icon: <VisibilityIcon />,
                    title: 'Real-time Tracking',
                    description: 'Monitor issue resolution progress live',
                    color: '#2196F3'
                  },
                  {
                    icon: <GroupsIcon />,
                    title: 'Community Power',
                    description: 'Join forces with neighbors for greater impact',
                    color: '#9C27B0'
                  },
                  {
                    icon: <CheckCircleIcon />,
                    title: 'Verified Impact',
                    description: 'Get recognized for your contributions',
                    color: '#FF9800'
                  }
                ].map((benefit, index) => (
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

              {/* Stats */}
              <Fade in timeout={2000}>
                <Box sx={{ 
                  mt: 6, 
                  p: 4, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                    Community Impact
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    {[
                      { value: '10K+', label: 'Issues Resolved' },
                      { value: '50K+', label: 'Active Users' },
                      { value: '200+', label: 'Cities' }
                    ].map((stat, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Fade>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Container>
  )
}

export default Register