import React, { useState, useRef, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Chip,
  IconButton,
  Avatar,
  LinearProgress,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Fab,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material'
import {
  PhotoCamera,
  LocationOn,
  AddPhotoAlternate,
  Delete,
  Category,
  Description,
  GpsFixed,
  GpsNotFixed,
  Map,
  Send,
  CheckCircle,
  Warning,
  Error,
  Info,
  CloudUpload,
  AddLocation,
  Cancel,
  Edit,
  Save,
  Clear,
  Visibility,
  Share,
  ReportProblem,
  Add,
  Remove,
  ExpandMore,
  ExpandLess,
  DirectionsWalk,
  LocalPolice,
  WaterDamage,
  ElectricBolt,
  Construction,
  CleaningServices,
  Terrain,
  Home,
  School,
  LocalHospital,
  Park,
  Streetview
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import toast from 'react-hot-toast'
import CloudinaryImageUpload from '../components/Community/CloudinaryImageUpload'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix for Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

// Custom marker icons for different complaint types
const categoryIcons = {
  garbage: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2875/2875333.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }),
  pothole: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2976/2976216.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }),
  water: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3095/3095113.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }),
  streetlight: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4269/4269314.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }),
  default: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  })
}

const createSelectionIcon = () => L.divIcon({
  className: 'location-selection-icon',
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:28px;height:36px;">
      <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.8 0 1 5.8 1 13c0 9.7 13 23 13 23s13-13.3 13-23C27 5.8 21.2 0 14 0z" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
        <circle cx="14" cy="13" r="5" fill="#ffffff" />
      </svg>
    </div>
  `,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -30]
})

// Category options
const categories = [
  { value: 'garbage', label: 'Garbage Dump', icon: <CleaningServices />, color: 'error' },
  { value: 'pothole', label: 'Pothole/Road Damage', icon: <Construction />, color: 'warning' },
  { value: 'water', label: 'Water Leakage/Flooding', icon: <WaterDamage />, color: 'info' },
  { value: 'streetlight', label: 'Broken Street Light', icon: <ElectricBolt />, color: 'secondary' },
  { value: 'park', label: 'Park Maintenance', icon: <Park />, color: 'success' },
  { value: 'sewage', label: 'Sewage Issue', icon: <Terrain />, color: 'error' },
  { value: 'vandalism', label: 'Vandalism', icon: <LocalPolice />, color: 'warning' },
  { value: 'other', label: 'Other Issue', icon: <ReportProblem />, color: 'default' }
]

// Priority levels
const priorities = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
  { value: 'critical', label: 'Critical', color: 'error.main' }
]

// Location picker component for the map
const LocationPicker = ({ position, onPositionChange, onAddressChange, addressValue }) => {
  const [mapPosition, setMapPosition] = useState(position || [51.505, -0.09])
  const [address, setAddress] = useState('')
  const mapRef = useRef(null)

  useEffect(() => {
    if (position) {
      setMapPosition(position)
    }
  }, [position])

  useEffect(() => {
    if (addressValue) {
      setAddress(addressValue)
    }
  }, [addressValue])

  // Automatically get user's current location on mount if no position provided
  useEffect(() => {
    if (!position && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          const coords = [latitude, longitude]
          setMapPosition(coords)
          onPositionChange(coords)
          
          // Reverse geocode
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              const addr = data.display_name
              setAddress(addr)
              onAddressChange(addr)
            })
            .catch(err => console.error('Geocoding error:', err))
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true }
      )
    }
  }, [])

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng
        setMapPosition([lat, lng])
        onPositionChange([lat, lng])
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          )
          const data = await response.json()
          const addr = data.display_name
          setAddress(addr)
          onAddressChange(addr)
        } catch (error) {
          console.error('Geocoding error:', error)
        }
      }
    })
    return null
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setMapPosition([latitude, longitude])
          onPositionChange([latitude, longitude])

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            const addr = data.display_name
            setAddress(addr)
            onAddressChange(addr)
          } catch (error) {
            console.error('Geocoding error:', error)
          }
        },
        (error) => {
          toast.error('Unable to get your location: ' + error.message)
        }
      )
    } else {
      toast.error('Geolocation is not supported by your browser')
    }
  }

  return (
    <Box sx={{ height: 400, position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          bgcolor: 'background.paper',
          borderRadius: 1,
          px: 1.5,
          py: 0.75,
          boxShadow: 2
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Click the map or drag the pin to adjust location.
        </Typography>
      </Box>
      <MapContainer
        center={mapPosition}
        zoom={13}
        whenCreated={(map) => { mapRef.current = map }}
        style={{ height: '100%', width: '100%', borderRadius: 8 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler />
        <Marker
          position={mapPosition}
          icon={createSelectionIcon()}
          draggable
          eventHandlers={{
            dragend: async (e) => {
              const { lat, lng } = e.target.getLatLng()
              setMapPosition([lat, lng])
              onPositionChange([lat, lng])

              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                )
                const data = await response.json()
                const addr = data.display_name
                setAddress(addr)
                onAddressChange(addr)
              } catch (error) {
                console.error('Geocoding error:', error)
              }
            }
          }}
        >
          <Popup>
            Selected Location<br />
            {address || 'Click on map to select location'}
          </Popup>
        </Marker>
      </MapContainer>
      
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
        <Tooltip title="Use Current Location">
          <Fab
            size="small"
            color="primary"
            onClick={handleGetCurrentLocation}
            sx={{ mb: 1 }}
          >
            <GpsFixed />
          </Fab>
        </Tooltip>
        <Tooltip title="Zoom In">
          <Fab
            size="small"
            color="primary"
            sx={{ mb: 1, display: 'block' }}
            onClick={() => mapRef.current?.zoomIn()}
          >
            <Add />
          </Fab>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <Fab
            size="small"
            color="primary"
            onClick={() => mapRef.current?.zoomOut()}
          >
            <Remove />
          </Fab>
        </Tooltip>
      </Box>
    </Box>
  )
}

// Image upload component with preview
const ImageUpload = ({ images, onImagesChange, maxImages = 5, onLocationCapture }) => {
  const fileInputRef = useRef(null)

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const coords = [latitude, longitude]
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            const addr = data.display_name
            
            // Pass location and address to parent
            if (onLocationCapture) {
              onLocationCapture(coords, addr)
            }
            
            toast.success('📍 Location automatically captured from your device')
          } catch (error) {
            console.error('Geocoding error:', error)
            // Still pass coords even if geocoding fails
            if (onLocationCapture) {
              onLocationCapture(coords, 'Location captured')
            }
            toast.success('📍 Location captured')
          }
        },
        (error) => {
          toast.error('Unable to get your location: ' + error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      toast.error('Geolocation is not supported by your browser')
    }
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    const validImages = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    )
    
    if (validImages.length === 0) {
      toast.error('Please upload valid image files (max 5MB each)')
      return
    }

    if (images.length + validImages.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    const newImages = validImages.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }))

    onImagesChange([...images, ...newImages])
    
    // AUTOMATIC GPS CAPTURE when first image is added
    if (images.length === 0 && validImages.length > 0) {
      captureLocation()
    }
  }

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleTakePhoto = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          // Implement camera capture logic
          toast.info('Camera access granted. Implement capture logic here.')
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop())
        })
        .catch((error) => {
          toast.error('Camera access denied: ' + error.message)
        })
    } else {
      toast.error('Camera not available on this device')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AddPhotoAlternate />}
          onClick={() => fileInputRef.current.click()}
          fullWidth
        >
          Upload Photos
        </Button>
        <Button
          variant="outlined"
          startIcon={<PhotoCamera />}
          onClick={handleTakePhoto}
          fullWidth
        >
          Take Photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary" gutterBottom>
        Upload up to {maxImages} photos (max 5MB each)
      </Typography>

      {images.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {images.map((image, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 1
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <Delete fontSize="small" />
                </IconButton>
                <CardContent sx={{ py: 1, px: 2 }}>
                  <Typography variant="caption" noWrap>
                    {image.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {(image.size / 1024).toFixed(1)} KB
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

// Main Report Issue component
const ReportIssue = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading } = useAuth()
  
  // Form state
  const [activeStep, setActiveStep] = useState(0)
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState('')
  const [locationDetails, setLocationDetails] = useState('')
  const [images, setImages] = useState([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [allowComments, setAllowComments] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Steps
  const steps = ['Category & Details', 'Location', 'Photos', 'Review & Submit']

  // Automatically capture location when user reaches Step 2
  useEffect(() => {
    if (activeStep === 1 && !location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const coords = [latitude, longitude]
          setLocation(coords)
          toast.success('📍 Location automatically captured from your device')
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            const addr = data.display_name || 'Address not found'
            setAddress(addr)
          } catch (err) {
            console.error('Geocoding error:', err)
            setAddress('Unable to fetch address')
          }
        },
        (error) => {
          console.error('Location error:', error)
          toast.error('Unable to get location. Please enable GPS or try adding a photo.')
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  }, [activeStep, location])

  const captureLocationFromDevice = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const coords = [latitude, longitude]
        setLocation(coords)
        toast.success('📍 Location captured from your device')

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          const addr = data.display_name || 'Address not found'
          setAddress(addr)
        } catch (err) {
          console.error('Geocoding error:', err)
          setAddress('Unable to fetch address')
        }
      },
      (error) => {
        console.error('Location error:', error)
        toast.error('Unable to get location. Please enable GPS or select on map.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleImagesChange = (newImages) => {
    setImages(newImages)
    if (!location && newImages.length > 0) {
      captureLocationFromDevice()
    }
  }

  // Handle category selection
  const handleCategorySelect = (cat) => {
    setCategory(cat)
    // Auto-set priority based on category
    if (cat === 'garbage' || cat === 'sewage') {
      setPriority('high')
    } else if (cat === 'water') {
      setPriority('critical')
    }
  }

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      if (!category || !title || !description) {
        setError('Please fill in all required fields')
        return
      }
      if (title.length < 5) {
        setError('Issue title must be at least 5 characters long')
        return
      }
      if (description.length < 10) {
        setError('Issue description must be at least 10 characters long')
        return
      }
    }
    // Step 2 (Location) - Allow proceeding without location as it will be auto-captured in Step 3
    // No validation needed here
    setError('')
    setActiveStep((prevStep) => prevStep + 1)
  }

  // Handle previous step
  const handleBack = () => {
    setError('')
    setActiveStep((prevStep) => prevStep - 1)
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Check if auth is still loading
    if (loading) {
      toast.error('Please wait while we verify your login...')
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please login to submit a complaint')
      navigate('/login', { state: { from: '/report-issue' } })
      return
    }

    if (!category || !title || !description) {
      setError('Please complete all required fields')
      return
    }

    if (title.length < 5) {
      setError('Issue title must be at least 5 characters long')
      return
    }

    if (description.length < 10) {
      setError('Issue description must be at least 10 characters long')
      return
    }

    if (!location || !address) {
      setError('Location is required. Please add at least one photo to auto-capture your GPS location, or go back to Step 2.')
      toast.error('Please add a photo to capture location automatically')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Prepare report data with Cloudinary images
      const reportData = {
        category,
        title,
        description,
        priority,
        latitude: location[0],
        longitude: location[1],
        address,
        locationDetails,
        isAnonymous,
        allowComments,
        // Include Cloudinary images
        images: images
          .filter(img => img.uploaded !== false && img.url) // Only include successfully uploaded images
          .map(img => ({
            url: img.url,
            public_id: img.public_id
          }))
      }

      console.log('Submitting report data:', reportData)

      // Submit report to API
      const response = await axios.post('/api/reports/create', reportData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        setSuccess('Report submitted successfully!')
        toast.success('Your report has been submitted successfully!')
        
        // Reset form after successful submission
        setTimeout(() => {
          setCategory('')
          setTitle('')
          setDescription('')
          setPriority('medium')
          setLocation(null)
          setAddress('')
          setImages([])
          setActiveStep(0)
          setSuccess('')
          
          // Navigate to user's reports list
          navigate('/my-reports')
        }, 2000)
      } else {
        throw new Error(response.data.error || 'Failed to submit report')
      }

    } catch (err) {
      console.error('Report submission error:', err.response?.data || err)
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || err.message || 'Failed to submit complaint'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get selected category details
  const selectedCategory = categories.find(cat => cat.value === category)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <ReportProblem sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              Report a Civic Issue
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" paragraph>
            Help make your city cleaner and safer by reporting issues in your neighborhood.
            Your report will be sent to the appropriate authorities for action.
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Step 1: Category & Details */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Select Issue Category
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose the type of issue you're reporting
            </Typography>

            {/* Category Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {categories.map((cat) => (
                <Grid item xs={6} sm={4} md={3} key={cat.value}>
                  {(() => {
                    const mainColor = theme.palette[cat.color]?.main || theme.palette.grey[500]
                    return (
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      border: category === cat.value ? `3px solid ${mainColor}` : '1px solid',
                      borderColor: category === cat.value ? mainColor : 'divider',
                      bgcolor: category === cat.value ? alpha(mainColor, 0.05) : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleCategorySelect(cat.value)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box
                        sx={{
                          color: category === cat.value ? mainColor : 'text.secondary',
                          mb: 1
                        }}
                      >
                        {React.cloneElement(cat.icon, { sx: { fontSize: 40 } })}
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {cat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                    )
                  })()}
                </Grid>
              ))}
            </Grid>

            {/* Issue Details */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Issue Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Issue Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Large garbage pile near Main Street"
                    required
                    error={title.length > 0 && title.length < 5}
                    helperText={
                      title.length > 0 && title.length < 5
                        ? `Minimum 5 characters required (${title.length}/5)`
                        : `Be specific and clear about the issue (${title.length} characters)`
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Detailed Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describe the issue in detail... Include information like: How long has it been there? How severe is it? Any safety concerns?"
                    required
                    error={description.length > 0 && description.length < 10}
                    helperText={
                      description.length > 0 && description.length < 10
                        ? `Minimum 10 characters required (${description.length}/10)`
                        : `The more details you provide, the faster it can be resolved (${description.length} characters)`
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority Level</InputLabel>
                    <Select
                      value={priority}
                      label="Priority Level"
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      {priorities.map((p) => (
                        <MenuItem key={p.value} value={p.value}>
                          <Chip 
                            label={p.label} 
                            size="small" 
                            color={p.color}
                            sx={{ minWidth: 80 }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {priority === 'critical' && 'Immediate attention required - Safety hazard'}
                      {priority === 'high' && 'Needs attention within 24 hours'}
                      {priority === 'medium' && 'Needs attention within 3 days'}
                      {priority === 'low' && 'Minor issue - Can be addressed later'}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* Step 2: Location */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Issue Location
            </Typography>
            
            {location ? (
              <Alert severity="success" icon={<GpsFixed />} sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>✅ Location captured successfully!</strong>
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Using your current GPS coordinates - This prevents misuse and ensures accurate reporting
                </Typography>
              </Alert>
            ) : (
              <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="bold">
                  📍 Capturing your location...
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  We're automatically getting your GPS coordinates. If this fails, location will be captured when you add photos.
                </Typography>
              </Alert>
            )}

            <LocationPicker
              position={location}
              onPositionChange={setLocation}
              onAddressChange={setAddress}
              addressValue={address}
            />

            {address && (
              <Alert 
                severity="info" 
                icon={<LocationOn />}
                sx={{ mt: 3 }}
              >
                <Typography variant="body2">
                  <strong>Selected Address:</strong> {address}
                </Typography>
              </Alert>
            )}

            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Additional Location Details"
                placeholder="e.g., Near the red building, next to the park entrance, etc."
                multiline
                rows={2}
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                helperText="Add any helpful location details that aren't visible on the map"
              />
            </Box>
          </Box>
        )}

        {/* Step 3: Photos */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Add Photos (Optional but Recommended)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Photos help authorities understand the issue better and resolve it faster
            </Typography>

            <Alert severity="info" icon={<GpsFixed />} sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>📍 Location Verification:</strong> {location ? 'Your location has been captured. Adding photos will verify you\'re at the reported location.' : 'When you add your first photo, we\'ll capture your GPS location automatically.'}
              </Typography>
            </Alert>

            <CloudinaryImageUpload
              images={images}
              onImagesChange={handleImagesChange}
              maxImages={8}
              onCaptureStart={() => {
                if (!location) {
                  captureLocationFromDevice()
                }
              }}
            />

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Tips for good photos:</strong>
              </Typography>
              <List dense sx={{ pl: 2 }}>
                <ListItem sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Info fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Take clear, well-lit photos" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Info fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Include a wide shot to show context" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Info fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Take close-ups to show details" />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Info fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="If safe, include something for scale (e.g., a person, vehicle)" />
                </ListItem>
              </List>
            </Alert>
          </Box>
        )}

        {/* Step 4: Review & Submit */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Review Your Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please review all details before submitting. You can go back to edit any section.
            </Typography>

            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
              <Grid container spacing={3}>
                {/* Category & Priority */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    CATEGORY
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {selectedCategory && React.cloneElement(selectedCategory.icon, { 
                      sx: { color: `${selectedCategory.color}.main` }
                    })}
                    <Typography variant="body1" fontWeight="medium">
                      {selectedCategory?.label || 'Not selected'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    PRIORITY
                  </Typography>
                  <Chip 
                    label={priorities.find(p => p.value === priority)?.label || 'Medium'}
                    color={priorities.find(p => p.value === priority)?.color || 'default'}
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                </Grid>

                {/* Title & Description */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    TITLE
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {title || 'Not provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    DESCRIPTION
                  </Typography>
                  <Typography variant="body1">
                    {description || 'Not provided'}
                  </Typography>
                </Grid>

                {/* Location */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    LOCATION
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LocationOn color="primary" />
                    <Box>
                      <Typography variant="body1" fontWeight="medium" gutterBottom>
                        {address || 'Not selected'}
                      </Typography>
                      {locationDetails && (
                        <Typography variant="body2" color="text.secondary">
                          {locationDetails}
                        </Typography>
                      )}
                      {location && (
                        <Typography variant="caption" color="text.secondary">
                          Coordinates: {location[0].toFixed(6)}, {location[1].toFixed(6)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>

                {/* Photos */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    PHOTOS ({images.length})
                  </Typography>
                  {images.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {images.map((image, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={image.preview || image.thumbnail || image.url}
                          alt={`Preview ${index + 1}`}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No photos added
                    </Typography>
                  )}
                </Grid>

                {/* Submission Settings */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SUBMISSION SETTINGS
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 4 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          size="small"
                        />
                      }
                      label="Submit Anonymously"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={allowComments}
                          onChange={(e) => setAllowComments(e.target.checked)}
                          size="small"
                        />
                      }
                      label="Allow Community Comments"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Privacy Notice */}
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Privacy Notice:</strong> Your report will be visible to municipal authorities 
                and the public. Your personal information {isAnonymous ? 'will not be displayed' : 'will be visible'}.
                Photos may contain location metadata.
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || isSubmitting}
            startIcon={<Clear />}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
              sx={{ minWidth: 150 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<Visibility />}
            >
              Continue
            </Button>
          )}
        </Box>

        {/* Progress indicator */}
        {isSubmitting && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
              Submitting your report...
            </Typography>
          </Box>
        )}

        {/* Quick Stats */}
        {activeStep === 0 && (
          <Box sx={{ mt: 6, p: 3, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
              <CheckCircle sx={{ verticalAlign: 'middle', mr: 1 }} />
              Why Report Issues?
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    85%
                  </Typography>
                  <Typography variant="body2">
                    Issues resolved within 7 days
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    24/7
                  </Typography>
                  <Typography variant="body2">
                    Municipal monitoring
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    10K+
                  </Typography>
                  <Typography variant="body2">
                    Issues reported this month
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    4.8★
                  </Typography>
                  <Typography variant="body2">
                    User satisfaction rating
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default ReportIssue