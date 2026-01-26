import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  VolunteerActivism as VolunteerIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import volunteerService from '../../services/volunteerService'

const VolunteerPerformance = () => {
  const { user } = useAuth()
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch performance from API
  const fetchPerformance = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await volunteerService.getPerformance()
      
      if (response.success) {
        setPerformance(response.performance || {})
      } else {
        setError(response.error || 'Failed to fetch performance data')
      }
    } catch (error) {
      console.error('Error fetching performance:', error)
      setError(error.response?.data?.error || 'Failed to fetch performance data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformance()
  }, [])

  // Use API data or fallback to user context
  const performanceData = performance || {
    overallRating: user?.volunteerInfo?.rating || 0,
    totalCompleted: user?.volunteerInfo?.completedReports || 0,
    averageResolutionTime: user?.volunteerInfo?.averageResolutionTime || 0,
    monthlyStats: [],
    categoryStats: [],
    recentActivity: []
  }

  const monthlyStats = performanceData.monthlyStats || []
  const categoryStats = performanceData.categoryStats || []
  const recentActivity = performanceData.recentActivity || []

  // Calculate resolution rate from completed/total
  const totalAssigned = performanceData.totalCompleted // Simplified
  const resolutionRate = totalAssigned > 0 ? Math.min(Math.round((performanceData.totalCompleted / Math.max(totalAssigned, 1)) * 100), 100) : 0

  // Calculate monthly target progress
  const monthlyTarget = 20 // Example target
  const currentMonth = performanceData.totalCompleted || 0
  const monthlyProgress = Math.min((currentMonth / monthlyTarget) * 100, 100)

  const performanceCards = [
    {
      title: 'Overall Rating',
      value: (performanceData.overallRating || 0).toFixed(1),
      unit: '/5',
      icon: <StarIcon sx={{ fontSize: 40, color: '#FF9800' }} />,
      color: '#FFF3E0',
      progress: (performanceData.overallRating || 0) * 20
    },
    {
      title: 'Completed Tasks',
      value: performanceData.totalCompleted || 0,
      unit: 'tasks',
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      color: '#E8F5E9',
      progress: Math.min((performanceData.totalCompleted || 0) * 2, 100)
    },
    {
      title: 'Resolution Rate',
      value: resolutionRate,
      unit: '%',
      icon: <TimelineIcon sx={{ fontSize: 40, color: '#2196F3' }} />,
      color: '#E3F2FD',
      progress: resolutionRate
    },
    {
      title: 'Avg Response Time',
      value: Math.round(performanceData.averageResolutionTime || 0),
      unit: 'hrs',
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#9C27B0' }} />,
      color: '#F3E5F5',
      progress: performanceData.averageResolutionTime < 24 ? 85 : performanceData.averageResolutionTime < 72 ? 50 : 25
    }
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Performance Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your volunteer performance and statistics
          </Typography>
        </Box>
        <IconButton 
          onClick={fetchPerformance} 
          color="primary" 
          title="Refresh"
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Performance Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {performanceCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      {card.icon}
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {card.value}
                      <Typography component="span" variant="h6" color="text.secondary">
                        {card.unit}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {card.title}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={card.progress} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Monthly Progress */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon />
                  Monthly Performance Trend
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Monthly Target Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {currentMonth}/{monthlyTarget} tasks
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={monthlyProgress} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                {monthlyStats.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Month</strong></TableCell>
                          <TableCell><strong>Completed Tasks</strong></TableCell>
                          <TableCell><strong>Average Rating</strong></TableCell>
                          <TableCell><strong>Performance</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {monthlyStats.map((stat, index) => (
                          <TableRow key={index}>
                            <TableCell>{stat._id?.month}/{stat._id?.year}</TableCell>
                            <TableCell>{stat.count}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">
                                  {(stat.avgRating || 0).toFixed(1)}/5
                                </Typography>
                                <StarIcon sx={{ fontSize: 16, color: '#FF9800' }} />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <LinearProgress 
                                variant="determinate" 
                                value={(stat.avgRating || 0) * 20} 
                                sx={{ height: 6, borderRadius: 3, width: 100 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No monthly statistics available yet. Complete more tasks to see your performance trends.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentTurnedInIcon />
                  Recent Task Ratings
                </Typography>

                {recentActivity.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recentActivity.slice(0, 5).map((task, index) => (
                      <Box key={task._id || index} sx={{ 
                        p: 2, 
                        borderRadius: 1, 
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {task.title || 'Task'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ fontSize: 16, color: '#FF9800' }} />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {task.rating || '-'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}
                          </Typography>
                          <Chip 
                            label={task.category || task.status} 
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent activity yet.
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Community Feedback
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {(performanceData.overallRating || 0).toFixed(1)}/5
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Based on {performanceData.totalCompleted || 0} completed tasks
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Category Stats */}
          {categoryStats.length > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Performance by Category
              </Typography>
              <Grid container spacing={2}>
                {categoryStats.map((cat, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                      border: '1px solid rgba(0, 0, 0, 0.08)'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                          {cat._id || 'Unknown'}
                        </Typography>
                        <Chip 
                          label={`${cat.count || 0} tasks`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Avg Rating: {(cat.avgRating || 0).toFixed(1)}/5
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(cat.avgRating || 0) * 20} 
                          sx={{ height: 6, borderRadius: 3, width: 100 }}
                          color={(cat.avgRating || 0) >= 4 ? 'success' : (cat.avgRating || 0) >= 3 ? 'warning' : 'error'}
                        />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Performance Tips */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Tips to Improve Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📝 Update Regularly
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Keep task status updated for accurate tracking
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ⏱️ Quick Response
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Respond to new assignments within 24 hours
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📸 Add Photos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Include before/after photos for better verification
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, bgcolor: 'rgba(156, 39, 176, 0.1)', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    💬 Provide Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add detailed comments when completing tasks
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  )
}

export default VolunteerPerformance
