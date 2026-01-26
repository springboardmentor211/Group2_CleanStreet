import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon,
  LocationOn as LocationIcon,
  Update as UpdateIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import volunteerService from '../../services/volunteerService'
import toast from 'react-hot-toast'

const VolunteerTasksActive = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [activeTasks, setActiveTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [hoursSpent, setHoursSpent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch active tasks from API
  const fetchActiveTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await volunteerService.getActiveTasks({ limit: 20 })
      
      if (response.success) {
        setActiveTasks(response.issues || [])
      } else {
        setError(response.error || 'Failed to fetch active tasks')
      }
    } catch (error) {
      console.error('Error fetching active tasks:', error)
      setError(error.response?.data?.error || 'Failed to fetch active tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveTasks()
  }, [])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      case 'critical': return 'error'
      default: return 'default'
    }
  }

  const handleUpdateTask = (taskId) => {
    navigate(`/volunteer/issues/${taskId}`)
  }

  const handleOpenCompleteDialog = (task) => {
    setSelectedTask(task)
    setCompletionNotes('')
    setHoursSpent('')
    setCompleteDialogOpen(true)
  }

  const handleCloseCompleteDialog = () => {
    setCompleteDialogOpen(false)
    setSelectedTask(null)
    setCompletionNotes('')
    setHoursSpent('')
  }

  const handleMarkComplete = async () => {
    if (!selectedTask) return
    
    try {
      setSubmitting(true)
      
      const response = await volunteerService.markIssueComplete(selectedTask._id, {
        completionNotes,
        hoursSpent: hoursSpent ? parseFloat(hoursSpent) : undefined
      })
      
      if (response.success) {
        toast.success('Task marked as complete!')
        handleCloseCompleteDialog()
        fetchActiveTasks() // Refresh the list
      } else {
        toast.error(response.error || 'Failed to complete task')
      }
    } catch (error) {
      console.error('Error completing task:', error)
      toast.error(error.response?.data?.error || 'Failed to complete task')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate stats
  const stats = {
    totalActive: activeTasks.length,
    totalTimeSpent: activeTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0),
    dueThisWeek: activeTasks.filter(t => {
      if (!t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return dueDate >= now && dueDate <= weekFromNow
    }).length,
    highPriority: activeTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Active Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tasks currently in progress or pending action
          </Typography>
        </Box>
        <IconButton onClick={fetchActiveTasks} color="primary" title="Refresh">
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: '#2196F3' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalActive}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Tasks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TimerIcon sx={{ fontSize: 40, color: '#FF9800' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalTimeSpent}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Time Spent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.dueThisWeek}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due This Week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PriorityHighIcon sx={{ fontSize: 40, color: '#f44336' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.highPriority}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Priority
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Tasks List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : activeTasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Active Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any tasks in progress. New tasks will appear here when assigned by an admin.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {activeTasks.map((task) => (
            <Grid item xs={12} key={task._id}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {task.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={task.category}
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                        icon={<PriorityHighIcon fontSize="small" />}
                      />
                      <Chip 
                        label={task.status === 'in-progress' ? 'In Progress' : 
                               task.status === 'in_review' ? 'In Review' : task.status}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                      {task.dueDate && (
                        <Chip 
                          label={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<UpdateIcon />}
                      onClick={() => handleUpdateTask(task._id)}
                      size="small"
                    >
                      Update
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleOpenCompleteDialog(task)}
                      size="small"
                      color="success"
                    >
                      Complete
                    </Button>
                  </Box>
                </Box>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {task.description}
                </Typography>

                {/* Progress Section */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Progress: {task.progress || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={task.progress || 0} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={getPriorityColor(task.priority)}
                  />
                </Box>

                {/* Task Details */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {task.address || 'Location not specified'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        Assigned: {task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {task.assignedBy && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                          {task.assignedBy.name?.charAt(0) || 'A'}
                        </Avatar>
                        <Typography variant="body2">
                          By: {task.assignedBy.name || 'Admin'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Complete Task Dialog */}
      <Dialog open={completeDialogOpen} onClose={handleCloseCompleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Complete Task
          <IconButton onClick={handleCloseCompleteDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {selectedTask?.title}
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Completion Notes"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Describe what you did to resolve this issue..."
            sx={{ mt: 2, mb: 2 }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Hours Spent</InputLabel>
            <Select
              value={hoursSpent}
              label="Hours Spent"
              onChange={(e) => setHoursSpent(e.target.value)}
            >
              <MenuItem value="0.5">Less than 1 hour</MenuItem>
              <MenuItem value="1">1 hour</MenuItem>
              <MenuItem value="2">2 hours</MenuItem>
              <MenuItem value="3">3 hours</MenuItem>
              <MenuItem value="4">4 hours</MenuItem>
              <MenuItem value="5">5 hours</MenuItem>
              <MenuItem value="6+">More than 5 hours</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleMarkComplete} 
            variant="contained" 
            color="success"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {submitting ? 'Completing...' : 'Mark Complete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default VolunteerTasksActive
