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
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Slider,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material'
import {
  Map as MapIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  MyLocation as MyLocationIcon,
  Layers as LayersIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  GpsFixed as GpsFixedIcon
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

const VolunteerMap = () => {
  const { user } = useAuth()
  const [filterAnchor, setFilterAnchor] = useState(null)
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    status: 'all',
    dateRange: 'all',
    radius: 5
  })

  // Mock map data - in real app, this would come from API
  const zoneIssues = [
    {
      id: 1,
      title: 'Pothole - Main Street',
      category: 'pothole',
      priority: 'high',
      status: 'assigned',
      coordinates: { lat: 18.5204, lng: 73.8567 },
      address: 'Main Street & Oak Ave',
      assignedTo: 'You',
      distance: '0.5 km'
    },
    {
      id: 2,
      title: 'Garbage Dump',
      category: 'garbage',
      priority: 'medium',
      status: 'unassigned',
      coordinates: { lat: 18.5210, lng: 73.8575 },
      address: 'Central Park West',
      assignedTo: null,
      distance: '1.2 km'
    },
    {
      id: 3,
      title: 'Broken Streetlight',
      category: 'streetlight',
      priority: 'low',
      status: 'in-progress',
      coordinates: { lat: 18.5198, lng: 73.8580 },
      address: 'Pine Street Corner',
      assignedTo: 'John Doe',
      distance: '0.8 km'
    },
    {
      id: 4,
      title: 'Water Leak',
      category: 'water',
      priority: 'high',
      status: 'assigned',
      coordinates: { lat: 18.5220, lng: 73.8550 },
      address: 'Elm Street',
      assignedTo: 'You',
      distance: '1.5 km'
    },
    {
      id: 5,
      title: 'Illegal Parking',
      category: 'other',
      priority: 'medium',
      status: 'unassigned',
      coordinates: { lat: 18.5180, lng: 73.8570 },
      address: 'Market Square',
      assignedTo: null,
      distance: '2.0 km'
    }
  ]

  const zoneStats = {
    totalIssues: 24,
    assignedToYou: 3,
    highPriority: 5,
    completedThisWeek: 8,
    zoneArea: '15 sq km'
  }

  const categories = [
    { value: 'all', label: 'All Categories', color: '#757575' },
    { value: 'pothole', label: 'Potholes', color: '#FF9800' },
    { value: 'garbage', label: 'Garbage', color: '#4CAF50' },
    { value: 'streetlight', label: 'Streetlights', color: '#2196F3' },
    { value: 'water', label: 'Water Issues', color: '#00BCD4' },
    { value: 'other', label: 'Other', color: '#9C27B0' }
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336'
      case 'medium': return '#FF9800'
      case 'low': return '#4CAF50'
      default: return '#757575'
    }
  }

  const getStatusIcon = (status, assignedTo) => {
    if (assignedTo === 'You') return <GpsFixedIcon fontSize="small" />
    if (status === 'assigned') return <AssignmentIcon fontSize="small" />
    if (status === 'in-progress') return <WarningIcon fontSize="small" />
    return <CheckCircleIcon fontSize="small" />
  }

  const filteredIssues = zoneIssues.filter(issue => {
    if (filters.category !== 'all' && issue.category !== filters.category) return false
    if (filters.priority !== 'all' && issue.priority !== filters.priority) return false
    if (filters.status !== 'all' && issue.status !== filters.status) return false
    return true
  })

  const handleFilterClick = (event) => {
    setFilterAnchor(event.currentTarget)
  }

  const handleFilterClose = () => {
    setFilterAnchor(null)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      priority: 'all',
      status: 'all',
      dateRange: 'all',
      radius: 5
    })
  }

  const handleIssueSelect = (issueId) => {
    alert(`Selected issue ${issueId}. In real app, would zoom to location.`)
    // TODO: Implement map zoom and selection
  }

  const handleNavigateToIssue = (issueId) => {
    alert(`Navigating to issue ${issueId}`)
    // TODO: Implement navigation
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Zone Map
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and navigate to issues in your assigned zone: <strong>{user?.zone || 'Your Zone'}</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleFilterClick}
            >
              Filters
            </Button>
          </Box>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={handleFilterClose}
          PaperProps={{
            sx: { width: 300, p: 2 }
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Filter Issues
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
              Category
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {categories.map(cat => (
                <Chip
                  key={cat.value}
                  label={cat.label}
                  size="small"
                  variant={filters.category === cat.value ? 'filled' : 'outlined'}
                  onClick={() => handleFilterChange('category', cat.value)}
                  sx={{ 
                    borderColor: cat.color,
                    bgcolor: filters.category === cat.value ? cat.color : 'transparent',
                    color: filters.category === cat.value ? 'white' : cat.color,
                    '&:hover': {
                      bgcolor: `${cat.color}20`
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
              Priority
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['all', 'high', 'medium', 'low'].map(priority => (
                <Chip
                  key={priority}
                  label={priority === 'all' ? 'All' : priority}
                  size="small"
                  variant={filters.priority === priority ? 'filled' : 'outlined'}
                  onClick={() => handleFilterChange('priority', priority)}
                  sx={{ 
                    borderColor: getPriorityColor(priority),
                    bgcolor: filters.priority === priority ? getPriorityColor(priority) : 'transparent',
                    color: filters.priority === priority ? 'white' : getPriorityColor(priority)
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
              Status
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
              Search Radius: {filters.radius} km
            </Typography>
            <Slider
              value={filters.radius}
              onChange={(e, value) => handleFilterChange('radius', value)}
              min={1}
              max={20}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleFilterClose} size="small">
              Cancel
            </Button>
            <Button 
              onClick={handleFilterClose} 
              variant="contained" 
              size="small"
            >
              Apply
            </Button>
          </Box>
        </Menu>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Map Stats and Controls */}
        <Grid item xs={12} md={4}>
          {/* Zone Stats */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon />
              Zone Statistics
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', border: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                      {zoneStats.totalIssues}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Issues
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', border: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      {zoneStats.assignedToYou}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Assigned to You
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'rgba(244, 67, 54, 0.1)', border: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                      {zoneStats.highPriority}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Priority
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', border: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {zoneStats.completedThisWeek}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed This Week
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography variant="body2" color="text.secondary">
                Zone Area: <strong>{zoneStats.zoneArea}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your Location: <strong>{user?.location || 'Not specified'}</strong>
              </Typography>
            </Box>
          </Paper>

          {/* Map Controls */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapIcon />
              Map Controls
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<MyLocationIcon />}
                onClick={() => alert('Centering on your location')}
              >
                Center on My Location
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LayersIcon />}
                onClick={() => alert('Toggling layers')}
              >
                Toggle Layers
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ZoomInIcon />}
                  onClick={() => alert('Zoom in')}
                >
                  Zoom In
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ZoomOutIcon />}
                  onClick={() => alert('Zoom out')}
                >
                  Zoom Out
                </Button>
              </Box>
              
              <TextField
                fullWidth
                placeholder="Search for address or place..."
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Paper>

          {/* Legend */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Map Legend
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {categories.slice(1).map(cat => (
                <Box key={cat.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    bgcolor: cat.color,
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                  <Typography variant="body2">
                    {cat.label}
                  </Typography>
                </Box>
              ))}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <GpsFixedIcon sx={{ color: '#2196F3' }} />
                <Typography variant="body2">
                  Assigned to you
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon sx={{ color: '#FF9800' }} />
                <Typography variant="body2">
                  Assigned to others
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ color: '#4CAF50' }} />
                <Typography variant="body2">
                  In progress
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Map Visualization and Issue List */}
        <Grid item xs={12} md={8}>
          {/* Map Visualization (Mock) */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            height: 400, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: '#e3f2fd',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Mock Map Points */}
            {filteredIssues.map((issue, index) => (
              <Box
                key={issue.id}
                sx={{
                  position: 'absolute',
                  left: `${30 + (index * 15)}%`,
                  top: `${40 + (index * 10)}%`,
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    zIndex: 2
                  }
                }}
                onClick={() => handleIssueSelect(issue.id)}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: categories.find(c => c.value === issue.category)?.color || '#757575',
                    border: `3px solid ${issue.assignedTo === 'You' ? '#2196F3' : 'white'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {getStatusIcon(issue.status, issue.assignedTo)}
                  
                  {/* Pulse animation for high priority */}
                  {issue.priority === 'high' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(244, 67, 54, 0.3)',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(0.8)', opacity: 0.7 },
                          '50%': { transform: 'scale(1.2)', opacity: 0.3 },
                          '100%': { transform: 'scale(0.8)', opacity: 0.7 }
                        }
                      }}
                    />
                  )}
                </Box>
                
                {/* Tooltip on hover */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    mt: 1,
                    p: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    minWidth: 200,
                    display: 'none',
                    '&:hover': { display: 'block' }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {issue.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {issue.address}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip label={issue.priority} size="small" />
                    <Chip label={issue.distance} size="small" variant="outlined" />
                  </Box>
                </Box>
              </Box>
            ))}

            {/* Mock Map Controls */}
            <Box sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              bgcolor: 'white',
              p: 1,
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <IconButton size="small" onClick={() => alert('Zoom in')}>
                <ZoomInIcon />
              </IconButton>
              <IconButton size="small" onClick={() => alert('Zoom out')}>
                <ZoomOutIcon />
              </IconButton>
              <IconButton size="small" onClick={() => alert('My location')}>
                <MyLocationIcon />
              </IconButton>
            </Box>

            {/* Map Title */}
            <Typography variant="h5" sx={{ 
              position: 'absolute', 
              top: 16, 
              left: 16,
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              {user?.zone || 'Your Zone'} Map
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              Interactive Zone Map - {filteredIssues.length} issues visible
              <br />
              <Typography variant="caption">
                (In a real application, this would show an interactive map with actual locations)
              </Typography>
            </Typography>
          </Paper>

          {/* Issue List */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Issues in Your Zone ({filteredIssues.length})
            </Typography>
            
            {filteredIssues.length === 0 ? (
              <Alert severity="info">
                No issues found with current filters. Try changing your filter settings.
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredIssues.map((issue) => (
                  <Paper 
                    key={issue.id}
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: issue.assignedTo === 'You' ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
                      borderLeft: `4px solid ${categories.find(c => c.value === issue.category)?.color || '#757575'}`
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {issue.title}
                        </Typography>
                        <Chip 
                          label={issue.priority}
                          size="small"
                          sx={{ 
                            bgcolor: getPriorityColor(issue.priority),
                            color: 'white'
                          }}
                        />
                        {issue.assignedTo === 'You' && (
                          <Chip 
                            label="Assigned to you"
                            size="small"
                            color="primary"
                            variant="outlined"
                            icon={<GpsFixedIcon />}
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {issue.address} • {issue.distance} away
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={issue.category}
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          label={issue.status}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<LocationIcon />}
                        onClick={() => handleNavigateToIssue(issue.id)}
                        variant="outlined"
                      >
                        Navigate
                      </Button>
                      {issue.assignedTo === 'You' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleNavigateToIssue(issue.id)}
                        >
                          Go to Task
                        </Button>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default VolunteerMap