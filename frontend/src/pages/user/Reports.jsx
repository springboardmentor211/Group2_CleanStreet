import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CardMedia,
  Stack
} from '@mui/material'
import { Delete, Image as ImageIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const Reports = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchUserReports()
  }, [])

  const fetchUserReports = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/reports/my-reports', {
        withCredentials: true
      })

      if (response.data.success) {
        setReports(response.data.reports)
      } else {
        setError('Failed to load reports')
      }
    } catch (err) {
      console.error('Fetch reports error:', err)
      setError(err.response?.data?.error || 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      open: 'info',
      'in-progress': 'warning',
      resolved: 'success',
      rejected: 'error'
    }
    return colors[status] || 'default'
  }

  const getCategoryLabel = (category) => {
    const labels = {
      garbage: 'Garbage Dump',
      pothole: 'Pothole/Road Damage',
      water: 'Water Leakage',
      streetlight: 'Broken Light',
      park: 'Park Maintenance',
      sewage: 'Sewage Issue',
      vandalism: 'Vandalism',
      other: 'Other'
    }
    return labels[category] || category
  }

  const handleDeleteClick = (report) => {
    setReportToDelete(report)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return

    setDeleting(true)
    try {
      const response = await axios.delete(`/api/reports/${reportToDelete._id}`, {
        withCredentials: true
      })

      if (response.data.success) {
        toast.success('Report deleted successfully')
        setReports(reports.filter(r => r._id !== reportToDelete._id))
        setDeleteDialogOpen(false)
        setReportToDelete(null)
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error(err.response?.data?.error || 'Failed to delete report')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your submitted reports here.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {reports.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            You haven't submitted any reports yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/report-issue')}
            sx={{ mt: 2 }}
          >
            Submit Your First Report
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} key={report._id}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {report.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.address}
                      </Typography>
                      {report.locationDetails && (
                        <Typography variant="caption" color="text.secondary">
                          {report.locationDetails}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={getCategoryLabel(report.category)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={report.status}
                        size="small"
                        color={getStatusColor(report.status)}
                        variant="filled"
                      />
                      <Chip
                        label={report.priority}
                        size="small"
                        variant="outlined"
                      />
                      <IconButton
                        onClick={() => handleDeleteClick(report)}
                        size="small"
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {report.description}
                  </Typography>

                  {/* Display Images */}
                  {report.images && report.images.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                        {report.images.map((image, idx) => (
                          <Box
                            key={idx}
                            component="img"
                            src={image.url}
                            alt={`Report image ${idx + 1}`}
                            sx={{
                              width: 120,
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0',
                              flexShrink: 0,
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8,
                                transform: 'scale(1.05)',
                                transition: 'all 0.2s'
                              }
                            }}
                            onClick={() => window.open(image.url, '_blank')}
                          />
                        ))}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <ImageIcon sx={{ fontSize: 14 }} />
                        {report.images.length} {report.images.length === 1 ? 'image' : 'images'} attached
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 4, mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Views
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {report.views}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Upvotes
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {report.upvotes}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Submitted
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Report?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this report? This action cannot be undone.
            {reportToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {reportToDelete.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {reportToDelete.address}
                </Typography>
                {reportToDelete.locationDetails && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {reportToDelete.locationDetails}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Reports

