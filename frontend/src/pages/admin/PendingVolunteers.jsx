import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  TextField
} from '@mui/material'
import {
  CheckCircle,
  Close,
  HourglassEmpty,
  Person,
  Email,
  Phone,
  LocationOn,
  Verified
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const PendingVolunteers = () => {
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVolunteer, setSelectedVolunteer] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionType, setActionType] = useState('approve') // 'approve' or 'reject'

  useEffect(() => {
    fetchPendingVolunteers()
  }, [])

  const fetchPendingVolunteers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/volunteers/pending', {
        withCredentials: true
      })

      if (response.data.success) {
        setVolunteers(response.data.pendingVolunteers || [])
      }
    } catch (error) {
      toast.error('Failed to fetch pending volunteers')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (volunteer, type) => {
    setSelectedVolunteer(volunteer)
    setActionType(type)
    setRejectionReason('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedVolunteer(null)
    setRejectionReason('')
  }

  const handleApprove = async () => {
    try {
      const response = await axios.post(
        `/api/admin/volunteers/${selectedVolunteer._id}/verify`,
        {},
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success(`✅ ${selectedVolunteer.name} has been verified!`)
        setVolunteers(volunteers.filter(v => v._id !== selectedVolunteer._id))
        handleCloseDialog()
      }
    } catch (error) {
      toast.error('Failed to verify volunteer')
      console.error('Error:', error)
    }
  }

  const handleReject = async () => {
    try {
      const response = await axios.post(
        `/api/admin/volunteers/${selectedVolunteer._id}/reject`,
        { reason: rejectionReason || 'Rejected by admin' },
        { withCredentials: true }
      )

      if (response.data.success) {
        toast.success(`❌ Volunteer rejected`)
        setVolunteers(volunteers.filter(v => v._id !== selectedVolunteer._id))
        handleCloseDialog()
      }
    } catch (error) {
      toast.error('Failed to reject volunteer')
      console.error('Error:', error)
    }
  }

  const handleSubmit = () => {
    if (actionType === 'approve') {
      handleApprove()
    } else {
      handleReject()
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Pending Volunteer Verification
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and verify new volunteer registrations
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HourglassEmpty sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Pending Verification
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {volunteers.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {volunteers.length === 0 ? (
        <Alert severity="success" sx={{ textAlign: 'center', py: 3 }}>
          ✅ No pending volunteers! All volunteers have been verified.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.light' }}>
              <TableRow>
                <TableCell fontWeight="bold">Name</TableCell>
                <TableCell fontWeight="bold">Email</TableCell>
                <TableCell fontWeight="bold">Phone</TableCell>
                <TableCell fontWeight="bold">City</TableCell>
                <TableCell fontWeight="bold">Registered</TableCell>
                <TableCell fontWeight="bold" align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {volunteers.map((volunteer) => (
                <TableRow key={volunteer._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" />
                      {volunteer.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" color="action" />
                      {volunteer.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      {volunteer.phone || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {volunteer.volunteerProfile?.location?.city || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(volunteer.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleOpenDialog(volunteer, 'approve')}
                      sx={{ mr: 1 }}
                    >
                      Verify
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Close />}
                      onClick={() => handleOpenDialog(volunteer, 'reject')}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Verification Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Verify Volunteer' : 'Reject Volunteer'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedVolunteer && (
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Volunteer Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedVolunteer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedVolunteer.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {selectedVolunteer.phone || 'N/A'}
                </Typography>
              </Box>

              {actionType === 'reject' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Rejection Reason (Optional)"
                  placeholder="Explain why the volunteer is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  variant="outlined"
                />
              )}

              {actionType === 'approve' && (
                <Alert severity="info">
                  ✅ This volunteer will be marked as verified and can access all volunteer features immediately.
                </Alert>
              )}

              {actionType === 'reject' && (
                <Alert severity="warning">
                  ⚠️ This volunteer will be notified and their account will be marked as inactive.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            {actionType === 'approve' ? 'Verify' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default PendingVolunteers
