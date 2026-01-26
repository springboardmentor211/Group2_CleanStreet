import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  alpha,
  Chip,
  Divider
} from '@mui/material'
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  Assessment,
  Timeline,
  CheckCircle,
  BugReport,
  ThumbUp,
  Comment,
  LocalFireDepartment
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { styled } from '@mui/material/styles'

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette[color].dark, 0.15)} 0%, ${alpha(theme.palette[color].dark, 0.05)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette[color].light, 0.2)} 0%, ${alpha(theme.palette[color].light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette[color].main, 0.15)}`,
  }
}))

const Analytics = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    resolutionRate: 0,
    avgResponseTime: 0,
    categoryBreakdown: [],
    monthlyTrends: [],
    engagement: {
      votes: 0,
      comments: 0,
      views: 0
    },
    topCategories: [],
    recentPerformance: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/reports/my-reports', {
        withCredentials: true
      })

      // Extract reports array from response
      const reports = response.data?.reports || response.data || []

      // Calculate analytics
      const totalReports = reports.length
      const resolvedReports = reports.filter(r => r.status === 'resolved').length
      const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'open').length
      const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0

      // Category breakdown
      const categoryCount = {}
      reports.forEach(report => {
        categoryCount[report.category] = (categoryCount[report.category] || 0) + 1
      })

      const categoryBreakdown = Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalReports) * 100)
      })).sort((a, b) => b.count - a.count)

      // Monthly trends (last 6 months)
      const monthlyData = {}
      reports.forEach(report => {
        const month = new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        monthlyData[month] = (monthlyData[month] || 0) + 1
      })

      const monthlyTrends = Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      })).slice(-6)

      // Engagement metrics
      const engagement = {
        votes: reports.reduce((sum, r) => sum + (r.upvotes || 0), 0),
        comments: reports.reduce((sum, r) => sum + (r.comments?.length || 0), 0),
        views: reports.reduce((sum, r) => sum + (r.views || 0), 0)
      }

      setAnalytics({
        totalReports,
        resolvedReports,
        pendingReports,
        resolutionRate,
        avgResponseTime: 3.5, // Mock data
        categoryBreakdown,
        monthlyTrends,
        engagement,
        topCategories: categoryBreakdown.slice(0, 3),
        recentPerformance: reports.slice(0, 5).map(r => ({
          title: r.title,
          status: r.status,
          date: r.createdAt
        }))
      })
    } catch (err) {
      console.error('Failed to fetch analytics', err)
    } finally {
      setLoading(false)
    }
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
            <Assessment sx={{ fontSize: 40, color: 'primary.main' }} />
            Analytics & Insights
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Detailed analysis of your civic contributions and impact
          </Typography>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard color="primary">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <BugReport sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Chip label="+12%" size="small" color="success" icon={<TrendingUp />} />
                </Box>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {analytics.totalReports}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reports
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard color="success">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                  <Chip label={`${analytics.resolutionRate}%`} size="small" color="success" />
                </Box>
                <Typography variant="h3" fontWeight="bold" color="success.main">
                  {analytics.resolvedReports}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved Issues
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard color="info">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <ThumbUp sx={{ fontSize: 40, color: 'info.main' }} />
                  <Chip label="+24%" size="small" color="success" icon={<TrendingUp />} />
                </Box>
                <Typography variant="h3" fontWeight="bold" color="info.main">
                  {analytics.engagement.votes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Community Votes
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard color="warning">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Comment sx={{ fontSize: 40, color: 'warning.main' }} />
                  <Chip label="+8%" size="small" color="success" icon={<TrendingUp />} />
                </Box>
                <Typography variant="h3" fontWeight="bold" color="warning.main">
                  {analytics.engagement.comments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comments Made
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Category Breakdown */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart />
                Reports by Category
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box>
                {analytics.categoryBreakdown.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No data available
                  </Typography>
                ) : (
                  analytics.categoryBreakdown.map((item, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                          {item.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.count} ({item.percentage}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha('#1976d2', 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${alpha('#1976d2', 0.8)}, ${alpha('#2196f3', 0.8)})`
                          }
                        }}
                      />
                    </Box>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Monthly Trends */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline />
                Monthly Activity Trends
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box>
                {analytics.monthlyTrends.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No data available
                  </Typography>
                ) : (
                  analytics.monthlyTrends.map((item, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="600">
                          {item.month}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.count} reports
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((item.count / Math.max(...analytics.monthlyTrends.map(m => m.count))) * 100, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha('#4caf50', 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${alpha('#4caf50', 0.8)}, ${alpha('#8bc34a', 0.8)})`
                          }
                        }}
                      />
                    </Box>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Performance Insights */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalFireDepartment />
                Performance Insights
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {analytics.resolutionRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Resolution Rate
                    </Typography>
                    <Chip
                      label={analytics.resolutionRate > 50 ? 'Excellent' : 'Needs Improvement'}
                      size="small"
                      color={analytics.resolutionRate > 50 ? 'success' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {analytics.avgResponseTime}d
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                    <Chip
                      label="Fast"
                      size="small"
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {Math.round((analytics.engagement.votes + analytics.engagement.comments) / Math.max(analytics.totalReports, 1))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Engagement/Report
                    </Typography>
                    <Chip
                      label="Active"
                      size="small"
                      color="info"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {analytics.pendingReports}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Reports
                    </Typography>
                    <Chip
                      label={analytics.pendingReports > 5 ? 'High' : 'Normal'}
                      size="small"
                      color={analytics.pendingReports > 5 ? 'warning' : 'default'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </motion.div>
  )
}

export default Analytics
