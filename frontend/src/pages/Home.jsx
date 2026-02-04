// import React from 'react'
// import { 
//   Container, Typography, Button, Box, Grid, Paper, 
//   Card, CardContent, CardActions, Fade, Zoom, Grow,
//   Avatar, Chip, Stack, Divider
// } from '@mui/material'
// import { Link } from 'react-router-dom'
// import LocationOnIcon from '@mui/icons-material/LocationOn'
// import ReportIcon from '@mui/icons-material/Report'
// import TrackChangesIcon from '@mui/icons-material/TrackChanges'
// import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
// import CheckCircleIcon from '@mui/icons-material/CheckCircle'
// import TrendingUpIcon from '@mui/icons-material/TrendingUp'
// import GroupsIcon from '@mui/icons-material/Groups'
// import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
// import { keyframes } from '@emotion/react'

// // Animation keyframes
// const floatAnimation = keyframes`
//   0%, 100% { transform: translateY(0px); }
//   50% { transform: translateY(-10px); }
// `

// const pulseAnimation = keyframes`
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.7; }
// `

// const Home = () => {
//   const features = [
//     {
//       icon: <ReportIcon sx={{ fontSize: 48 }} />,
//       title: 'Report Issues',
//       description: 'Easily report civic issues with photos, location, and detailed descriptions.',
//       color: '#FF6B6B',
//       stats: '10K+ Issues Reported'
//     },
//     {
//       icon: <TrackChangesIcon sx={{ fontSize: 48 }} />,
//       title: 'Track Progress',
//       description: 'Real-time updates and notifications on complaint resolution status.',
//       color: '#4ECDC4',
//       stats: '85% Resolution Rate'
//     },
//     {
//       icon: <VolunteerActivismIcon sx={{ fontSize: 48 }} />,
//       title: 'Community Power',
//       description: 'Collaborate, vote, and work together with neighbors and local authorities.',
//       color: '#FFD166',
//       stats: '50K+ Active Users'
//     },
//     {
//       icon: <LocationOnIcon sx={{ fontSize: 48 }} />,
//       title: 'Smart Routing',
//       description: 'Automatic routing to relevant authorities based on location and issue type.',
//       color: '#06D6A0',
//       stats: '24h Response Time'
//     }
//   ]

//   const recentIssues = [
//     { id: 1, title: 'Garbage cleared in Central Park', type: 'Sanitation', time: '2 hours ago', votes: 45 },
//     { id: 2, title: 'Pothole fixed on Main Street', type: 'Infrastructure', time: '5 hours ago', votes: 32 },
//     { id: 3, title: 'Street light repaired in Downtown', type: 'Electricity', time: '1 day ago', votes: 28 },
//     { id: 4, title: 'Park bench installed near Library', type: 'Public Amenities', time: '2 days ago', votes: 19 }
//   ]

//   const stats = [
//     { value: '50,000+', label: 'Active Citizens', icon: <GroupsIcon /> },
//     { value: '95%', label: 'Satisfaction Rate', icon: <EmojiEventsIcon /> },
//     { value: '30+', label: 'Cities Covered', icon: <LocationOnIcon /> },
//     { value: '2M+', label: 'Issues Resolved', icon: <CheckCircleIcon /> }
//   ]

//   return (
//     <Box sx={{ overflow: 'hidden' }}>
//       {/* Hero Section with gradient */}
//       <Box
//         sx={{
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           color: 'white',
//           py: { xs: 6, md: 12 },
//           position: 'relative',
//           overflow: 'hidden'
//         }}
//       >
//         {/* Animated background elements */}
//         <Box
//           sx={{
//             position: 'absolute',
//             top: -100,
//             right: -100,
//             width: 400,
//             height: 400,
//             borderRadius: '50%',
//             background: 'rgba(255,255,255,0.1)',
//             animation: `${floatAnimation} 20s ease-in-out infinite`
//           }}
//         />
//         <Box
//           sx={{
//             position: 'absolute',
//             bottom: -50,
//             left: -50,
//             width: 300,
//             height: 300,
//             borderRadius: '50%',
//             background: 'rgba(255,255,255,0.05)',
//             animation: `${floatAnimation} 15s ease-in-out infinite reverse`
//           }}
//         />

//         <Container maxWidth="lg">
//           <Grid container spacing={6} alignItems="center">
//             <Grid item xs={12} md={7}>
//               <Fade in timeout={1000}>
//                 <Box>
//                   <Chip 
//                     label="Join 50,000+ Active Citizens" 
//                     sx={{ 
//                       bgcolor: 'rgba(255,255,255,0.2)', 
//                       color: 'white',
//                       mb: 3,
//                       animation: `${pulseAnimation} 2s infinite`
//                     }}
//                     icon={<TrendingUpIcon />}
//                   />
//                   <Typography 
//                     variant="h1" 
//                     component="h1" 
//                     gutterBottom 
//                     sx={{ 
//                       fontWeight: 800,
//                       fontSize: { xs: '2.5rem', md: '3.5rem' },
//                       lineHeight: 1.2
//                     }}
//                   >
//                     Transform Your
//                     <Box component="span" sx={{ color: '#FFD166', display: 'block' }}>
//                       Neighborhood Together
//                     </Box>
//                   </Typography>
//                   <Typography 
//                     variant="h5" 
//                     gutterBottom 
//                     sx={{ 
//                       opacity: 0.9, 
//                       mb: 4,
//                       fontSize: { xs: '1.1rem', md: '1.5rem' }
//                     }}
//                   >
//                     Report civic issues, track resolutions, and collaborate with your community 
//                     to create cleaner, safer spaces for everyone.
//                   </Typography>
//                   <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
//                     <Zoom in timeout={1200} style={{ transitionDelay: '200ms' }}>
//                       <Button
//                         component={Link}
//                         to="/register"
//                         variant="contained"
//                         size="large"
//                         sx={{
//                           bgcolor: '#FFD166',
//                           color: 'black',
//                           px: 4,
//                           py: 1.5,
//                           borderRadius: 2,
//                           fontWeight: 600,
//                           '&:hover': { 
//                             bgcolor: '#FFC233',
//                             transform: 'translateY(-2px)',
//                             boxShadow: '0 8px 25px rgba(255, 209, 102, 0.4)'
//                           },
//                           transition: 'all 0.3s ease'
//                         }}
//                       >
//                         Start Reporting Now
//                       </Button>
//                     </Zoom>
//                     <Zoom in timeout={1200} style={{ transitionDelay: '400ms' }}>
//                       <Button
//                         component={Link}
//                         to="/login"
//                         variant="outlined"
//                         size="large"
//                         sx={{
//                           borderColor: 'rgba(255,255,255,0.3)',
//                           color: 'white',
//                           px: 4,
//                           py: 1.5,
//                           borderRadius: 2,
//                           '&:hover': { 
//                             borderColor: 'white',
//                             bgcolor: 'rgba(255,255,255,0.1)',
//                             transform: 'translateY(-2px)'
//                           },
//                           transition: 'all 0.3s ease'
//                         }}
//                       >
//                         Sign In to Account
//                       </Button>
//                     </Zoom>
//                   </Stack>
//                 </Box>
//               </Fade>
//             </Grid>
//             <Grid item xs={12} md={5}>
//               <Grow in timeout={1500}>
//                 <Paper
//                   sx={{
//                     p: 4,
//                     bgcolor: 'rgba(255,255,255,0.15)',
//                     backdropFilter: 'blur(20px)',
//                     borderRadius: 4,
//                     border: '1px solid rgba(255,255,255,0.2)',
//                     boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
//                     position: 'relative',
//                     overflow: 'hidden'
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       position: 'absolute',
//                       top: 0,
//                       left: 0,
//                       right: 0,
//                       height: 4,
//                       background: 'linear-gradient(90deg, #FFD166, #06D6A0)'
//                     }}
//                   />
//                   <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
//                     🎉 Recently Resolved
//                   </Typography>
//                   <Stack spacing={3}>
//                     {recentIssues.map((issue) => (
//                       <Box 
//                         key={issue.id}
//                         sx={{ 
//                           p: 2,
//                           borderRadius: 2,
//                           bgcolor: 'rgba(255,255,255,0.1)',
//                           transition: 'all 0.3s ease',
//                           '&:hover': {
//                             bgcolor: 'rgba(255,255,255,0.2)',
//                             transform: 'translateX(5px)'
//                           }
//                         }}
//                       >
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
//                           <Avatar sx={{ 
//                             width: 32, 
//                             height: 32, 
//                             bgcolor: 'rgba(255,255,255,0.2)',
//                             fontSize: '0.8rem'
//                           }}>
//                             {issue.votes}
//                           </Avatar>
//                           <Chip 
//                             label={issue.type} 
//                             size="small" 
//                             sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
//                           />
//                         </Box>
//                         <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
//                           {issue.title}
//                         </Typography>
//                         <Typography variant="caption" sx={{ opacity: 0.8 }}>
//                           {issue.time} • {issue.votes} votes
//                         </Typography>
//                       </Box>
//                     ))}
//                   </Stack>
//                 </Paper>
//               </Grow>
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>

//       {/* Stats Section */}
//       <Container maxWidth="lg" sx={{ py: 8, mt: -4 }}>
//         <Paper
//           sx={{
//             p: { xs: 3, md: 4 },
//             borderRadius: 4,
//             boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
//             bgcolor: 'white'
//           }}
//         >
//           <Grid container spacing={3}>
//             {stats.map((stat, index) => (
//               <Grid item xs={6} md={3} key={index}>
//                 <Grow in timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
//                   <Box sx={{ textAlign: 'center' }}>
//                     <Box sx={{ 
//                       display: 'inline-flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       width: 64,
//                       height: 64,
//                       borderRadius: '50%',
//                       bgcolor: 'primary.light',
//                       color: 'primary.main',
//                       mb: 2
//                     }}>
//                       {stat.icon}
//                     </Box>
//                     <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
//                       {stat.value}
//                     </Typography>
//                     <Typography color="text.secondary">
//                       {stat.label}
//                     </Typography>
//                   </Box>
//                 </Grow>
//               </Grid>
//             ))}
//           </Grid>
//         </Paper>
//       </Container>

//       {/* Features Section */}
//       <Container maxWidth="lg" sx={{ py: 10 }}>
//         <Box sx={{ textAlign: 'center', mb: 8 }}>
//           <Typography variant="h2" gutterBottom sx={{ fontWeight: 800 }}>
//             How Clean Street Works
//           </Typography>
//           <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
//             A simple, powerful platform connecting citizens with local authorities
//           </Typography>
//         </Box>
        
//         <Grid container spacing={4}>
//           {features.map((feature, index) => (
//             <Grid item xs={12} sm={6} md={4} key={index}>
//               <Grow in timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
//                 <Card 
//                   sx={{ 
//                     height: '100%',
//                     borderRadius: 4,
//                     border: 'none',
//                     boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
//                     transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//                     '&:hover': {
//                       transform: 'translateY(-12px)',
//                       boxShadow: `0 20px 40px ${feature.color}33`,
//                       '& .feature-icon': {
//                         transform: 'scale(1.1)'
//                       }
//                     }
//                   }}
//                 >
//                   <CardContent sx={{ p: 4, textAlign: 'center' }}>
//                     <Box 
//                       className="feature-icon"
//                       sx={{ 
//                         display: 'inline-flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         width: 80,
//                         height: 80,
//                         borderRadius: '50%',
//                         bgcolor: `${feature.color}15`,
//                         color: feature.color,
//                         mb: 3,
//                         transition: 'all 0.4s ease'
//                       }}
//                     >
//                       {feature.icon}
//                     </Box>
//                     <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
//                       {feature.title}
//                     </Typography>
//                     <Typography color="text.secondary" sx={{ mb: 3 }}>
//                       {feature.description}
//                     </Typography>
//                     <Chip 
//                       label={feature.stats}
//                       size="small"
//                       sx={{ 
//                         bgcolor: `${feature.color}15`,
//                         color: feature.color,
//                         fontWeight: 500
//                       }}
//                     />
//                   </CardContent>
//                 </Card>
//               </Grow>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       {/* CTA Section */}
//       <Box sx={{ 
//         py: 12,
//         background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//         position: 'relative',
//         overflow: 'hidden'
//       }}>
//         <Container maxWidth="md">
//           <Zoom in timeout={1000}>
//             <Paper 
//               sx={{ 
//                 p: { xs: 4, md: 8 },
//                 textAlign: 'center',
//                 borderRadius: 4,
//                 bgcolor: 'white',
//                 boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
//                 position: 'relative',
//                 overflow: 'hidden'
//               }}
//             >
//               <Box
//                 sx={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   right: 0,
//                   height: 4,
//                   background: 'linear-gradient(90deg, #667eea, #764ba2)'
//                 }}
//               />
//               <Typography variant="h2" gutterBottom sx={{ fontWeight: 800 }}>
//                 Ready to Make an Impact?
//               </Typography>
//               <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
//                 Join thousands of empowered citizens creating positive change in their communities.
//                 Together, we can build better neighborhoods.
//               </Typography>
//               <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
//                 <Button
//                   component={Link}
//                   to="/register"
//                   variant="contained"
//                   size="large"
//                   sx={{
//                     px: 6,
//                     py: 1.5,
//                     borderRadius: 2,
//                     bgcolor: 'primary.main',
//                     fontWeight: 600,
//                     fontSize: '1.1rem',
//                     '&:hover': {
//                       bgcolor: 'primary.dark',
//                       transform: 'translateY(-2px)',
//                       boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
//                     },
//                     transition: 'all 0.3s ease'
//                   }}
//                 >
//                   Join Free Today
//                 </Button>
//                 <Button
//                   component={Link}
//                   to="/about"
//                   variant="outlined"
//                   size="large"
//                   sx={{
//                     px: 6,
//                     py: 1.5,
//                     borderRadius: 2,
//                     borderWidth: 2,
//                     fontWeight: 600,
//                     '&:hover': {
//                       borderWidth: 2,
//                       transform: 'translateY(-2px)'
//                     },
//                     transition: 'all 0.3s ease'
//                   }}
//                 >
//                   Learn More
//                 </Button>
//               </Stack>
//               <Typography variant="caption" display="block" sx={{ mt: 3, opacity: 0.7 }}>
//                 No credit card required • Takes less than 2 minutes
//               </Typography>
//             </Paper>
//           </Zoom>
//         </Container>
//       </Box>
//     </Box>
//   )
// }

// export default Home


import React, { useState } from 'react'
import { 
  Container, Typography, Button, Box, Grid, Paper, 
  Card, CardContent, CardActions, Fade, Zoom, Grow,
  Avatar, Chip, Stack, Divider, IconButton, alpha,
  useTheme, useMediaQuery
} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { redirectToSubdomain } from '../utils/subdomain'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ReportIcon from '@mui/icons-material/Report'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import GroupsIcon from '@mui/icons-material/Groups'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import MapIcon from '@mui/icons-material/Map'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import { keyframes } from '@emotion/react'
import { styled } from '@mui/material/styles'

// Styled Components
const FeatureCard = styled(Card)(({ theme, color }) => ({
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`
    : '#ffffff',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `0 25px 50px ${alpha(color || theme.palette.primary.main, 0.2)}`,
    '& .feature-hover': {
      opacity: 1,
      transform: 'translateY(0)',
    }
  }
}))

const StatsCard = styled(Paper)(({ theme, color }) => ({
  borderRadius: 16,
  background: `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.1)} 0%, ${alpha(color || theme.palette.primary.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(color || theme.palette.primary.main, 0.2)}`,
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.05)',
    boxShadow: `0 15px 35px ${alpha(color || theme.palette.primary.main, 0.2)}`,
  }
}))

const IssueCard = styled(Paper)(({ theme, color }) => ({
  borderRadius: 12,
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.08)} 0%, transparent 100%)`,
  border: `1px solid ${alpha(color || theme.palette.primary.main, 0.15)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateX(10px)',
    background: `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.15)} 0%, transparent 100%)`,
    boxShadow: `0 10px 25px ${alpha(color || theme.palette.primary.main, 0.15)}`,
  }
}))

// Animation keyframes
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`

const shimmerAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`

const Home = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const [activeCategory, setActiveCategory] = useState(0)

  const features = [
    {
      icon: <ReportIcon sx={{ fontSize: 56 }} />,
      title: 'Report Issues Instantly',
      description: 'Document civic problems with photos, location pins, and detailed descriptions.',
      color: '#FF6B6B',
      stats: '15K+ Issues Reported',
      steps: ['📸 Snap Photo', '📍 Pin Location', '📝 Add Details', '🚀 Submit'],
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)'
    },
    {
      icon: <TrackChangesIcon sx={{ fontSize: 56 }} />,
      title: 'Track Real-time Progress',
      description: 'Follow your report from submission to resolution with live status updates.',
      color: '#4ECDC4',
      stats: '92% Resolution Rate',
      steps: ['📤 Submitted', '👀 Under Review', '🔧 In Progress', '✅ Resolved'],
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #6CE6DE 100%)'
    },
    {
      icon: <VolunteerActivismIcon sx={{ fontSize: 56 }} />,
      title: 'Community Collaboration',
      description: 'Vote, comment, and work together with neighbors and local authorities.',
      color: '#FFD166',
      stats: '75K+ Active Users',
      steps: ['👍 Upvote Issues', '💬 Join Discussions', '👥 Form Groups', '🎯 Take Action'],
      gradient: 'linear-gradient(135deg, #FFD166 0%, #FFE194 100%)'
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 56 }} />,
      title: 'Smart AI Routing',
      description: 'Automated assignment to relevant municipal departments for faster resolution.',
      color: '#06D6A0',
      stats: '18h Avg. Response',
      steps: ['📍 Location Analysis', '🏛️ Dept. Matching', '📋 Priority Setting', '⚡ Quick Dispatch'],
      gradient: 'linear-gradient(135deg, #06D6A0 0%, #2EE8B6 100%)'
    }
  ]

  const recentIssues = [
    { 
      id: 1, 
      title: 'Major Garbage Pile Cleared', 
      type: 'Sanitation', 
      location: 'Central Market Area',
      time: 'Just now', 
      votes: 156,
      color: '#FF6B6B',
      icon: '🗑️'
    },
    { 
      id: 2, 
      title: 'Road Repair Completed', 
      type: 'Infrastructure', 
      location: 'Main Street',
      time: '3 hours ago', 
      votes: 89,
      color: '#4ECDC4',
      icon: '🛣️'
    },
    { 
      id: 3, 
      title: 'Street Lights Fixed', 
      type: 'Public Safety', 
      location: 'Downtown District',
      time: '1 day ago', 
      votes: 67,
      color: '#FFD166',
      icon: '💡'
    },
    { 
      id: 4, 
      title: 'Park Revitalization', 
      type: 'Public Spaces', 
      location: 'Green Park',
      time: '2 days ago', 
      votes: 124,
      color: '#06D6A0',
      icon: '🌳'
    },
    { 
      id: 5, 
      title: 'Drainage Issue Resolved', 
      type: 'Flood Control', 
      location: 'River Side',
      time: '3 days ago', 
      votes: 92,
      color: '#118AB2',
      icon: '🚰'
    },
    { 
      id: 6, 
      title: 'Public WiFi Installed', 
      type: 'Digital Infrastructure', 
      location: 'Community Center',
      time: '5 days ago', 
      votes: 201,
      color: '#955BA5',
      icon: '📡'
    }
  ]

  const stats = [
    { 
      value: '75,000+', 
      label: 'Active Citizens', 
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      change: '+2,500 this week',
      color: '#667eea'
    },
    { 
      value: '96%', 
      label: 'Satisfaction Rate', 
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      change: 'Highest in category',
      color: '#764ba2'
    },
    { 
      value: '45', 
      label: 'Cities Covered', 
      icon: <LocationOnIcon sx={{ fontSize: 40 }} />,
      change: 'Across 5 countries',
      color: '#FF6B6B'
    },
    { 
      value: '2.8M+', 
      label: 'Issues Resolved', 
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      change: 'Since launch',
      color: '#06D6A0'
    }
  ]

  const categories = [
    { name: 'Garbage & Waste', icon: '🗑️', count: '15,842', color: '#FF6B6B' },
    { name: 'Road & Infrastructure', icon: '🛣️', count: '12,456', color: '#4ECDC4' },
    { name: 'Public Safety', icon: '💡', count: '9,234', color: '#FFD166' },
    { name: 'Water & Drainage', icon: '🚰', count: '7,891', color: '#118AB2' },
    { name: 'Parks & Green Spaces', icon: '🌳', count: '6,543', color: '#06D6A0' },
    { name: 'Public Transport', icon: '🚌', count: '5,678', color: '#955BA5' },
  ]

  const handleGetStarted = () => {
    navigate('/report-issue')
  }

  const handleViewMap = () => {
    navigate('/map')
  }

  const handleViewCommunity = () => {
    navigate('/community')
  }

  return (
    <Box sx={{ overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: `${floatAnimation} 20s ease-in-out infinite`
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            animation: `${floatAnimation} 15s ease-in-out infinite reverse`
          }}
        />

        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            {/* Left Column - Hero Content */}
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Chip 
                      label="Trusted by 75K+ Citizens" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 600,
                        animation: `${pulseAnimation} 2s infinite`
                      }}
                      icon={<TrendingUpIcon />}
                    />
                    <Chip 
                      label="96% Satisfaction Rate" 
                      sx={{ 
                        bgcolor: 'rgba(255, 209, 102, 0.3)', 
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="h1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 900,
                      fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4.5rem' },
                      lineHeight: 1.1,
                      mb: 3
                    }}
                  >
                    Cleaner Streets
                    <Box component="span" sx={{ color: '#FFD166', display: 'block' }}>
                      Better Communities
                    </Box>
                  </Typography>
                  
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      opacity: 0.9, 
                      mb: 4,
                      fontSize: { xs: '1.2rem', md: '1.6rem' },
                      maxWidth: '90%'
                    }}
                  >
                    Join the movement transforming neighborhoods through civic engagement. 
                    Report issues, track progress, and collaborate for cleaner, safer spaces.
                  </Typography>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
                    <Zoom in timeout={1200} style={{ transitionDelay: '200ms' }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleGetStarted}
                        startIcon={<ReportIcon />}
                        sx={{
                          bgcolor: '#FFD166',
                          color: 'black',
                          px: 6,
                          py: 2,
                          borderRadius: 3,
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
                            transform: 'translateX(-100%)',
                          },
                          '&:hover': { 
                            bgcolor: '#FFC233',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 15px 35px rgba(255, 209, 102, 0.4)',
                            '&::before': {
                              animation: `${shimmerAnimation} 1s ease`,
                            }
                          },
                          transition: 'all 0.4s ease'
                        }}
                      >
                        Report an Issue
                      </Button>
                    </Zoom>
                    <Zoom in timeout={1200} style={{ transitionDelay: '400ms' }}>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={handleViewMap}
                        startIcon={<MapIcon />}
                        sx={{
                          borderColor: 'rgba(255,255,255,0.3)',
                          borderWidth: 2,
                          color: 'white',
                          px: 6,
                          py: 2,
                          borderRadius: 3,
                          fontWeight: 600,
                          '&:hover': { 
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            transform: 'translateY(-3px)',
                            borderWidth: 2,
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Explore Issues Map
                      </Button>
                    </Zoom>
                    <Zoom in timeout={1200} style={{ transitionDelay: '600ms' }}>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={handleViewCommunity}
                        startIcon={<GroupsIcon />}
                        sx={{
                          borderColor: 'rgba(255,255,255,0.3)',
                          borderWidth: 2,
                          color: 'white',
                          px: 6,
                          py: 2,
                          borderRadius: 3,
                          fontWeight: 600,
                          '&:hover': { 
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            transform: 'translateY(-3px)',
                            borderWidth: 2,
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Visit Community
                      </Button>
                    </Zoom>
                  </Stack>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#06D6A0' }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        No registration needed
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#06D6A0' }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        24/7 Municipal Support
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#06D6A0' }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Real-time Updates
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            
            {/* Right Column - Recent Issues */}
            <Grid item xs={12} md={6}>
              <Grow in timeout={1500}>
                <Paper
                  sx={{
                    p: { xs: 3, md: 4 },
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #FFD166, #06D6A0, #667eea)',
                      backgroundSize: '200% 100%',
                      animation: `${shimmerAnimation} 2s infinite linear`
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>🎯</span> Live Updates
                    </Typography>
                    <Chip 
                      label="Real-time" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(6, 214, 160, 0.3)', color: 'white' }}
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    {recentIssues.slice(0, 4).map((issue) => (
                      <Grid item xs={12} sm={6} key={issue.id}>
                        <IssueCard color={issue.color}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Avatar sx={{ 
                              width: 36, 
                              height: 36, 
                              bgcolor: alpha(issue.color, 0.2),
                              color: issue.color,
                              fontSize: '1.2rem'
                            }}>
                              {issue.icon}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Chip 
                                label={issue.type} 
                                size="small" 
                                sx={{ 
                                  bgcolor: alpha(issue.color, 0.2),
                                  color: issue.color,
                                  fontWeight: 500,
                                  height: 20
                                }}
                              />
                            </Box>
                          </Box>
                          <Typography sx={{ fontWeight: 600, mb: 1, fontSize: '0.95rem' }}>
                            {issue.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {issue.time}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <VolunteerActivismIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {issue.votes}
                              </Typography>
                            </Box>
                          </Box>
                        </IssueCard>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Button
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      mt: 3,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                      }
                    }}
                    component={Link}
                    to="/community"
                  >
                    View All Resolved Issues
                  </Button>
                </Paper>
              </Grow>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Volunteer CTA Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            p: { xs: 3, md: 6 },
            mb: 4
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Make a Bigger Impact - Become a Volunteer!
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                Join our community of volunteers helping to keep our streets clean. Get access to exclusive events, earn badges, and lead cleanup initiatives.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  sx={{ 
                    bgcolor: 'white', 
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                  }}
                  onClick={() => redirectToSubdomain('volunteer', '/')}
                >
                  Learn More
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                  onClick={() => redirectToSubdomain('volunteer', '/Register')}
                >
                  Sign Up Now
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 2 
              }}>
                <Box sx={{ fontSize: 80 }}>🙌</Box>
                <Typography variant="h6" fontWeight="bold">
                  Join 500+ Volunteers
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Stats Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 }, mt: -4 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 900 }}>
            Making Real Impact
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Join thousands of empowered citizens transforming urban spaces
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Grow in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                <StatsCard color={stat.color}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    mb: 2
                  }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      flexShrink: 0
                    }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 900, 
                          color: stat.color,
                          lineHeight: 1
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography 
                    variant="caption" 
                    color={stat.color}
                    sx={{ 
                      display: 'block',
                      fontWeight: 600
                    }}
                  >
                    {stat.change}
                  </Typography>
                </StatsCard>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 900 }}>
            Everything You Need
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            A comprehensive platform for civic engagement and issue resolution
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Grow in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                <FeatureCard color={feature.color}>
                  {/* Hover overlay */}
                  <Box
                    className="feature-hover"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: feature.gradient,
                      opacity: 0,
                      transform: 'translateY(20px)',
                      transition: 'all 0.4s ease',
                      zIndex: 1,
                    }}
                  />
                  
                  <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
                    <Box 
                      sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: alpha(feature.color, 0.1),
                        color: feature.color,
                        mb: 3,
                        transition: 'all 0.4s ease',
                        animation: `${floatAnimation} 6s ease-in-out infinite`,
                        animationDelay: `${index * 0.5}s`
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2, minHeight: 64 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3, minHeight: 72 }}>
                      {feature.description}
                    </Typography>
                    
                    <Stack spacing={1} sx={{ mb: 3 }}>
                      {feature.steps.map((step, stepIndex) => (
                        <Box 
                          key={stepIndex}
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(feature.color, 0.05),
                            border: `1px solid ${alpha(feature.color, 0.1)}`
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              bgcolor: feature.color,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: 'white'
                            }}
                          >
                            {stepIndex + 1}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {step}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip 
                        label={feature.stats}
                        size="small"
                        sx={{ 
                          bgcolor: alpha(feature.color, 0.1),
                          color: feature.color,
                          fontWeight: 600,
                          border: `1px solid ${alpha(feature.color, 0.2)}`
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          color: feature.color,
                          '&:hover': {
                            bgcolor: alpha(feature.color, 0.1)
                          }
                        }}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </FeatureCard>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Box sx={{ 
        py: { xs: 6, md: 10 },
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 900, color: 'white' }}>
              Popular Categories
            </Typography>
            <Typography variant="h6" color={theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary'} sx={{ maxWidth: 600, mx: 'auto' }}>
              Most reported issues in your community
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {categories.map((category, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Grow in timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: `2px solid ${alpha(category.color, activeCategory === index ? 0.4 : 0.1)}`,
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha(category.color, 0.05)
                        : alpha(category.color, 0.03),
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      transform: activeCategory === index ? 'translateY(-8px)' : 'none',
                      boxShadow: activeCategory === index ? `0 15px 35px ${alpha(category.color, 0.2)}` : 'none',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 15px 35px ${alpha(category.color, 0.15)}`,
                        borderColor: alpha(category.color, 0.3),
                      }
                    }}
                    onClick={() => setActiveCategory(index)}
                  >
                    <Typography variant="h2" sx={{ mb: 2, fontSize: '2.5rem' }}>
                      {category.icon}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: category.color }}>
                      {category.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.count} reports
                    </Typography>
                  </Paper>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
        <Zoom in timeout={1000}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              borderRadius: 6,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(102, 126, 234, 0.3)',
            }}
          >
            {/* Background pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 20%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 20%)',
                zIndex: 1,
              }}
            />
            
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Ready to Transform Your Neighborhood?
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, maxWidth: 700, mx: 'auto' }}>
                Join thousands of citizens creating positive change. Together, we can build cleaner, safer, and better communities.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  startIcon={<PhotoCameraIcon />}
                  sx={{
                    bgcolor: '#FFD166',
                    color: 'black',
                    px: 6,
                    py: 1.8,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: '#FFC233',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 15px 35px rgba(255, 209, 102, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Report Your First Issue
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleViewMap}
                  startIcon={<PlayCircleOutlineIcon />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderWidth: 2,
                    color: 'white',
                    px: 6,
                    py: 1.8,
                    borderRadius: 3,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-3px)',
                      borderWidth: 2,
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Watch Demo
                </Button>
              </Stack>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 14 }} /> No credit card required
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 14 }} /> Takes 2 minutes
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 14 }} /> Free forever
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  )
}

export default Home