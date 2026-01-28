import React from 'react'
import { Box, Paper, Typography, Button, Grid, Card, CardContent, Stack } from '@mui/material'
import { redirectToSubdomain } from '../../utils/subdomain'
import { CheckCircle, Star, EmojiEvents } from '@mui/icons-material'

const VolunteerLanding = () => {
  const handleNavigate = (path) => {
    redirectToSubdomain('volunteer', path)
  }

  return (
    <Box sx={{ py: 4 }}>
      <Paper sx={{ p: 4, mb: 4, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Join Clean Street Volunteers
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Make a difference in your community by becoming a volunteer
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', border: '2px solid #1976d2' }}>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ p: 2 }}>
                <CheckCircle sx={{ fontSize: 60, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  Basic Volunteer
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  Start making an impact immediately! Join public events, log hours, and earn badges.
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>✓ Auto-approved</Typography>
                  <Typography variant="subtitle2" gutterBottom>✓ Join public events</Typography>
                  <Typography variant="subtitle2" gutterBottom>✓ Log volunteer hours</Typography>
                  <Typography variant="subtitle2" gutterBottom>✓ Earn basic badges</Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => handleNavigate('/register/basic')}
                >
                  Join as Basic Volunteer
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', border: '2px solid #f57c00' }}>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ p: 2 }}>
                <Star sx={{ fontSize: 60, color: 'warning.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  Verified Volunteer
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  Take on leadership roles! Create events, lead teams, and access special resources.
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>✓ All basic benefits +</Typography>
                  <Typography variant="subtitle2" gutterBottom>✓ Create small events (up to 10)</Typography>
                  <Typography variant="subtitle2" gutterBottom>✓ Lead volunteer teams</Typography>
                  <Typography variant="subtitle2" gutterBottom>✓ Access equipment lists</Typography>
                  <Typography variant="caption" color="warning.main" fontWeight="bold">
                    * Requires admin approval
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  fullWidth
                  onClick={() => handleNavigate('/register/verified')}
                >
                  Apply as Verified Volunteer
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ border: '2px solid #4caf50' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <EmojiEvents sx={{ fontSize: 60, color: 'success.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Team Lead
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Our most trusted volunteers! Create unlimited events, manage teams, and access sensitive locations. Team Leads are appointed by administrators based on proven dedication and leadership.
                  </Typography>
                </Box>
                <Button variant="outlined" color="success" disabled>
                  Admin Appointed Only
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default VolunteerLanding
