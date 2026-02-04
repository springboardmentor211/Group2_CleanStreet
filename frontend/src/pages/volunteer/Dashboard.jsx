import React, { useState, useEffect } from 'react'
import { Container, Typography, Grid, Card, CardContent, Box, Button, Chip, CircularProgress, Stack } from '@mui/material'
import { VolunteerActivism, Event, Assignment, EmojiEvents, CheckCircle } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    hoursLogged: 0,
    eventsAttended: 0,
    reportsResolved: 0,
    badges: []
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await apiClient.get('/volunteers/profile', {
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (response.data.success) {
        const profile = response.data.profile
        setStats({
          hoursLogged: profile?.hoursLogged || 0,
          eventsAttended: profile?.eventsAttended || 0,
          reportsResolved: 0, // To be implemented
          badges: profile?.badges || []
        })
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error('Failed to fetch stats', err)
    } finally {
      setLoading(false)
    }
  }

  const getTierInfo = () => {
    const tier = user?.volunteer_tier || 'basic'
    const tierInfo = {
      basic: { label: 'Basic Volunteer', color: 'primary', description: 'Join events and earn badges' },
      verified: { label: 'Verified Volunteer', color: 'success', description: 'Create events and lead teams' },
      team_lead: { label: 'Team Lead', color: 'error', description: 'Full access to all features' }
    }
    return tierInfo[tier]
  }

  const tierInfo = getTierInfo()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip 
            label={tierInfo.label} 
            color={tierInfo.color} 
            icon={<VolunteerActivism />}
          />
          <Typography variant="body2" color="text.secondary">
            {tierInfo.description}
          </Typography>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Hours Logged</Typography>
                  <Typography variant="h4" fontWeight="bold">{stats.hoursLogged}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Events Attended</Typography>
                  <Typography variant="h4" fontWeight="bold">{stats.eventsAttended}</Typography>
                </Box>
                <Event sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Reports Resolved</Typography>
                  <Typography variant="h4" fontWeight="bold">{stats.reportsResolved}</Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Badges Earned</Typography>
                  <Typography variant="h4" fontWeight="bold">{stats.badges.length}</Typography>
                </Box>
                <EmojiEvents sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => navigate('/events')}
            startIcon={<Event />}
          >
            Browse Events
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={() => navigate('/MyEvents')}
          >
            My Events
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={() => navigate('/Reports')}
            startIcon={<Assignment />}
          >
            View Reports
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={() => navigate('/profile')}
          >
            My Profile
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard
