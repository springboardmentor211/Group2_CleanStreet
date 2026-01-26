import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  alpha,
  Stack,
  Tooltip
} from '@mui/material'
import {
  BugReport,
  CheckCircle,
  Comment,
  ThumbUp,
  Edit,
  Delete,
  Visibility,
  AccessTime,
  TrendingUp,
  Warning,
  Info,
  LocationOn,
  Timeline as TimelineIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { styled } from '@mui/material/styles'

const ActivityCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`
    : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
  }
}))

const Activity = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, reports, comments, votes

  useEffect(() => {
    fetchActivities()
  }, [filter])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      // Fetch user's reports
      const reportsRes = await axios.get('/api/reports/my-reports', {
        withCredentials: true
      })

      // Extract reports array from response
      const reports = reportsRes.data?.reports || reportsRes.data || []

      // Transform reports into activity items
      const reportActivities = reports.map(report => ({
        id: `report-${report._id}`,
        type: 'report',
        action: report.status === 'resolved' ? 'resolved' : 'created',
        title: report.title,
        description: report.description,
        category: report.category,
        status: report.status,
        location: report.address,
        timestamp: report.createdAt,
        icon: report.status === 'resolved' ? CheckCircle : BugReport,
        color: report.status === 'resolved' ? 'success' : 'primary'
      }))

      // Sort by timestamp
      const allActivities = [...reportActivities].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )

      setActivities(allActivities)
    } catch (err) {
      console.error('Failed to fetch activities', err)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (activity) => {
    const IconComponent = activity.icon
    return (
      <Avatar
        sx={{
          bgcolor: alpha(
            activity.color === 'success' ? '#4caf50' : 
            activity.color === 'warning' ? '#ff9800' : '#1976d2',
            0.1
          ),
          color: activity.color === 'success' ? '#4caf50' : 
                 activity.color === 'warning' ? '#ff9800' : '#1976d2',
          width: 48,
          height: 48
        }}
      >
        <IconComponent />
      </Avatar>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      resolved: 'success',
      pending: 'warning',
      'in-progress': 'info',
      open: 'primary'
    }
    return colors[status] || 'default'
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            Recent Activity
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track all your actions and contributions to the community
          </Typography>
        </Box>

        {/* Filter Chips */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              label="All Activity"
              color={filter === 'all' ? 'primary' : 'default'}
              onClick={() => setFilter('all')}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label="Reports"
              color={filter === 'reports' ? 'primary' : 'default'}
              onClick={() => setFilter('reports')}
              icon={<BugReport />}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label="Comments"
              color={filter === 'comments' ? 'primary' : 'default'}
              onClick={() => setFilter('comments')}
              icon={<Comment />}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label="Votes"
              color={filter === 'votes' ? 'primary' : 'default'}
              onClick={() => setFilter('votes')}
              icon={<ThumbUp />}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Paper>

        {/* Activity Timeline */}
        <Grid container spacing={3}>
          {activities.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                <TimelineIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No activity yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start reporting issues to see your activity here
                </Typography>
              </Paper>
            </Grid>
          ) : (
            activities.map((activity, index) => (
              <Grid item xs={12} key={activity.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ActivityCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {getActivityIcon(activity)}
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {activity.action === 'created' ? 'Reported Issue' : 'Issue Resolved'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTime sx={{ fontSize: 16 }} />
                                {formatTimestamp(activity.timestamp)}
                              </Typography>
                            </Box>
                            <Chip
                              label={activity.status}
                              color={getStatusColor(activity.status)}
                              size="small"
                              sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                            />
                          </Box>

                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {activity.title}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {activity.description?.substring(0, 150)}
                            {activity.description?.length > 150 ? '...' : ''}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Chip
                              label={activity.category}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: 'capitalize' }}
                            />
                            <Chip
                              icon={<LocationOn sx={{ fontSize: 16 }} />}
                              label={activity.location?.substring(0, 30) || 'Location not specified'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </ActivityCard>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </motion.div>
  )
}

export default Activity
