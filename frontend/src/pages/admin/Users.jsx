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
  Button
} from '@mui/material'
import { Refresh, Email, Phone, Security } from '@mui/icons-material'
import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get('/admin/users')
      setUsers(res.data.users || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Users</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUsers} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ bgcolor: user.isSuperAdmin ? 'warning.main' : 'primary.main', width: 32, height: 32 }}>
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
                <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</TableCell>
              </TableRow>
            ))}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">No users found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}

export default AdminUsers
