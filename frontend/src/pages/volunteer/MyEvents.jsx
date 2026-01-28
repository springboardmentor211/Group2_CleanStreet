import React, { useState, useEffect } from 'react'
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Box, CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { LocationOn, CalendarToday, AccessTime, CheckCircle } from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const MyEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkinDialog, setCheckinDialog] = useState({ open: false, event: null })

  useEffect(() => {
    fetchMyEvents()
  }, [])

  const fetchMyEvents = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/volunteers/my-events')
      setEvents(response.data.events || [])
    } catch (err) {
      toast.error('Failed to load your events')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async (eventId) => {
    try {
      const response = await apiClient.post(`/volunteers/events/${eventId}/checkin`)
      if (response.data.success) {
        toast.success('Checked in successfully!')
        fetchMyEvents()
        setCheckinDialog({ open: false, event: null })
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed')
    }
  }

  const handleCheckout = async (eventId) => {
    try {
      const response = await apiClient.post(`/volunteers/events/${eventId}/checkout`)
      if (response.data.success) {
        toast.success(`Checked out! ${response.data.hoursCredited} hours credited.`)
        fetchMyEvents()
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-out failed')
    }
  }

  const getRegistrationStatus = (registration) => {
    if (registration.checkoutTime) return { label: 'Completed', color: 'success' }
    if (registration.checkinTime) return { label: 'Checked In', color: 'info' }
    return { label: registration.status, color: 'default' }
  }

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
          My Events
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your registered volunteer events and track attendance
        </Typography>
      </Box>

      {events.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No registered events
          </Typography>
          <Button variant="contained" href="/events">
            Browse Events
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => {
            const registration = event.registration
            const status = getRegistrationStatus(registration)
            const isPast = dayjs(event.dateTime?.start).isBefore(dayjs())
            const isToday = dayjs(event.dateTime?.start).isSame(dayjs(), 'day')
            const canCheckin = isToday && !registration.checkinTime
            const canCheckout = registration.checkinTime && !registration.checkoutTime

            return (
              <Grid item xs={12} md={6} key={event._id}>
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {event.title}
                      </Typography>
                      <Chip 
                        label={status.label} 
                        color={status.color} 
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
                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Duration: {event.dateTime?.start && event.dateTime?.end ? 
                            Math.round((new Date(event.dateTime.end) - new Date(event.dateTime.start)) / (1000 * 60 * 60)) : 'TBD'} hours
                        </Typography>
                      </Stack>

                      {registration.hoursCredited > 0 && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2" color="success.main" fontWeight="medium">
                            {registration.hoursCredited} hours credited
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {registration.checkinTime && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Check-in: {dayjs(registration.checkinTime).format('h:mm A')}
                        </Typography>
                        {registration.checkoutTime && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Check-out: {dayjs(registration.checkoutTime).format('h:mm A')}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {canCheckin && (
                      <Button 
                        variant="contained" 
                        fullWidth
                        onClick={() => setCheckinDialog({ open: true, event })}
                      >
                        Check In
                      </Button>
                    )}
                    {canCheckout && (
                      <Button 
                        variant="contained" 
                        color="success"
                        fullWidth
                        onClick={() => handleCheckout(event._id)}
                      >
                        Check Out
                      </Button>
                    )}
                    {!canCheckin && !canCheckout && (
                      <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                        {isPast ? 'Event completed' : 'Check-in available on event day'}
                      </Typography>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Check-in Confirmation Dialog */}
      <Dialog open={checkinDialog.open} onClose={() => setCheckinDialog({ open: false, event: null })}>
        <DialogTitle>Check In to Event</DialogTitle>
        <DialogContent>
          <Typography>
            Confirm your attendance at <strong>{checkinDialog.event?.title}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will start tracking your volunteer hours for this event.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckinDialog({ open: false, event: null })}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleCheckin(checkinDialog.event?._id)}
          >
            Confirm Check-In
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default MyEvents
