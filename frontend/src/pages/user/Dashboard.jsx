import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { redirectToSubdomain } from '../../utils/subdomain'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  alpha,
  Fade,
  Zoom
} from '@mui/material'
import {
  Person,
  Email,
  Report,
  VerifiedUser,
  HowToReg,
  Comment,
  ThumbUp,
  Add,
  Edit,
  Visibility,
  TrendingUp,
  Notifications,
  Security,
  Badge,
  Refresh,
  LocationOn,
  CleanHands,
  Timeline,
  BugReport,
  CheckCircle,
  Warning,
  ArrowForward,
  TrendingUp as TrendingUpIcon,
  BarChart,
  Insights
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import axios from 'axios'

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`
    : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
  }
}))

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette[color].dark, 0.15)} 0%, ${alpha(theme.palette[color].dark, 0.05)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette[color].light, 0.2)} 0%, ${alpha(theme.palette[color].light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette[color].main, 0.15)}`,
  }
}))

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '16px 24px',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
    '&::before': {
      transform: 'translateX(100%)',
    }
  }
}))

const Dashboard = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    complaintsReported: 0,
    complaintsResolved: 0,
    votesGiven: 0,
    commentsMade: 0,
    communityScore: 0,
    recentActivity: []
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const [monthlyStats, setMonthlyStats] = useState({
    reports: Array(12).fill(0),
    resolutions: Array(12).fill(0),
    engagement: Array(12).fill(0)
  })

  // Fetch user statistics
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true)
      try {
        const res = await axios.get('/api/reports/my-reports', { withCredentials: true })
        const reports = res.data?.reports || []

        const reported = reports.length
        const resolved = reports.filter(r => r.status === 'resolved').length
        const votes = reports.reduce((sum, r) => sum + (r.upvotes || 0), 0)
        const comments = user?.stats?.commentsMade || 0 // comments not returned in my-reports payload

        const recentActivity = reports
          .slice(0, 5)
          .map((r, idx) => ({
            id: r._id || idx,
            type: 'complaint',
            action: r.status === 'resolved' ? 'resolved' : 'reported',
            title: r.title,
            time: new Date(r.createdAt).toLocaleString(),
            status: r.status
          }))

        // Build monthly aggregates for last 12 months
        const now = new Date()
        const reportsByMonth = Array(12).fill(0)
        const resolvedByMonth = Array(12).fill(0)
        const engagementByMonth = Array(12).fill(0)

        reports.forEach((r) => {
          const created = new Date(r.createdAt)
          const monthDiff = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth())
          if (monthDiff >= 0 && monthDiff < 12) {
            const idx = 11 - monthDiff
            reportsByMonth[idx] += 1
            engagementByMonth[idx] += (r.views || 0) + (r.upvotes || 0)
          }

          if (r.status === 'resolved' && r.resolvedAt) {
            const resolvedDate = new Date(r.resolvedAt)
            const diff = (now.getFullYear() - resolvedDate.getFullYear()) * 12 + (now.getMonth() - resolvedDate.getMonth())
            if (diff >= 0 && diff < 12) {
              const idx = 11 - diff
              resolvedByMonth[idx] += 1
            }
          }
        })

        const communityScore = reported === 0
          ? 0
          : Math.min(Math.round((resolved / reported) * 100 + (votes + comments) / 2), 100)

        setStats({
          complaintsReported: reported,
          complaintsResolved: resolved,
          votesGiven: votes,
          commentsMade: comments,
          communityScore,
          recentActivity,
        })

        setMonthlyStats({
          reports: reportsByMonth,
          resolutions: resolvedByMonth,
          engagement: engagementByMonth,
        })
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err)
        setStats((prev) => ({ ...prev }))
      } finally {
        setLoadingStats(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user, refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleReportComplaint = () => {
    navigate('/report-issue')
  }

  const handleViewComplaints = () => {
    navigate('/my-reports')
  }

  const handleEditProfile = () => {
    navigate('/profile')
  }

  const calculateResolutionRate = () => {
    if (stats.complaintsReported === 0) return 0
    return Math.round((stats.complaintsResolved / stats.complaintsReported) * 100)
  }

  const getStatusColor = (status) => {
    const colors = {
      'Verified': 'success',
      'Unverified': 'warning',
      'resolved': 'success',
      'pending': 'warning',
      'active': 'info'
    }
    return colors[status] || 'default'
  }

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'error',
      'superadmin': 'warning',
      'moderator': 'warning',
      'user': 'primary',
      'citizen': 'success'
    }
    return colors[role?.toLowerCase()] || 'default'
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
        {/* Header with Welcome and Stats */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ 
              background: `linear-gradient(45deg, ${alpha('#000', 0.9)}, ${alpha('#000', 0.7)})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              Welcome back, <Box component="span" sx={{ color: 'primary.main' }}>{user?.name}!</Box>
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Track your civic contributions and community impact
            </Typography>
          </Box>
          
          {/* Quick Stats Banner */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha('#1976d2', 0.05)} 0%, ${alpha('#2196f3', 0.05)} 100%)`,
              border: `1px solid ${alpha('#1976d2', 0.1)}`
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {stats.communityScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Community Score
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {calculateResolutionRate()}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolution Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="info.main">
                    {stats.complaintsReported}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Issues Reported
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="warning.main">
                    {stats.votesGiven + stats.commentsMade}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Engagements
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CleanHands /> Quick Actions
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <ActionButton
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={handleReportComplaint}
                    >
                      Report Issue
                    </ActionButton>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <ActionButton
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<Visibility />}
                      onClick={handleViewComplaints}
                    >
                      View Reports
                    </ActionButton>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <ActionButton
                      fullWidth
                      variant="outlined"
                      color="warning"
                      startIcon={<LocationOn />}
                      onClick={() => navigate('/community')}
                    >
                      Community
                    </ActionButton>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <ActionButton
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      startIcon={<TrendingUpIcon />}
                      onClick={() => navigate('/analytics')}
                    >
                      Analytics
                    </ActionButton>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <ActionButton
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={handleEditProfile}
                    >
                      Edit Profile
                    </ActionButton>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Detailed Stats Cards */}
          {[
            {
              title: 'Issues Reported',
              value: stats.complaintsReported,
              icon: <BugReport sx={{ fontSize: 32 }} />,
              color: 'primary',
              progress: 70,
              description: 'Total issues reported',
              trend: '+12% from last month'
            },
            {
              title: 'Issues Resolved',
              value: stats.complaintsResolved,
              icon: <CheckCircle sx={{ fontSize: 32 }} />,
              color: 'success',
              progress: calculateResolutionRate(),
              description: 'Successfully resolved',
              trend: calculateResolutionRate() > 50 ? '+8% efficiency' : 'Needs improvement'
            },
            {
              title: 'Community Engagement',
              value: stats.votesGiven + stats.commentsMade,
              icon: <ThumbUp sx={{ fontSize: 32 }} />,
              color: 'info',
              progress: Math.min(100, (stats.votesGiven + stats.commentsMade) / 2),
              description: 'Votes & Comments',
              trend: '+24% activity'
            },
            {
              title: 'Response Rate',
              value: '92%',
              icon: <HowToReg sx={{ fontSize: 32 }} />,
              color: 'warning',
              progress: 92,
              description: 'Average response time',
              trend: '3.2 days avg.'
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in style={{ transitionDelay: `${index * 100}ms` }}>
                <StatCard color={stat.color}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                          {loadingStats ? (
                            <CircularProgress size={24} />
                          ) : (
                            stat.value
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        background: alpha(stat.color === 'primary' ? '#1976d2' : 
                                  stat.color === 'success' ? '#2e7d32' :
                                  stat.color === 'info' ? '#0288d1' : '#ed6c02', 0.1)
                      }}>
                        {stat.icon}
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {stat.description}
                      </Typography>
                      <Typography variant="caption" color={stat.color} sx={{ display: 'block', fontWeight: 600 }}>
                        {stat.trend}
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={stat.progress}
                      color={stat.color}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                        }
                      }}
                    />
                  </CardContent>
                </StatCard>
              </Zoom>
            </Grid>
          ))}

          {/* Recent Activity */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timeline /> Recent Activity
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/activity')}
                  >
                    View All
                  </Button>
                </Box>
                
                <Stack spacing={2}>
                  {loadingStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    stats.recentActivity.map((activity, index) => (
                      <Fade in key={activity.id} style={{ transitionDelay: `${index * 100}ms` }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: alpha('#1976d2', 0.03),
                            border: `1px solid ${alpha('#1976d2', 0.1)}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: alpha('#1976d2', 0.08),
                              transform: 'translateX(4px)',
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{
                              bgcolor: activity.type === 'complaint' ? 'primary.main' :
                                      activity.type === 'comment' ? 'info.main' : 'success.main',
                              width: 40,
                              height: 40
                            }}>
                              {activity.type === 'complaint' && <BugReport />}
                              {activity.type === 'comment' && <Comment />}
                              {activity.type === 'vote' && <ThumbUp />}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                You {activity.action} {activity.type}: <Box component="span" fontWeight="bold">{activity.title}</Box>
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {activity.time}
                                </Typography>
                                <Chip
                                  label={activity.status}
                                  size="small"
                                  color={getStatusColor(activity.status)}
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      </Fade>
                    ))
                  )}
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Monthly Overview */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChart /> Monthly Overview
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: alpha('#1976d2', 0.05) }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Reports Trend
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        +{Math.max(...monthlyStats.reports) - Math.min(...monthlyStats.reports)}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        ↗ Increased this month
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: alpha('#2e7d32', 0.05) }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Resolution Rate
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {calculateResolutionRate()}%
                      </Typography>
                      <Typography variant="caption" color={calculateResolutionRate() > 50 ? 'success.main' : 'warning.main'}>
                        {calculateResolutionRate() > 50 ? '✓ Above average' : '⚠ Needs improvement'}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: alpha('#0288d1', 0.05) }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Engagement Score
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.communityScore}
                      </Typography>
                      <Typography variant="caption" color="info.main">
                        {stats.communityScore > 70 ? '🌟 Excellent' : 'Good'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>
    </motion.div>
  )
}

export default Dashboard