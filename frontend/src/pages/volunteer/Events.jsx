import React, { useState, useEffect } from 'react'
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Box, TextField, CircularProgress, Stack } from '@mui/material'
import { LocationOn, CalendarToday, People, AccessTime, Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const Events = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/volunteers/events/upcoming')
      setEvents(response.data.events || [])
    } catch (err) {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId) => {
    try {
      const response = await apiClient.post(`/volunteers/events/${eventId}/register`)
      if (response.data.success) {
        toast.success('Registered successfully!')
        fetchEvents()
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    }
  }

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.description.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Volunteer Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Browse and register for upcoming volunteer opportunities
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => navigate('/create-event')}
        >
          Create Event
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
        />
      </Stack>

      {filteredEvents.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No events found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event._id}>
              <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {event.title}
                    </Typography>
                    <Chip 
                      label={event.status} 
                      color={event.status === 'active' ? 'success' : 'default'} 
                      size="small"
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>

                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(event.dateTime?.start).format('MMM D, YYYY h:mm A')}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.location?.address || 'Location TBD'}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.volunteersRegistered?.length || 0} / {event.maxVolunteers} volunteers
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Duration: {event.dateTime?.start && event.dateTime?.end ? 
                          Math.round((new Date(event.dateTime.end) - new Date(event.dateTime.start)) / (1000 * 60 * 60)) : 'TBD'} hours
                      </Typography>
                    </Stack>
                  </Stack>

                  {event.requiredTier && (
                    <Chip 
                      label={`Requires: ${event.requiredTier}`} 
                      size="small" 
                      sx={{ mt: 2 }}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => handleRegister(event._id)}
                    disabled={
                      event.volunteersRegistered?.some(v => v.volunteer === 'current_user_id') ||
                      event.volunteersRegistered?.length >= event.maxVolunteers
                    }
                  >
                    {event.volunteersRegistered?.some(v => v.volunteer === 'current_user_id') 
                      ? 'Already Registered' 
                      : event.volunteersRegistered?.length >= event.maxVolunteers
                      ? 'Event Full'
                      : 'Register'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default Events
