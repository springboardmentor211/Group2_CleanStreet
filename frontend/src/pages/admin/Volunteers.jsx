import React, { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material'
import {
  Refresh,
  Email,
  Phone,
  Security,
  ExpandMore,
  ExpandLess,
  Search,
  Event,
  AccessTime,
  CheckCircle,
  EmojiEvents,
  LocationOn,
  Close,
  CalendarToday,
  Assignment,
  Done,
  ErrorOutline,
  HourglassEmpty,
  PlayArrow
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVolunteer, setSelectedVolunteer] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [volunteerDetails, setVolunteerDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tabValue, setTabValue] = useState(0)

  const fetchVolunteers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get('/admin/volunteers')
      setVolunteers(res.data.volunteers || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load volunteers')
      toast.error('Failed to load volunteers')
    } finally {
      setLoading(false)
    }
  }

  const fetchVolunteerDetails = async (volunteerId) => {
    setLoadingDetails(true)
    try {
      // Fetch volunteer events
      const eventsRes = await apiClient.get(`/admin/volunteers/${volunteerId}/events`)
      // Fetch volunteer profile
      const profileRes = await apiClient.get(`/admin/volunteers/${volunteerId}/profile`)
      // Fetch volunteer reports/work
      const reportsRes = await apiClient.get(`/admin/volunteers/${volunteerId}/reports`)
      
      setVolunteerDetails({
        events: eventsRes.data.events || [],
        profile: profileRes.data.profile || {},
        stats: eventsRes.data.stats || {},
        reportsSubmitted: reportsRes.data.reportsSubmitted || [],
        reportsResolved: reportsRes.data.reportsResolved || [],
        reportStats: reportsRes.data.stats || {}
      })
    } catch (err) {
      console.error('Failed to fetch volunteer details:', err)
      toast.error('Failed to load volunteer details')
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => {
    fetchVolunteers()
  }, [])

  const handleOpenDialog = async (volunteer) => {
    setSelectedVolunteer(volunteer)
    setOpenDialog(true)
    await fetchVolunteerDetails(volunteer._id)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedVolunteer(null)
    setVolunteerDetails(null)
  }

  const handleRowExpand = (volunteerId) => {
    setExpandedRow(expandedRow === volunteerId ? null : volunteerId)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success'
      case 'pending': return 'warning'
      case 'inactive': return 'default'
      default: return 'default'
    }
  }

  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch = 
      v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = tabValue === 0 ? true : 
                      tabValue === 1 ? v.volunteer_status === 'active' :
                      tabValue === 2 ? v.volunteer_status === 'pending' :
                      v.volunteer_status === 'inactive'
    
    return matchesSearch && matchesTab
  })

  const stats = {
    total: volunteers.length,
    active: volunteers.filter(v => v.volunteer_status === 'active').length,
    pending: volunteers.filter(v => v.volunteer_status === 'pending').length,
    inactive: volunteers.filter(v => v.volunteer_status === 'inactive').length
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Volunteer Management</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchVolunteers} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Total Volunteers</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Active</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">{stats.active}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Pending</Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Inactive</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.inactive}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        {/* Search and Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </Stack>

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Active (${stats.active})`} />
          <Tab label={`Pending (${stats.pending})`} />
          <Tab label={`Inactive (${stats.inactive})`} />
        </Tabs>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Volunteer</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Hours Logged</TableCell>
              <TableCell>Events</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVolunteers.map((volunteer) => (
              <React.Fragment key={volunteer._id}>
                <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleRowExpand(volunteer._id)}>
                      {expandedRow === volunteer._id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        src={volunteer.profilePicture || undefined}
                        sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}
                      >
                        {(volunteer.name || volunteer.email || '?').charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight="500">{volunteer.name || 'Unknown'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                      {volunteer.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {volunteer.phone ? (
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {volunteer.phone}
                      </Typography>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={volunteer.volunteer_status || 'N/A'} 
                      color={getStatusColor(volunteer.volunteer_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {volunteer.hoursLogged || 0}h
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {volunteer.eventsAttended || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {volunteer.createdAt ? dayjs(volunteer.createdAt).format('MMM D, YYYY') : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleOpenDialog(volunteer)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={expandedRow === volunteer._id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Quick Info
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Email Verified: {volunteer.isEmailVerified ? '✅ Yes' : '❌ No'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Account Active: {volunteer.isActive ? '✅ Yes' : '❌ No'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Last Login: {volunteer.lastLogin ? dayjs(volunteer.lastLogin).format('MMM D, YYYY h:mm A') : 'Never'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
            {!loading && filteredVolunteers.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary">No volunteers found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Volunteer Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Volunteer Details</Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedVolunteer && (
            <Box>
              {/* Basic Info */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar
                    src={selectedVolunteer.profilePicture || undefined}
                    sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                  >
                    {selectedVolunteer.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedVolunteer.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedVolunteer.email}</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{selectedVolunteer.phone || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={selectedVolunteer.volunteer_status || 'N/A'} 
                      color={getStatusColor(selectedVolunteer.volunteer_status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Hours Logged</Typography>
                    <Typography variant="h6" color="primary.main">{selectedVolunteer.hoursLogged || 0}h</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Events Attended</Typography>
                    <Typography variant="h6" color="success.main">{selectedVolunteer.eventsAttended || 0}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Events List */}
              {loadingDetails ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <>
                  {/* Events Section */}
                  {volunteerDetails?.events && volunteerDetails.events.length > 0 ? (
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" gutterBottom>Registered Events</Typography>
                      <List>
                        {volunteerDetails.events.map((event, idx) => (
                          <React.Fragment key={event._id}>
                            <ListItem>
                              <ListItemText
                                primary={
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Event fontSize="small" />
                                    <Typography variant="body1">{event.title}</Typography>
                                  </Stack>
                                }
                                secondary={
                                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                                      {dayjs(event.dateTime?.start).format('MMM D, YYYY h:mm A')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                                      {event.location?.address || 'Location TBD'}
                                    </Typography>
                                    <Chip 
                                      label={event.status} 
                                      size="small" 
                                      sx={{ mt: 0.5 }}
                                    />
                                  </Stack>
                                }
                              />
                            </ListItem>
                            {idx < volunteerDetails.events.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Paper>
                  ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>No events registered yet</Alert>
                  )}

                  {/* Reports/Work Section */}
                  {(volunteerDetails?.reportsSubmitted && volunteerDetails.reportsSubmitted.length > 0) || 
                   (volunteerDetails?.reportsResolved && volunteerDetails.reportsResolved.length > 0) ? (
                    <>
                      {/* Reports Submitted by Volunteer */}
                      {volunteerDetails?.reportsSubmitted && volunteerDetails.reportsSubmitted.length > 0 && (
                        <Paper sx={{ p: 2, mb: 2 }}>
                          <Typography variant="h6" gutterBottom>Issues Reported by Volunteer</Typography>
                          
                          {/* Report Stats */}
                          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                            <Chip 
                              icon={<Assignment />}
                              label={`Total Submitted: ${volunteerDetails.reportStats.totalSubmitted || 0}`}
                              variant="outlined"
                              size="small"
                            />
                            <Chip 
                              icon={<PlayArrow />}
                              label={`In Progress: ${volunteerDetails.reportStats['in-progress'] || 0}`}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                            <Chip 
                              icon={<Done />}
                              label={`Resolved: ${volunteerDetails.reportStats.resolved || 0}`}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                            <Chip 
                              icon={<ErrorOutline />}
                              label={`Open: ${volunteerDetails.reportStats.open || 0}`}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>

                          <List>
                            {volunteerDetails.reportsSubmitted.map((report, idx) => {
                              const getReportStatusIcon = (status) => {
                                switch(status) {
                                  case 'resolved': return <Done fontSize="small" sx={{ color: 'success.main' }} />
                                  case 'in-progress': return <PlayArrow fontSize="small" sx={{ color: 'warning.main' }} />
                                  case 'open': return <HourglassEmpty fontSize="small" sx={{ color: 'info.main' }} />
                                  case 'rejected': return <ErrorOutline fontSize="small" sx={{ color: 'error.main' }} />
                                  default: return <Assignment fontSize="small" />
                                }
                              }

                              const getReportStatusColor = (status) => {
                                switch(status) {
                                  case 'resolved': return 'success'
                                  case 'in-progress': return 'warning'
                                  case 'open': return 'info'
                                  case 'rejected': return 'error'
                                  default: return 'default'
                                }
                              }

                              return (
                                <React.Fragment key={report._id}>
                                  <ListItem>
                                    <ListItemText
                                      primary={
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                          {getReportStatusIcon(report.status)}
                                          <Typography variant="body1" fontWeight="500">{report.title}</Typography>
                                        </Stack>
                                      }
                                      secondary={
                                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                                          <Typography variant="body2" color="text.secondary">
                                            {report.description}
                                          </Typography>
                                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                            <Chip 
                                              label={`Category: ${report.category}`}
                                              size="small"
                                              variant="outlined"
                                            />
                                            <Chip 
                                              label={`Priority: ${report.priority}`}
                                              size="small"
                                              variant="outlined"
                                            />
                                            <Chip 
                                              label={report.status} 
                                              size="small"
                                              color={getReportStatusColor(report.status)}
                                            />
                                          </Stack>
                                          <Typography variant="caption" color="text.secondary">
                                            Reported: {dayjs(report.createdAt).format('MMM D, YYYY h:mm A')}
                                          </Typography>
                                        </Stack>
                                      }
                                    />
                                  </ListItem>
                                  {idx < volunteerDetails.reportsSubmitted.length - 1 && <Divider />}
                                </React.Fragment>
                              )
                            })}
                          </List>
                        </Paper>
                      )}

                      {/* Reports Resolved/Worked On by Volunteer */}
                      {volunteerDetails?.reportsResolved && volunteerDetails.reportsResolved.length > 0 && (
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle color="success" />
                            Issues Resolved by Volunteer
                          </Typography>
                          
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip 
                              icon={<Done />}
                              label={`Total Resolved: ${volunteerDetails.reportStats.totalResolved || 0}`}
                              size="small"
                              color="success"
                            />
                          </Stack>

                          <List>
                            {volunteerDetails.reportsResolved.map((report, idx) => (
                              <React.Fragment key={report._id}>
                                <ListItem>
                                  <ListItemText
                                    primary={
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <Done fontSize="small" sx={{ color: 'success.main' }} />
                                        <Typography variant="body1" fontWeight="500">{report.title}</Typography>
                                      </Stack>
                                    }
                                    secondary={
                                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          {report.description}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                          <Chip 
                                            label={`Reported by: ${report.userId?.name || 'Unknown'}`}
                                            size="small"
                                            variant="outlined"
                                          />
                                          <Chip 
                                            label={`Category: ${report.category}`}
                                            size="small"
                                            variant="outlined"
                                          />
                                          <Chip 
                                            label={`Priority: ${report.priority}`}
                                            size="small"
                                            variant="outlined"
                                          />
                                          <Chip 
                                            label="Resolved" 
                                            size="small"
                                            color="success"
                                          />
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">
                                          Resolved: {dayjs(report.resolvedAt).format('MMM D, YYYY h:mm A')}
                                        </Typography>
                                      </Stack>
                                    }
                                  />
                                </ListItem>
                                {idx < volunteerDetails.reportsResolved.length - 1 && <Divider />}
                              </React.Fragment>
                            ))}
                          </List>
                        </Paper>
                      )}
                    </>
                  ) : (
                    <Alert severity="info">No reports submitted or resolved yet</Alert>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminVolunteers
