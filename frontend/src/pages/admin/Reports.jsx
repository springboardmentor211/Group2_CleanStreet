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
  Button,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material'
import { Refresh, Room, Flag, MoreVert, PersonAdd, CheckCircle } from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const statusOptions = [
  { value: 'received', label: 'Received', color: 'info' },
  { value: 'in_review', label: 'In Review', color: 'warning' },
  { value: 'in-progress', label: 'In Progress', color: 'warning' },
  { value: 'resolved', label: 'Resolved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' }
]

const AdminReports = () => {
  const [reports, setReports] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState({})

  const fetchReports = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get('/reports', { params: { limit: 100 } })
      setReports(res.data.reports || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const fetchVolunteers = async () => {
    try {
      const res = await apiClient.get('/reports/volunteers')
      if (res.data.success) {
        setVolunteers(res.data.volunteers || [])
      }
    } catch (err) {
      console.error('Failed to fetch volunteers:', err)
    }
  }

  useEffect(() => {
    fetchReports()
    fetchVolunteers()
  }, [])

  const handleMenuOpen = (event, report) => {
    setAnchorEl(event.currentTarget)
    setSelectedReport(report)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedReport(null)
  }

  const handleStatusChange = async (newStatus) => {
    if (!selectedReport) return

    setUpdatingStatus(prev => ({ ...prev, [selectedReport._id]: true }))

    try {
      const res = await apiClient.put(`/reports/${selectedReport._id}/status`, {
        status: newStatus
      })

      if (res.data.success) {
        setReports(prevReports =>
          prevReports.map(r =>
            r._id === selectedReport._id ? { ...r, status: newStatus } : r
          )
        )
        toast.success(`Status updated to ${getStatusLabel(newStatus)}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status')
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [selectedReport._id]: false }))
      handleMenuClose()
    }
  }

  const handleAssignOpen = () => {
    setAssignDialogOpen(true)
    setSelectedVolunteer('')
    handleMenuClose()
  }

  const handleAssign = async () => {
    if (!selectedReport || !selectedVolunteer) return

    setAssigning(true)
    try {
      const res = await apiClient.put(`/reports/${selectedReport._id}/assign`, {
        assignedTo: selectedVolunteer
      })

      if (res.data.success) {
        setReports(prevReports =>
          prevReports.map(r =>
            r._id === selectedReport._id ? { ...r, assignedTo: res.data.report.assignedTo } : r
          )
        )
        toast.success('Report assigned successfully')
        setAssignDialogOpen(false)
        setSelectedReport(null)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign report')
    } finally {
      setAssigning(false)
    }
  }

  const getStatusColor = (status) => {
    const option = statusOptions.find(s => s.value === status)
    return option?.color || 'default'
  }

  const getStatusLabel = (status) => {
    const option = statusOptions.find(s => s.value === status)
    return option?.label || status
  }

  const getVolunteerName = (volunteerId) => {
    const volunteer = volunteers.find(v => v._id === volunteerId)
    return volunteer?.name || 'Unknown'
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Reports</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchReports} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">{report.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {report.description?.slice(0, 60)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip icon={<Flag sx={{ fontSize: 16 }} />} label={report.category} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(report.status)}
                    color={getStatusColor(report.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.priority || 'medium'}
                    color={report.priority === 'high' || report.priority === 'critical' ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {report.assignedTo ? (
                    <Chip
                      icon={<PersonAdd sx={{ fontSize: 16 }} />}
                      label={getVolunteerName(report.assignedTo)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">Unassigned</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Room sx={{ fontSize: 16, color: 'text.secondary' }} />
                    {report.address?.slice(0, 30) || '—'}
                    {report.address?.length > 30 && '...'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, report)}
                    disabled={updatingStatus[report._id]}
                  >
                    {updatingStatus[report._id] ? (
                      <CircularProgress size={20} />
                    ) : (
                      <MoreVert />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">No reports found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem disabled><Typography variant="caption" color="text.secondary">Change Status</Typography></MenuItem>
        {statusOptions.map((status) => (
          <MenuItem
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            selected={selectedReport?.status === status.value}
          >
            <Chip
              label={status.label}
              color={status.color}
              size="small"
              sx={{ mr: 1 }}
            />
          </MenuItem>
        ))}
        <MenuItem onClick={handleAssignOpen} disabled={volunteers.length === 0}>
          <PersonAdd sx={{ mr: 1 }} fontSize="small" />
          Assign to Volunteer
        </MenuItem>
      </Menu>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select a volunteer or admin to assign this report to:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
              label="Assign To"
            >
              {volunteers.map((volunteer) => (
                <MenuItem key={volunteer._id} value={volunteer._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{volunteer.name}</Typography>
                    <Chip label={volunteer.role} size="small" sx={{ fontSize: '0.7rem' }} />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)} disabled={assigning}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedVolunteer || assigning}
            startIcon={assigning ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {assigning ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminReports

