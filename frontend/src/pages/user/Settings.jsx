import React from 'react'
import { Container, Paper, Typography, Box, Switch, FormControlLabel, Divider, Button } from '@mui/material'

const Settings = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Account Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your preferences and account options.
        </Typography>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <FormControlLabel control={<Switch />} label="Email notifications" />
          <FormControlLabel control={<Switch />} label="Enable location services" />
          <FormControlLabel control={<Switch />} label="Allow comments on my reports" />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">Privacy</Typography>
        <FormControlLabel control={<Switch />} label="Show profile publicly" />

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary">Save Changes</Button>
          <Button variant="outlined" color="inherit">Cancel</Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default Settings
