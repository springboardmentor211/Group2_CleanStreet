import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  Visibility as ViewIcon,
  Update as UpdateIcon,
  PriorityHigh as PriorityHighIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import volunteerService from '../../services/volunteerService'

const VolunteerIssues = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch issues from API
  const fetchIssues = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: pagination.page,
        limit: 10
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      
      if (priorityFilter !== 'all') {
        params.priority = priorityFilter
      }

      const response = await volunteerService.getAssignedIssues(params)
      
      if (response.success) {
        setIssues(response.issues || [])
        setStats(response.counts || {})
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 1
        }))
      } else {
        setError(response.error || 'Failed to fetch issues')
      }
    } catch (error) {
      console.error('Error fetching issues:', error)
      setError(error.response?.data?.error || 'Failed to fetch issues. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchIssues()
  }, [statusFilter, priorityFilter])

  // Filter issues by search (client-side for immediate feedback)
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title?.toLowerCase().includes(search.toLowerCase()) ||
      issue.address?.toLowerCase().includes(search.toLowerCase()) ||
      issue.category?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      case 'critical': return 'error'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return 'info'
      case 'in_review': return 'secondary'
      case 'in-progress': return 'warning'
      case 'resolved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      'received': 'Received',
      'in_review': 'In Review',
      'in-progress': 'In Progress',
      'resolved': 'Resolved',
      'rejected': 'Rejected'
    }
    return labels[status] || status
  }

  const handleViewDetails = (id) => {
    navigate(`/volunteer/issues/${id}`)
  }

  const handleUpdateStatus = (id) => {
    navigate(`/volunteer/issues/${id}`)
  }

  const handleRefresh = () => {
    fetchIssues()
  }

  // Calculate stats from fetched data
  const totalAssigned = stats?.byStatus?.received || 0 + 
                        stats?.byStatus?.in_review || 0 + 
                        stats?.byStatus?.['in-progress'] || 0
  const inProgress = stats?.byStatus?.['in-progress'] || 0
  const completed = stats?.byStatus?.resolved || 0
  const highPriority = stats?.byPriority?.high || 0 + 
                       stats?.byPriority?.critical || 0

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Assigned Issues
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and update issues assigned to you
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} color="primary" title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid #2196F3',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: '#2196F3' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {totalAssigned}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Assigned
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid #FF9800',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon sx={{ fontSize: 40, color: '#FF9800' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inProgress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid #4CAF50',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderLeft: '4px solid #f44336',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PriorityHighIcon sx={{ fontSize: 40, color: '#f44336' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {highPriority}
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

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search issues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="received">Received</MenuItem>
            <MenuItem value="in_review">In Review</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(e) => {
              setPriorityFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
          >
            <MenuItem value="all">All Priority</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          variant={statusFilter === 'all' && priorityFilter === 'all' ? 'contained' : 'outlined'}
          onClick={() => {
            setStatusFilter('all')
            setPriorityFilter('all')
            setPagination(prev => ({ ...prev, page: 1 }))
          }}
          size="small"
        >
          Clear Filters
        </Button>
      </Paper>

      {/* Issues Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredIssues.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          {issues.length === 0 
            ? 'No issues assigned yet. Issues will appear here when an admin assigns them to you.'
            : 'No issues match your search criteria.'}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Issue</strong></TableCell>
                <TableCell><strong>Priority</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Progress</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow key={issue._id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {issue.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 300
                      }}>
                        {issue.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Assigned: {issue.assignedAt ? new Date(issue.assignedAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={issue.priority} 
                      color={getPriorityColor(issue.priority)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(issue.status)} 
                      color={getStatusColor(issue.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {issue.address || 'Location not specified'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={issue.progress || 0} 
                          sx={{ height: 6, borderRadius: 3 }}
                          color={getStatusColor(issue.status)}
                        />
                      </Box>
                      <Typography variant="body2">
                        {issue.progress || 0}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewDetails(issue._id)}
                        variant="outlined"
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<UpdateIcon />}
                        onClick={() => handleUpdateStatus(issue._id)}
                        variant="contained"
                        color="primary"
                      >
                        Update
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination Info */}
      {pagination.total > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredIssues.length} of {pagination.total} issues
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default VolunteerIssues
