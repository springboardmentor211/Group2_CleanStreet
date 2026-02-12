import React, { useEffect, useRef, useState } from 'react'
import { Container, Paper, Typography, Box, Grid, Chip, CircularProgress, Stack, Divider, LinearProgress, Button, Avatar } from '@mui/material'
import { VolunteerActivism, EmojiEvents, AccessTime, Event, Star } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import PhotoCamera from '@mui/icons-material/PhotoCamera'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const Profile = () => {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/volunteers/profile')
      if (response.data.success) {
        setProfile(response.data.profile)
      }
    } catch (err) {
      console.error('Failed to fetch profile', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setProfilePicture(user?.profilePicture || '')
  }, [user])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      return
    }

    setImageUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const response = await apiClient.post('/auth/upload-profile-picture', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        setProfilePicture(response.data.image.url)
        toast.success('Profile picture updated')
        refreshUser()
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload profile picture')
    } finally {
      setImageUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getTierInfo = () => {
    const tier = user?.volunteer_tier || 'basic'
    const tierInfo = {
      basic: { label: 'Basic Volunteer', color: 'primary' },
      verified: { label: 'Verified Volunteer', color: 'success' },
      team_lead: { label: 'Team Lead', color: 'error' }
    }
    return tierInfo[tier]
  }

  const tierInfo = getTierInfo()

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            src={profilePicture || undefined}
            sx={{ width: 96, height: 96, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'V'}
          </Avatar>
          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading}
            sx={{ textTransform: 'none', mb: 2 }}
          >
            {imageUploading ? 'Uploading...' : 'Change Photo'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            style={{ display: 'none' }}
          />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {user?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {user?.email}
          </Typography>
          <Chip 
            label={tierInfo.label} 
            color={tierInfo.color} 
            sx={{ mt: 1 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Volunteer Statistics
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Hours Logged</Typography>
              </Stack>
              <Typography variant="h5" fontWeight="bold">
                {profile?.hoursLogged || 0} hrs
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((profile?.hoursLogged || 0) / 100 * 100, 100)} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Event sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Events Attended</Typography>
              </Stack>
              <Typography variant="h5" fontWeight="bold">
                {profile?.eventsAttended || 0}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((profile?.eventsAttended || 0) / 20 * 100, 100)} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Star sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Rating</Typography>
              </Stack>
              <Typography variant="h5" fontWeight="bold">
                {profile?.rating || 0} / 5
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <EmojiEvents sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Badges</Typography>
              </Stack>
              <Typography variant="h5" fontWeight="bold">
                {profile?.badges?.length || 0}
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {profile?.skills && profile.skills.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Skills
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {profile.skills.map((skill, index) => (
                <Chip key={index} label={skill} size="small" />
              ))}
            </Stack>
          </>
        )}

        {profile?.badges && profile.badges.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Badges Earned
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {profile.badges.map((badge, index) => (
                <Chip 
                  key={index} 
                  label={badge} 
                  color="warning" 
                  icon={<EmojiEvents />}
                />
              ))}
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  )
}

export default Profile
