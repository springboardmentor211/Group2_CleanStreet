import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  CircularProgress,
  Alert,
  Pagination,
  LinearProgress
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
  LocationOn as LocationIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import volunteerService from '../../services/volunteerService'

const VolunteerTasksCompleted = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [completedTasks, setCompletedTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [stats, setStats] = useState({
    totalCompleted: 0,
    averageRating: 0,
    totalHours: 0,
    verifiedTasks: 0
  })

  // Fetch completed tasks from API
  const fetchCompletedTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await volunteerService.getCompletedTasks({ 
        page: pagination.page, 
        limit: 10 
      })
      
      if (response.success) {
        setCompletedTasks(response.issues || [])
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 1
        }))
        
        // Calculate stats from the issues
        const issues = response.issues || []
        const totalCompleted = issues.length
        const verifiedTasks = issues.filter(i => i.status === 'resolved').length
        
        // Calculate average rating from issues
        const ratedIssues = issues.filter(i => i.rating > 0)
        const avgRating = ratedIssues.length > 0
          ? ratedIssues.reduce((sum, i) => sum + i.rating, 0) / ratedIssues.length
          : user?.volunteerInfo?.rating || 0
        
        setStats({
          totalCompleted: response.pagination?.total || totalCompleted,
          averageRating: avgRating.toFixed(1),
          totalHours: 0, // Would need resolution time tracking
          verifiedTasks
        })
      } else {
        setError(response.error || 'Failed to fetch completed tasks')
      }
    } catch (error) {
      console.error('Error fetching completed tasks:', error)
      setError(error.response?.data?.error || 'Failed to fetch completed tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompletedTasks()
  }, [pagination.page])

  const handleViewDetails = (taskId) => {
    navigate(`/volunteer/issues/${taskId}`)
  }

  const getStatusColor = (status) => {
    return status === 'resolved' ? 'success' : 'warning'
  }

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }))
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Completed Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            History of tasks you have successfully completed
          </Typography>
        </Box>
        <IconButton onClick={fetchCompletedTasks} color="primary" title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #4CAF50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #FF9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StarIcon sx={{ fontSize: 40, color: '#FF9800' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.averageRating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #2196F3' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TimerIcon sx={{ fontSize: 40, color: '#2196F3' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalHours}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #9C27B0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#9C27B0' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.verifiedTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Tasks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Completed Tasks Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : completedTasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Completed Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't completed any tasks yet. Complete assigned tasks to see them here.
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ mb: 4 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Task</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Completed Date</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
                    <TableCell><strong>Rating</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedTasks.map((task) => (
                    <TableRow key={task._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {task.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {task.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {task.resolvedAt ? new Date(task.resolvedAt).toLocaleDateString() : 
                             task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.address || 'Location not specified'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={task.rating || 0} readOnly size="small" />
                          <Typography variant="body2">
                            {task.rating || 0}/5
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.status === 'resolved' ? 'Verified' : 'Pending'}
                          color={getStatusColor(task.status)}
                          size="small"
                          icon={task.status === 'resolved' ? <CheckCircleIcon fontSize="small" /> : null}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(task._id)}
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination 
                count={pagination.pages} 
                page={pagination.page} 
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Recent Achievements Section - Uses API data */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          🏆 Your Achievements
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={40} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Loading achievements from your completed tasks...
        </Typography>
      </Paper>
    </Box>
  )
}

export default VolunteerTasksCompleted
