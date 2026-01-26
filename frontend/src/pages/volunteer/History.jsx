import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarMonth as CalendarIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import volunteerService from '../../services/volunteerService'

const VolunteerHistory = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [stats, setStats] = useState({
    totalTasks: 0,
    totalHours: 0,
    avgRating: 0,
    categories: 0
  })

  const categories = ['all', 'garbage', 'pothole', 'streetlight', 'drainage', 'vandalism', 'infrastructure', 'park', 'water', 'sewage', 'other']

  // Fetch history from API
  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page,
        limit: 10
      }
      
      if (categoryFilter !== 'all') {
        params.category = categoryFilter
      }

      const response = await volunteerService.getHistory(params)
      
      if (response.success) {
        setHistoryData(response.history || [])
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 1
        }))
        
        // Calculate stats from user profile
        setStats({
          totalTasks: user?.volunteerInfo?.completedReports || 0,
          totalHours: user?.volunteerInfo?.averageResolutionTime 
            ? Math.round(user.volunteerInfo.averageResolutionTime * (user?.volunteerInfo?.completedReports || 0))
            : 0,
          avgRating: user?.volunteerInfo?.rating || 0,
          categories: categories.length - 1 // Exclude 'all'
        })
      } else {
        setError(response.error || 'Failed to fetch history')
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      setError(error.response?.data?.error || 'Failed to fetch history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [page, categoryFilter])

  const filteredData = historyData.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.address?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const getCategoryColor = (category) => {
    const colors = {
      garbage: 'success',
      pothole: 'error',
      streetlight: 'warning',
      drainage: 'info',
      vandalism: 'secondary',
      infrastructure: 'primary',
      park: 'success',
      water: 'info',
      sewage: 'warning',
      other: 'default'
    }
    return colors[category] || 'default'
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleRefresh = () => {
    fetchHistory()
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Task History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete history of all tasks you've worked on
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} color="primary" title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TimelineIcon sx={{ fontSize: 40, color: '#2196F3' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
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
                <CalendarIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#FF9800' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.avgRating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Rating
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
                <CategoryIcon sx={{ fontSize: 40, color: '#9C27B0' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.categories}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Categories
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search tasks or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPage(1)
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearch('')
                setCategoryFilter('all')
                setPage(1)
              }}
              size="small"
            >
              Clear Filters
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => alert('Export functionality would be implemented here')}
              size="small"
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* History Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredData.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TimelineIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Task History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {historyData.length === 0 
              ? "You haven't completed any tasks yet."
              : 'No tasks match your search criteria.'}
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ mb: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Task</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Rating</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description?.substring(0, 100)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.category}
                        color={getCategoryColor(item.category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : 
                           item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 
                           item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status === 'resolved' ? 'Completed' : item.status}
                        color={item.status === 'resolved' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.address || 'Location not specified'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {[...Array(5)].map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: i < (item.rating || 0) ? '#FFD700' : '#E0E0E0'
                            }}
                          />
                        ))}
                        <Typography variant="body2">
                          {(item.rating || 0)}/5
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={pagination.pages} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Pagination Info */}
      {pagination.total > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredData.length} of {pagination.total} tasks
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default VolunteerHistory
