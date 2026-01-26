import React from 'react'
import { Container, Typography, Box, Paper } from '@mui/material'

const History = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Activity History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your activity history and contributions.
        </Typography>
        <Box sx={{ mt: 4 }}>
          {/* History list will go here */}
        </Box>
      </Paper>
    </Container>
  )
}

export default History
