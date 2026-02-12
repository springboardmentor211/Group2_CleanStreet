import React, { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Collapse
} from '@mui/material'
import { 
  Refresh, 
  Email, 
  Phone, 
  Security, 
  Close,
  Search,
  ExpandMore,
  ExpandLess,
  LocationOn,
  CalendarToday,
  Report,
  CheckCircle
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [userActivity, setUserActivity] = useState(null)
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [expandedRow, setExpandedRow] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get('/admin/users')
      setUsers(res.data.users || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users')
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserActivity = async (userId) => {
    setLoadingActivity(true)
    try {
      const res = await apiClient.get(`/admin/users/${userId}/activity`)
      setUserActivity(res.data)
    } catch (err) {
      console.error('Failed to fetch user activity:', err)
      toast.error('Failed to load user activity')
    } finally {
      setLoadingActivity(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleOpenDialog = async (user) => {
    setSelectedUser(user)
    setOpenDialog(true)
    await fetchUserActivity(user._id)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedUser(null)
    setUserActivity(null)
  }

  const handleRowExpand = (userId) => {
    setExpandedRow(expandedRow === userId ? null : userId)
  }

  const renderRole = (user) => (
    <Chip
      icon={<Security sx={{ fontSize: 16 }} />}
      label={user.isSuperAdmin ? 'Super Admin' : (user.role || 'User')}
      color={user.isSuperAdmin ? 'warning' : user.role === 'admin' ? 'primary' : 'default'}
      size="small"
    />
  )

  const renderStatus = (user) => (
    <Chip
      label={user.isActive ? 'Active' : 'Inactive'}
      color={user.isActive ? 'success' : 'default'}
      size="small"
    />
  )

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = tabValue === 0 ? true :
                      tabValue === 1 ? u.role === 'user' :
                      tabValue === 2 ? u.role === 'volunteer' :
                      u.role === 'admin' || u.isSuperAdmin
    
    return matchesSearch && matchesTab
  })

  const stats = {
    total: users.length,
    regularUsers: users.filter(u => u.role === 'user').length,
    volunteers: users.filter(u => u.role === 'volunteer').length,
    admins: users.filter(u => u.role === 'admin' || u.isSuperAdmin).length
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">User Management</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUsers} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Total Users</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Regular Users</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">{stats.regularUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Volunteers</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">{stats.volunteers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Admins</Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.admins}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        {/* Search Bar */}
        <TextField
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Users (${stats.regularUsers})`} />
          <Tab label={`Volunteers (${stats.volunteers})`} />
          <Tab label={`Admins (${stats.admins})`} />
        </Tabs>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <React.Fragment key={user._id}>
                <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleRowExpand(user._id)}>
                      {expandedRow === user._id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        src={user.profilePicture || undefined}
                        sx={{ bgcolor: user.isSuperAdmin ? 'warning.main' : 'primary.main', width: 32, height: 32 }}
                      >
                        {(user.name || user.email || '?').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="500">{user.name || 'Unknown'}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {user.phone ? (
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {user.phone}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>{renderRole(user)}</TableCell>
                  <TableCell>{renderStatus(user)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.createdAt ? dayjs(user.createdAt).format('MMM D, YYYY') : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleOpenDialog(user)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={expandedRow === user._id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom>Quick Info</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Email Verified: {user.isEmailVerified ? '✅ Yes' : '❌ No'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Account Active: {user.isActive ? '✅ Yes' : '❌ No'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Last Login: {user.lastLogin ? dayjs(user.lastLogin).format('MMM D, YYYY h:mm A') : 'Never'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
            {!loading && filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">No users found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* User Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">User Details</Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              {/* Basic Info */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar
                    src={selectedUser.profilePicture || undefined}
                    sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                  >
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedUser.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{selectedUser.phone || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Role</Typography>
                    {renderRole(selectedUser)}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    {renderStatus(selectedUser)}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email Verified</Typography>
                    <Typography variant="body1">{selectedUser.isEmailVerified ? '✅ Yes' : '❌ No'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Joined</Typography>
                    <Typography variant="body1">
                      {selectedUser.createdAt ? dayjs(selectedUser.createdAt).format('MMM D, YYYY') : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Last Login</Typography>
                    <Typography variant="body1">
                      {selectedUser.lastLogin ? dayjs(selectedUser.lastLogin).format('MMM D, YYYY h:mm A') : 'Never'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Activity Info */}
              {loadingActivity ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <LinearProgress sx={{ width: '100%' }} />
                </Box>
              ) : userActivity?.reports && userActivity.reports.length > 0 ? (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Recent Reports</Typography>
                  <List>
                    {userActivity.reports.map((report, idx) => (
                      <React.Fragment key={report._id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Report fontSize="small" />
                                <Typography variant="body1">{report.title}</Typography>
                              </Stack>
                            }
                            secondary={
                              <Stack spacing={0.5} sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {dayjs(report.createdAt).format('MMM D, YYYY h:mm A')}
                                </Typography>
                                <Chip 
                                  label={report.status} 
                                  size="small" 
                                  color={report.status === 'resolved' ? 'success' : 'warning'}
                                  sx={{ mt: 0.5 }}
                                />
                              </Stack>
                            }
                          />
                        </ListItem>
                        {idx < userActivity.reports.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              ) : (
                <Alert severity="info">No recent activity found</Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminUsers
