import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  VolunteerActivism as VolunteerIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import volunteerService from '../../services/volunteerService'

const VolunteerDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // State for dashboard data
  const [stats, setStats] = useState(null)
  const [assignedIssues, setAssignedIssues] = useState([])
  const [performance, setPerformance] = useState(null)
  
  // Loading states
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingIssues, setLoadingIssues] = useState(true)
  const [loadingPerformance, setLoadingPerformance] = useState(true)
  
  // Error states
  const [errorStats, setErrorStats] = useState(null)
  const [errorIssues, setErrorIssues] = useState(null)
  const [errorPerformance, setErrorPerformance] = useState(null)

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      setErrorStats(null)
      const response = await volunteerService.getDashboardStats()
      if (response.success) {
        setStats(response.stats)
      } else {
        setErrorStats(response.error || 'Failed to fetch stats')
      }
    } catch (error) {
      setErrorStats(error.message || 'Failed to fetch stats')
    } finally {
      setLoadingStats(false)
    }
  }

  // Fetch assigned issues
  const fetchAssignedIssues = async () => {
    try {
      setLoadingIssues(true)
      setErrorIssues(null)
      const response = await volunteerService.getAssignedIssues({ limit: 10 })
      if (response.success) {
        setAssignedIssues(response.issues)
      } else {
        setErrorIssues(response.error || 'Failed to fetch issues')
      }
    } catch (error) {
      setErrorIssues(error.message || 'Failed to fetch issues')
    } finally {
      setLoadingIssues(false)
    }
  }

  // Fetch performance data
  const fetchPerformance = async () => {
    try {
      setLoadingPerformance(true)
      setErrorPerformance(null)
      const response = await volunteerService.getPerformance()
      if (response.success) {
        setPerformance(response.performance)
      } else {
        setErrorPerformance(response.error || 'Failed to fetch performance')
      }
    } catch (error) {
      setErrorPerformance(error.message || 'Failed to fetch performance')
    } finally {
      setLoadingPerformance(false)
    }
  }

  // Fetch all data on component mount
  useEffect(() => {
    fetchStats()
    fetchAssignedIssues()
    fetchPerformance()
  }, [])

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'received': '#1976d2',
      'in_review': '#9c27b0',
      'in-progress': '#ff9800',
      'resolved': '#4caf50'
    }
    return colors[status] || '#757575'
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'high': { bg: '#ffebee', color: '#d32f2f' },
      'medium': { bg: '#fff3e0', color: '#f57c00' },
      'low': { bg: '#e8f5e9', color: '#388e3c' }
    }
    return colors[priority] || { bg: '#f5f5f5', color: '#757575' }
  }

  // Stats data from backend
  const statsCards = stats ? [
    { icon: <AssignmentIcon />, label: 'Assigned Issues', value: stats.assigned || 0, color: '#2196F3' },
    { icon: <CheckCircleIcon />, label: 'Completed', value: stats.completed || 0, color: '#4CAF50' },
    { icon: <ScheduleIcon />, label: 'In Progress', value: stats.inProgress || 0, color: '#FF9800' },
    { icon: <TrendingUpIcon />, label: 'Rating', value: `${stats.rating || 0}/5`, color: '#9C27B0' }
  ] : [
    { icon: <AssignmentIcon />, label: 'Assigned Issues', value: '0', color: '#2196F3' },
    { icon: <CheckCircleIcon />, label: 'Completed', value: '0', color: '#4CAF50' },
    { icon: <ScheduleIcon />, label: 'In Progress', value: '0', color: '#FF9800' },
    { icon: <TrendingUpIcon />, label: 'Rating', value: '0/5', color: '#9C27B0' }
  ]

  // Performance data from backend
  const resolutionRate = stats?.resolutionRate || 0
  const avgResponseTime = stats?.averageResolutionTime || 0
  const ratingValue = performance?.overallRating || 0

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#4CAF50', width: 64, height: 64 }}>
              <VolunteerIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Welcome, {user?.name || 'Volunteer'}!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon fontSize="small" />
                {user?.location || 'Your Area'}
              </Typography>
            </Box>
          </Box>
          <Button variant="outlined" color="error" onClick={logout}>
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loadingStats ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : errorStats ? (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setErrorStats(null)}>
              {errorStats}
            </Alert>
          </Grid>
        ) : (
          statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                borderRadius: 2,
                borderLeft: `4px solid ${stat.color}`,
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Assigned Issues */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Your Assigned Issues
        </Typography>
        
        {loadingIssues ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorIssues ? (
          <Alert severity="error" onClose={() => setErrorIssues(null)}>
            {errorIssues}
          </Alert>
        ) : assignedIssues.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {assignedIssues.map((issue) => (
              <Paper 
                key={issue._id}
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {issue.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Typography variant="caption" sx={{ 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      bgcolor: getPriorityColor(issue.priority).bg,
                      color: getPriorityColor(issue.priority).color,
                      textTransform: 'capitalize'
                    }}>
                      {issue.priority} priority
                    </Typography>
                    <Chip 
                      label={issue.status} 
                      size="small"
                      sx={{ 
                        bgcolor: getStatusColor(issue.status) + '20',
                        color: getStatusColor(issue.status),
                        textTransform: 'capitalize',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Box>
                <Button variant="contained" size="small" onClick={() => navigate(`/volunteer/issues/${issue._id}`)}>
                  View Details
                </Button>
              </Paper>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No issues assigned yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You'll see assigned issues here once an admin assigns them to you
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="contained" 
              sx={{ py: 1.5 }}
              onClick={() => fetchAssignedIssues()}
            >
              View Assigned Issues
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ py: 1.5 }}
              onClick={() => fetchStats()}
            >
              Refresh Stats
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ py: 1.5 }}
              onClick={() => fetchPerformance()}
            >
              Refresh Performance
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="outlined" 
              color="error"
              sx={{ py: 1.5 }}
              onClick={logout}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Performance Progress */}
      <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Your Performance
        </Typography>
        
        {loadingPerformance ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorPerformance ? (
          <Alert severity="error" onClose={() => setErrorPerformance(null)}>
            {errorPerformance}
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Resolution Rate</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{resolutionRate}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={resolutionRate} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Average Response Time</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{avgResponseTime} hours</Typography>
              </Box>
              {/* Cap progress at 100% (120 hours = 100%) */}
              <LinearProgress 
                variant="determinate" 
                value={Math.min((avgResponseTime / 120) * 100, 100)} 
                sx={{ height: 8, borderRadius: 4 }}
                color={avgResponseTime < 24 ? 'success' : avgResponseTime < 72 ? 'warning' : 'error'}
              />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Community Rating</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{ratingValue}/5</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={ratingValue * 20} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </>
        )}
      </Paper>
    </Container>
  )
}

export default VolunteerDashboard

