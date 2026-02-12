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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import { Refresh, Room, Person, Email, Phone, CheckCircle, Pending, Cancel } from '@mui/icons-material'
import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const statusColor = {
  open: 'warning',
  'in-progress': 'info',
  resolved: 'success',
  rejected: 'default'
}

const VolunteerReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchReports = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get('/reports', { params: { limit: 200 } })
      setReports(res.data.reports || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const updateStatus = async (reportId, status) => {
    setUpdatingId(reportId)
    try {
      await apiClient.put(`/reports/${reportId}/status`, { status })
      await fetchReports()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const renderCoordinate = (value) => {
    if (typeof value !== 'number') return '—'
    return value.toFixed(6)
  }

  const handleViewDetails = (report) => {
    setSelectedReport(report)
    setDialogOpen(true)
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Volunteer Reports Dashboard</Typography>
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
              <TableCell>Report</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">{report.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {report.category} • {report.priority || 'medium'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Room sx={{ fontSize: 16, color: 'text.secondary' }} />
                      {report.address || '—'}
                    </Typography>
                    {report.locationDetails && (
                      <Typography variant="caption" color="text.secondary">
                        {report.locationDetails}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {renderCoordinate(report.latitude)}, {renderCoordinate(report.longitude)}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                    {report.userId?.name || '—'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{report.userId?.role || 'citizen'}</Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                      {report.userId?.email || '—'}
                    </Typography>
                    {report.userId?.phone && (
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {report.userId?.phone}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.status}
                    color={statusColor[report.status] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="info"
                      startIcon={<Pending />}
                      onClick={() => updateStatus(report._id, 'in-progress')}
                      disabled={updatingId === report._id || report.status === 'in-progress'}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => updateStatus(report._id, 'resolved')}
                      disabled={updatingId === report._id || report.status === 'resolved'}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleViewDetails(report)}
                    >
                      Details
                    </Button>
                  </Stack>
                </TableCell>
                <TableCell>{report.createdAt ? new Date(report.createdAt).toLocaleString() : '—'}</TableCell>
              </TableRow>
            ))}
            {!loading && reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">No reports found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                <Typography variant="body1">{selectedReport.title}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{selectedReport.description}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                <Typography variant="body1">{selectedReport.address}</Typography>
                {selectedReport.locationDetails && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedReport.locationDetails}
                  </Typography>
                )}
                <Typography variant="caption">
                  Coordinates: {renderCoordinate(selectedReport.latitude)}, {renderCoordinate(selectedReport.longitude)}
                </Typography>
              </Box>
              {selectedReport.images && selectedReport.images.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Images</Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {selectedReport.images.map((img, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={img.url}
                        alt={`Report ${idx + 1}`}
                        sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default VolunteerReports
