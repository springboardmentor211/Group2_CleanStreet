import { Container, Box, Typography, Paper } from '@mui/material'

function Contact() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight={800} color="primary" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          We’re here to help. Reach out with questions, feedback, or partnership ideas.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h6" fontWeight={700}>General Inquiries</Typography>
          <Typography variant="body1" color="text.secondary">
            Email: support@cleanstreet.example
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Phone: +1 (555) 123-4567
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Address: 123 City Lane, Urban District, Metropolis
          </Typography>
        </Box>
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        For urgent public safety issues, please contact local authorities directly.
      </Typography>
    </Container>
  )
}

export default Contact
