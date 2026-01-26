import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Alert,
  Button,
  TextField,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material'
import {
  CheckCircle,
  Storage,
  Security,
  AccountCircle,
  Settings,
  CloudUpload
} from '@mui/icons-material'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
axios.defaults.withCredentials = true

const SetupWizard = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [setupStatus, setSetupStatus] = useState(null)

  // Form data
  const [formData, setFormData] = useState({
    database: {
      connectionString: 'mongodb://localhost:27017/clean_street',
      testSuccess: false
    },
    admin: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      setupKey: ''
    },
    system: {
      appName: 'Clean Street',
      adminUrl: 'http://localhost:3000/admin',
      frontendUrl: 'http://localhost:3000'
    }
  })

  const steps = [
    'Welcome',
    'Database Setup',
    'Create Super Admin',
    'System Configuration',
    'Complete'
  ]

  // Check setup status on mount
  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/system/status`)
      setSetupStatus(response.data)
      
      if (!response.data.system?.setupRequired) {
        setError('Setup already completed. Redirecting to login...')
        setTimeout(() => {
          window.location.href = '/admin/login'
        }, 2000)
      }
    } catch (err) {
      setError('Cannot connect to setup API. Make sure backend is running.')
    }
  }

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post('/api/setup/test-database', {
        connectionString: formData.database.connectionString
      })
      
      setSuccess('Database connection successful!')
      handleInputChange('database', 'testSuccess', true)
    } catch (err) {
      setError(err.response?.data?.error || 'Database connection failed')
      handleInputChange('database', 'testSuccess', false)
    } finally {
      setLoading(false)
    }
  }

  const createSuperAdmin = async () => {
    if (formData.admin.password !== formData.admin.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(`${API_BASE_URL}/setup/super-admin`, {
        email: formData.admin.email,
        password: formData.admin.password,
        name: formData.admin.name
      }, {
        headers: formData.admin.setupKey ? { 'x-master-key': formData.admin.setupKey } : {}
      })
      
      setSuccess('Super admin created successfully!')
      setActiveStep(prev => prev + 1)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create super admin')
    } finally {
      setLoading(false)
    }
  }

  const saveConfiguration = async () => {
    setLoading(true)
    
    try {
      await axios.post('/api/setup/configure', {
        config: formData.system
      })
      
      setSuccess('Configuration saved successfully!')
      setActiveStep(prev => prev + 1)
    } catch (err) {
      setError('Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    setError('')
    setSuccess('')
    
    if (activeStep === 1 && !formData.database.testSuccess) {
      setError('Please test database connection first')
      return
    }
    
    if (activeStep === 2) {
      createSuperAdmin()
    } else if (activeStep === 3) {
      saveConfiguration()
    } else {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
    setError('')
    setSuccess('')
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom align="center">
              Welcome to Clean Street Setup
            </Typography>
            <Typography variant="body1" paragraph align="center" color="text.secondary">
              This wizard will guide you through the initial setup of your Clean Street platform.
            </Typography>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  Prerequisites
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Storage /></ListItemIcon>
                    <ListItemText 
                      primary="MongoDB Database" 
                      secondary="Ensure MongoDB is running on your server" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Security /></ListItemIcon>
                    <ListItemText 
                      primary="Secure Environment" 
                      secondary="Make sure you're in a secure environment" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Settings /></ListItemIcon>
                    <ListItemText 
                      primary="System Requirements" 
                      secondary="Node.js 16+ and npm/yarn installed" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        )
        
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Database Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter your MongoDB connection string. The default is for local development.
            </Typography>
            
            <TextField
              fullWidth
              label="MongoDB Connection String"
              value={formData.database.connectionString}
              onChange={(e) => handleInputChange('database', 'connectionString', e.target.value)}
              margin="normal"
              disabled={loading}
              helperText="Example: mongodb://localhost:27017/clean_street"
            />
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={testDatabaseConnection}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Storage />}
              >
                {loading ? 'Testing...' : 'Test Connection'}
              </Button>
              
              {formData.database.testSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Database connection successful! Proceed to next step.
                </Alert>
              )}
            </Box>
          </Box>
        )
        
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Create Super Administrator
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create the first super admin account with full system access.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.admin.email}
                  onChange={(e) => handleInputChange('admin', 'email', e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.admin.name}
                  onChange={(e) => handleInputChange('admin', 'name', e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.admin.password}
                  onChange={(e) => handleInputChange('admin', 'password', e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                  helperText="Minimum 8 characters"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.admin.confirmPassword}
                  onChange={(e) => handleInputChange('admin', 'confirmPassword', e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                  error={formData.admin.password !== formData.admin.confirmPassword}
                  helperText={formData.admin.password !== formData.admin.confirmPassword ? "Passwords don't match" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Setup Key (Optional)"
                  type="password"
                  value={formData.admin.setupKey}
                  onChange={(e) => handleInputChange('admin', 'setupKey', e.target.value)}
                  margin="normal"
                  disabled={loading}
                  helperText="Required for production setup. Find in .env file as ADMIN_SETUP_KEY"
                />
              </Grid>
            </Grid>
          </Box>
        )
        
      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              System Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure basic system settings. These can be changed later.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Application Name"
                  value={formData.system.appName}
                  onChange={(e) => handleInputChange('system', 'appName', e.target.value)}
                  margin="normal"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Frontend URL"
                  value={formData.system.frontendUrl}
                  onChange={(e) => handleInputChange('system', 'frontendUrl', e.target.value)}
                  margin="normal"
                  disabled={loading}
                  helperText="Where users will access the platform"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Admin Panel URL"
                  value={formData.system.adminUrl}
                  onChange={(e) => handleInputChange('system', 'adminUrl', e.target.value)}
                  margin="normal"
                  disabled={loading}
                  helperText="Where admins will access the panel"
                />
              </Grid>
            </Grid>
          </Box>
        )
        
      case 4:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Setup Complete!
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Your Clean Street platform has been successfully configured.
            </Typography>
            
            <Card sx={{ maxWidth: 500, mx: 'auto', mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Next Steps
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Login to Admin Panel" 
                      secondary={`Use credentials you just created`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Configure SMTP" 
                      secondary="Set up email service for notifications" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Add More Admins" 
                      secondary="Create additional admin accounts" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Review Security" 
                      secondary="Check security settings and enable 2FA" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => window.location.href = '/admin/login'}
                startIcon={<AccountCircle />}
              >
                Go to Admin Login
              </Button>
            </Box>
          </Box>
        )
        
      default:
        return null
    }
  }

  if (setupStatus && !setupStatus.setupRequired) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper elevation={3}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Setup Already Completed
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The system is already configured. Redirecting to login...
            </Typography>
            <CircularProgress sx={{ mt: 2 }} />
          </Box>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading || (activeStep === steps.length - 1)}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Processing...' : 
             activeStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default SetupWizard