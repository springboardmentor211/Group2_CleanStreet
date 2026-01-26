import { Container, Box, Typography } from '@mui/material'

function About() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight={800} color="primary" gutterBottom>
          About Us
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Our mission is to make cities cleaner, safer, and more livable
          through community-powered reporting and action.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 3 }}>
        <Typography variant="h5" component="h2" fontWeight={700}>
          Our Mission
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Clean Street empowers citizens to report issues like potholes, broken lights,
          waste management, and other public concerns. By connecting communities with
          local authorities, we help accelerate fixes and improve urban life.
        </Typography>

        <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4 }}>
          How It Works
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Anyone can report issues publicly. Registered users can track reports,
          get updates, and see resolution history. Administrators coordinate and
          prioritize fixes to keep neighborhoods running smoothly.
        </Typography>
      </Box>
    </Container>
  )
}

export default About
