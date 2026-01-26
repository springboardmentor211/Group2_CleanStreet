import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material'
import {
  ThumbUp,
  ThumbDown,
  Visibility,
  CalendarToday
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

const Reports = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [votingStates, setVotingStates] = useState({}) // Track vote status per report

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
        // Fetch vote status for each report
        response.data.reports.forEach(report => {
          fetchVoteStatus(report._id)
        })
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

  const fetchVoteStatus = async (reportId) => {
    if (!isAuthenticated) return
    
    try {
      const response = await axios.get(`/api/reports/${reportId}/vote`, {
        withCredentials: true
      })
      
      if (response.data.success) {
        setVotingStates(prev => ({
          ...prev,
          [reportId]: response.data.vote
        }))
      }
    } catch (err) {
      console.error('Fetch vote status error:', err)
    }
  }

  const handleVote = async (reportId, voteType) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-reports' } })
      return
    }

    try {
      const response = await axios.post(
        `/api/reports/${reportId}/vote`,
        { voteType },
        { withCredentials: true }
      )

      if (response.data.success) {
        // Update local state with new vote counts and user's vote
        setReports(prevReports => 
          prevReports.map(report => {
            if (report._id === reportId) {
              return {
                ...report,
                upvotes: response.data.upvotes,
                downvotes: response.data.downvotes
              }
            }
            return report
          })
        )

        setVotingStates(prev => ({
          ...prev,
          [reportId]: response.data.userVote
        }))
      }
    } catch (err) {
      console.error('Vote error:', err)
      const errorMsg = err.response?.data?.error || 'Failed to record vote'
      alert(errorMsg)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      received: 'info',
      in_review: 'warning',
      'in-progress': 'warning',
      resolved: 'success',
      rejected: 'error'
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status) => {
    const labels = {
      received: 'Received',
      in_review: 'In Review',
      'in-progress': 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected'
    }
    return labels[status] || status
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
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={getCategoryLabel(report.category)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={getStatusLabel(report.status)}
                        size="small"
                        color={getStatusColor(report.status)}
                        variant="filled"
                      />
                      <Chip
                        label={report.priority}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {report.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Tooltip title="Upvote">
                      <IconButton
                        size="small"
                        onClick={() => handleVote(report._id, 'upvote')}
                        color={votingStates[report._id] === 'upvote' ? 'primary' : 'default'}
                        sx={{
                          bgcolor: votingStates[report._id] === 'upvote' ? 'primary.light' : 'transparent'
                        }}
                      >
                        <ThumbUp fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="body2" sx={{ alignSelf: 'center', minWidth: 24 }}>
                      {report.upvotes || 0}
                    </Typography>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <Tooltip title="Downvote">
                      <IconButton
                        size="small"
                        onClick={() => handleVote(report._id, 'downvote')}
                        color={votingStates[report._id] === 'downvote' ? 'error' : 'default'}
                        sx={{
                          bgcolor: votingStates[report._id] === 'downvote' ? 'error.light' : 'transparent'
                        }}
                      >
                        <ThumbDown fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="body2" sx={{ alignSelf: 'center', minWidth: 24 }}>
                      {report.downvotes || 0}
                    </Typography>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Visibility fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {report.views || 0}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
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
    </Container>
  )
}

export default Reports

