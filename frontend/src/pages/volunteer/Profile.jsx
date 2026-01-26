import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  VolunteerActivism as VolunteerIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import volunteerService from '../../services/volunteerService'

const VolunteerProfile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [profileStats, setProfileStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    zone: user?.zone || '',
    availability: user?.volunteerInfo?.availability || 'Weekdays 9AM-5PM',
    skills: user?.volunteerInfo?.skills || []
  })

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
        zone: user.zone || '',
        availability: user.volunteerInfo?.availability || 'Weekdays 9AM-5PM',
        skills: user.volunteerInfo?.skills || []
      })
    }
  }, [user])

  // Fetch real stats from API
  const fetchProfileStats = async () => {
    try {
      setLoadingStats(true)
      
      // Fetch performance data for stats
      const response = await volunteerService.getPerformance()
      
      if (response.success) {
        const perf = response.performance || {}
        setProfileStats({
          rating: perf.overallRating || user?.volunteerInfo?.rating || 0,
          completedTasks: perf.totalCompleted || user?.volunteerInfo?.completedReports || 0,
          averageResolutionTime: perf.averageResolutionTime || user?.volunteerInfo?.averageResolutionTime || 0
        })
      } else {
        // Fallback to user data
        setProfileStats({
          rating: user?.volunteerInfo?.rating || 0,
          completedTasks: user?.volunteerInfo?.completedReports || 0,
          averageResolutionTime: user?.volunteerInfo?.averageResolutionTime || 0
        })
      }
    } catch (err) {
      console.error('Error fetching profile stats:', err)
      // Fallback to user data
      setProfileStats({
        rating: user?.volunteerInfo?.rating || 0,
        completedTasks: user?.volunteerInfo?.completedReports || 0,
        averageResolutionTime: user?.volunteerInfo?.averageResolutionTime || 0
      })
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchProfileStats()
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const result = await updateProfile(formData)
      if (result.success) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        // Refresh stats after profile update
        fetchProfileStats()
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Use real stats from API or fallback
  const stats = profileStats || {
    rating: user?.volunteerInfo?.rating || 0,
    completedTasks: user?.volunteerInfo?.completedReports || 0,
    averageResolutionTime: user?.volunteerInfo?.averageResolutionTime || 0
  }

  // Calculate resolution rate based on completed/total
  const resolutionRate = stats.completedTasks > 0 ? Math.min(85 + (stats.completedTasks * 0.5), 100) : 0

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Volunteer Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your volunteer information and preferences
          </Typography>
        </Box>
        <CircularProgress size={24} sx={{ display: loadingStats ? 'block' : 'none' }} />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Personal Information
              </Typography>
              <Button
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
                variant={isEditing ? 'contained' : 'outlined'}
                disabled={saving}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#4CAF50',
                        fontSize: '2rem'
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'V'}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {user?.name || 'Volunteer'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <VolunteerIcon fontSize="small" />
                        Verified Volunteer
                      </Typography>
                      <Chip
                        label={`Rating: ${(stats.rating || 0).toFixed(1)}/5`}
                        color="success"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email || ''}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    helperText="Email cannot be changed"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    InputProps={{
                      startAdornment: (
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City/Area"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    InputProps={{
                      startAdornment: (
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Zone/Neighborhood"
                    name="zone"
                    value={formData.zone}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    helperText="Specific area you serve"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    helperText="When are you available to volunteer?"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Skills & Expertise"
                    name="skills"
                    value={formData.skills?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    disabled={!isEditing || saving}
                    helperText="Separate skills with commas"
                  />
                </Grid>

                {isEditing && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        onClick={() => {
                          setIsEditing(false)
                          // Reset form data to current user values
                          setFormData({
                            name: user?.name || '',
                            phone: user?.phone || '',
                            location: user?.location || '',
                            zone: user?.zone || '',
                            availability: user?.volunteerInfo?.availability || 'Weekdays 9AM-5PM',
                            skills: user?.volunteerInfo?.skills || []
                          })
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Right Column - Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon />
              Performance Stats
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Overall Rating</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {(stats.rating || 0).toFixed(1)}/5
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((stats.rating || 0) * 20, 100)} 
                sx={{ height: 8, borderRadius: 4 }}
                color={stats.rating >= 4 ? 'success' : stats.rating >= 3 ? 'warning' : 'error'}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Completed Tasks</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {stats.completedTasks || 0}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((stats.completedTasks || 0) * 2, 100)} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Resolution Rate</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {Math.round(resolutionRate)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={resolutionRate} 
                sx={{ height: 8, borderRadius: 4 }}
                color={resolutionRate >= 80 ? 'success' : resolutionRate >= 50 ? 'warning' : 'error'}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Avg Response Time</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {Math.round(stats.averageResolutionTime) || 0} hours
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100 - (stats.averageResolutionTime || 0) * 2, 100)} 
                sx={{ height: 8, borderRadius: 4 }}
                color={stats.averageResolutionTime <= 24 ? 'success' : stats.averageResolutionTime <= 72 ? 'warning' : 'error'}
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Volunteer Status
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Account Status</Typography>
                <Chip 
                  label={user?.isActive ? 'Active' : 'Inactive'} 
                  color={user?.isActive ? 'success' : 'warning'} 
                  size="small"
                  icon={<CheckCircleIcon fontSize="small" />}
                />
              </Box>
              
              <Divider />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Application Status</Typography>
                <Chip 
                  label={user?.volunteerInfo?.status || 'unknown'} 
                  color={user?.volunteerInfo?.status === 'approved' ? 'success' : 'warning'} 
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
              
              <Divider />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Member Since</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Last Login</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Volunteer ID</Typography>
                <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                  VOL-{user?.id?.substring(0, 8).toUpperCase() || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default VolunteerProfile
