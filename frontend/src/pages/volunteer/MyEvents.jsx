import React, { useState, useEffect } from 'react'
import { 
  Container, Typography, Grid, Card, CardContent, CardActions, 
  Button, Chip, Box, CircularProgress, Stack, Dialog, DialogTitle, 
  DialogContent, DialogActions, Tabs, Tab, MenuItem, Select, 
  FormControl, InputLabel, Divider, Skeleton
} from '@mui/material'
import { 
  LocationOn, CalendarToday, AccessTime, CheckCircle, 
  People, Timer, Description, Refresh, FilterList, Sort, 
  ArrowForward, Download
} from '@mui/icons-material'
import { useSwipeable } from 'react-swipeable'
import axios from 'axios'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const MyEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('upcoming')
  const [sortBy, setSortBy] = useState('date')
  const [checkinDialog, setCheckinDialog] = useState({ open: false, event: null })
  const [detailsDialog, setDetailsDialog] = useState({ open: false, event: null })

  const swipeHandlers = useSwipeable({
    onSwipedDown: () => {
      if (window.scrollY <= 0 && !loading) {
        handleRefresh()
      }
    }
  })

  useEffect(() => {
    fetchMyEvents()
  }, [])

  useEffect(() => {
    // Auto-refresh for checked-in events
    const hasActiveCheckin = events.some(event => 
      event.registration?.checkinTime && !event.registration?.checkoutTime
    )
    
    if (hasActiveCheckin) {
      const interval = setInterval(() => {
        fetchMyEvents(false) // Silent refresh
      }, 30000) // Refresh every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [events])

  useEffect(() => {
    // Notifications for upcoming events
    const now = dayjs()
    const oneHourFromNow = now.add(1, 'hour')
    
    events.forEach(event => {
      const eventTime = dayjs(event.dateTime?.start)
      const registration = event.registration
      
      if (!registration?.checkinTime && 
          eventTime.isAfter(now) && 
          eventTime.isBefore(oneHourFromNow)) {
        toast.success(`Reminder: ${event.title} starts in less than an hour!`, {
          duration: 10000,
          icon: '⏰',
          id: `reminder-${event._id}`
        })
      }
    })
  }, [events])

  const fetchMyEvents = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const response = await apiClient.get('/volunteers/my-events', {
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      let fetchedEvents = []
      if (response.data && Array.isArray(response.data.events)) {
        fetchedEvents = response.data.events
      } else if (response.data && Array.isArray(response.data)) {
        fetchedEvents = response.data
      }
      
      setEvents(fetchedEvents)
    } catch (err) {
      console.error('Failed to load events:', err)
      toast.error(err.response?.data?.error || 'Failed to load your events')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMyEvents()
  }

  const handleCheckin = async (eventId) => {
    try {
      const response = await apiClient.post(`/volunteers/events/${eventId}/checkin`)
      if (response.data.success) {
        toast.success('Checked in successfully!')
        fetchMyEvents(false)
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
        fetchMyEvents(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-out failed')
    }
  }

  const getRegistrationStatus = (registration) => {
    if (!registration) return { label: 'Unknown', color: 'default' }
    if (registration.checkoutTime) return { label: 'Completed', color: 'success' }
    if (registration.checkinTime) return { label: 'Checked In', color: 'info' }
    return { label: registration.status || 'Registered', color: 'default' }
  }

  // Filter and sort events
  const filteredEvents = events.filter(event => {
    const now = dayjs()
    const eventDate = dayjs(event.dateTime?.start)
    const registration = event.registration || {}
    
    switch (filter) {
      case 'upcoming':
        return eventDate.isAfter(now) || eventDate.isSame(now, 'day')
      case 'past':
        return eventDate.isBefore(now, 'day')
      case 'checked-in':
        return registration.checkinTime && !registration.checkoutTime
      case 'completed':
        return registration.checkoutTime
      default:
        return true
    }
  }).sort((a, b) => {
    const aDate = dayjs(a.dateTime?.start)
    const bDate = dayjs(b.dateTime?.start)
    const aHours = a.registration?.hoursCredited || 0
    const bHours = b.registration?.hoursCredited || 0
    
    switch (sortBy) {
      case 'date':
        return aDate.isBefore(bDate) ? -1 : 1
      case 'date-desc':
        return bDate.isBefore(aDate) ? -1 : 1
      case 'hours':
        return bHours - aHours
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  // Calculate summary statistics
  const totalHours = events.reduce((total, event) => {
    return total + (event.registration?.hoursCredited || 0)
  }, 0)

  const activeCheckins = events.filter(e => 
    e.registration?.checkinTime && !e.registration?.checkoutTime
  ).length

  const todaysEvents = events.filter(e => 
    dayjs(e.dateTime?.start).isSame(dayjs(), 'day')
  ).length

  const handleExportHours = () => {
    const exportData = events
      .filter(event => event.registration?.hoursCredited > 0)
      .map(event => ({
        title: event.title,
        date: dayjs(event.dateTime?.start).format('YYYY-MM-DD'),
        hours: event.registration.hoursCredited,
        checkin: event.registration.checkinTime ? 
          dayjs(event.registration.checkinTime).format('YYYY-MM-DD HH:mm') : '',
        checkout: event.registration.checkoutTime ? 
          dayjs(event.registration.checkoutTime).format('YYYY-MM-DD HH:mm') : ''
      }))

    const csvContent = [
      ['Event Title', 'Date', 'Hours', 'Check-in', 'Check-out'],
      ...exportData.map(event => [
        `"${event.title}"`,
        event.date,
        event.hours,
        event.checkin,
        event.checkout
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-volunteer-hours-${dayjs().format('YYYY-MM-DD')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success('Hours exported successfully')
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={300} height={24} sx={{ mb: 4 }} />
        
        {/* Summary Skeletons */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={80} />
            </Grid>
          ))}
        </Grid>
        
        {/* Event Cards Skeletons */}
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} md={6} key={i}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1, mt: 2 }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} {...swipeHandlers}>
      {/* Header with Refresh */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your registered volunteer events and track attendance
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outlined"
          size="small"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Summary Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {events.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Events
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {totalHours}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Hours
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {activeCheckins}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Check-ins
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {todaysEvents}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Today's Events
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Sort */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Tabs 
          value={filter} 
          onChange={(e, newValue) => setFilter(newValue)}
          sx={{ minHeight: 'auto' }}
        >
          <Tab label="Upcoming" value="upcoming" />
          <Tab label="Past" value="past" />
          <Tab label="Checked In" value="checked-in" />
          <Tab label="Completed" value="completed" />
        </Tabs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { sm: 'auto' } }}>
          <Sort fontSize="small" color="action" />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort by"
            >
              <MenuItem value="date">Date (Soonest)</MenuItem>
              <MenuItem value="date-desc">Date (Latest)</MenuItem>
              <MenuItem value="hours">Most Hours</MenuItem>
              <MenuItem value="title">Title (A-Z)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Export Button (User's hours only) */}
      {totalHours > 0 && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            startIcon={<Download />}
            onClick={handleExportHours}
            variant="outlined"
            size="small"
          >
            Export My Hours (CSV)
          </Button>
        </Box>
      )}

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Box sx={{ 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <CalendarToday sx={{ fontSize: 48, color: 'grey.400' }} />
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            {filter === 'upcoming' ? 
              "You don't have any upcoming events. Browse available events to get started!" :
              filter === 'past' ? 
              "No past events found." :
              filter === 'checked-in' ?
              "You're not currently checked in to any events." :
              "No completed events yet."}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" href="/events">
              Browse Events
            </Button>
            <Button variant="outlined" href="/dashboard">
              Go to Dashboard
            </Button>
          </Stack>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => {
            const registration = event.registration || {}
            const status = getRegistrationStatus(registration)
            const isPast = dayjs(event.dateTime?.start).isBefore(dayjs())
            const isToday = dayjs(event.dateTime?.start).isSame(dayjs(), 'day')
            const canCheckin = isToday && !registration.checkinTime
            const canCheckout = registration.checkinTime && !registration.checkoutTime

            return (
              <Grid item xs={12} md={6} key={event._id}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => setDetailsDialog({ open: true, event })}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                        {event.title}
                      </Typography>
                      <Chip 
                        label={status.label} 
                        color={status.color} 
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2, 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {event.description || 'No description available.'}
                    </Typography>

                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(event.dateTime?.start).format('MMM D, YYYY h:mm A')}
                          {isToday && (
                            <Chip 
                              label="Today" 
                              size="small" 
                              sx={{ ml: 1, height: 20 }}
                              color="warning"
                            />
                          )}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.location?.address || 'Location TBD'}
                        </Typography>
                      </Stack>

                      {event.dateTime?.start && event.dateTime?.end && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Duration: {Math.round((new Date(event.dateTime.end) - new Date(event.dateTime.start)) / (1000 * 60 * 60))} hours
                          </Typography>
                        </Stack>
                      )}

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
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
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
                        onClick={(e) => {
                          e.stopPropagation()
                          setCheckinDialog({ open: true, event })
                        }}
                      >
                        Check In
                      </Button>
                    )}
                    {canCheckout && (
                      <Button 
                        variant="contained" 
                        color="success"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCheckout(event._id)
                        }}
                      >
                        Check Out
                      </Button>
                    )}
                    {!canCheckin && !canCheckout && (
                      <Button 
                        variant="outlined" 
                        fullWidth
                        endIcon={<ArrowForward />}
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetailsDialog({ open: true, event })
                        }}
                      >
                        View Details
                      </Button>
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
          <Typography gutterBottom>
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

      {/* Event Details Dialog */}
      <Dialog 
        open={detailsDialog.open} 
        onClose={() => setDetailsDialog({ open: false, event: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday color="primary" />
          {detailsDialog.event?.title}
        </DialogTitle>
        <DialogContent dividers>
          {detailsDialog.event && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2">
                  {detailsDialog.event.description || 'No description provided.'}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarToday fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body2">
                        {dayjs(detailsDialog.event.dateTime?.start).format('ddd, MMM D, YYYY')}
                      </Typography>
                      <Typography variant="body2">
                        {dayjs(detailsDialog.event.dateTime?.start).format('h:mm A')} - 
                        {dayjs(detailsDialog.event.dateTime?.end).format('h:mm A')}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <People fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Volunteers
                      </Typography>
                      <Typography variant="body2">
                        {detailsDialog.event.registeredVolunteers || 0} registered
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationOn fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body2">
                        {detailsDialog.event.location?.address || 'TBD'}
                      </Typography>
                      {detailsDialog.event.location?.city && detailsDialog.event.location?.state && (
                        <Typography variant="body2">
                          {detailsDialog.event.location.city}, {detailsDialog.event.location.state}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Grid>
                
                {detailsDialog.event.registration && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Your Registration
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Status: <Chip 
                            label={getRegistrationStatus(detailsDialog.event.registration).label} 
                            size="small" 
                            color={getRegistrationStatus(detailsDialog.event.registration).color}
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        {detailsDialog.event.registration.checkinTime && (
                          <Typography variant="body2">
                            Checked in: {dayjs(detailsDialog.event.registration.checkinTime).format('MMM D, h:mm A')}
                          </Typography>
                        )}
                        {detailsDialog.event.registration.checkoutTime && (
                          <Typography variant="body2">
                            Checked out: {dayjs(detailsDialog.event.registration.checkoutTime).format('MMM D, h:mm A')}
                          </Typography>
                        )}
                        {detailsDialog.event.registration.hoursCredited > 0 && (
                          <Typography variant="body2" fontWeight="medium">
                            Hours credited: {detailsDialog.event.registration.hoursCredited}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, event: null })}>
            Close
          </Button>
          {detailsDialog.event?.registration?.checkinTime && !detailsDialog.event?.registration?.checkoutTime && (
            <Button 
              variant="contained" 
              color="success"
              onClick={() => {
                handleCheckout(detailsDialog.event._id)
                setDetailsDialog({ open: false, event: null })
              }}
            >
              Check Out
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default MyEvents