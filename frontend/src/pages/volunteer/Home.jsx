import React from 'react'
import { Container, Typography, Box, Grid, Paper, Button, Stack, Chip } from '@mui/material'
import { VolunteerActivism, Event, AssignmentTurnedIn, Person, LocationOn } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const VolunteerHome = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Welcome, {user?.name || 'Volunteer'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Thank you for helping your community. Choose a task to get started.
            </Typography>
          </Box>
          <Chip
            label={user?.volunteer_status === 'active' ? 'Verified Volunteer' : 'Volunteer'}
            color={user?.volunteer_status === 'active' ? 'success' : 'default'}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack spacing={2}>
              <VolunteerActivism color="primary" sx={{ fontSize: 36 }} />
              <Typography variant="h6" fontWeight={700}>Volunteer Dashboard</Typography>
              <Typography variant="body2" color="text.secondary">
                Track hours, badges, and overall activity progress.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/dashboard')}>
                Open Dashboard
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Event color="secondary" sx={{ fontSize: 36 }} />
              <Typography variant="h6" fontWeight={700}>Upcoming Events</Typography>
              <Typography variant="body2" color="text.secondary">
                Browse and join cleanup events near you.
              </Typography>
              <Button variant="outlined" onClick={() => navigate('/events')}>
                View Events
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack spacing={2}>
              <AssignmentTurnedIn color="success" sx={{ fontSize: 36 }} />
              <Typography variant="h6" fontWeight={700}>Volunteer Reports</Typography>
              <Typography variant="body2" color="text.secondary">
                Review assigned reports and update status.
              </Typography>
              <Button variant="outlined" onClick={() => navigate('/reports')}>
                View Reports
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack spacing={2}>
              <LocationOn color="warning" sx={{ fontSize: 36 }} />
              <Typography variant="h6" fontWeight={700}>Community Feed</Typography>
              <Typography variant="body2" color="text.secondary">
                See what people are reporting in your area.
              </Typography>
              <Button variant="outlined" onClick={() => navigate('/community')}>
                Open Community
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Person color="info" sx={{ fontSize: 36 }} />
              <Typography variant="h6" fontWeight={700}>My Profile</Typography>
              <Typography variant="body2" color="text.secondary">
                Update your details and profile photo.
              </Typography>
              <Button variant="outlined" onClick={() => navigate('/profile')}>
                View Profile
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default VolunteerHome
