import React, { useState } from 'react'
import { Container, Typography, Box, TextField, Button, Grid, Stack, MenuItem, InputAdornment } from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const CreateEvent = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: dayjs(),
    duration: 2,
    location: {
      address: '',
      city: ''
    },
    maxVolunteers: 10
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        dateTime: {
          start: formData.date.toISOString(),
          end: formData.date.add(formData.duration, 'hour').toISOString()
        },
        location: {
          address: formData.location.address,
          city: formData.location.city
          // Don't send coordinates if they're 0,0 (not set)
        },
        maxVolunteers: formData.maxVolunteers,
        status: 'upcoming'
      }

      const response = await apiClient.post('/volunteers/events', eventData)
      
      if (response.data.success) {
        toast.success('Event created successfully!')
        navigate('/events')
      }
    } catch (err) {
      console.error('Event creation error:', err)
      console.error('Error response:', err.response?.data)
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Create New Event
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Organize a volunteer event and bring your community together
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Event Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Beach Cleanup Drive"
          />

          <TextField
            label="Description"
            fullWidth
            required
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Join us for a community beach cleanup to protect marine life and keep our beaches clean..."
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Event Date & Time"
                  value={formData.date}
                  onChange={(newValue) => handleChange('date', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                  minDateTime={dayjs()}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Duration (hours)"
                type="number"
                fullWidth
                required
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                InputProps={{
                  inputProps: { min: 1, max: 24 }
                }}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight="medium" sx={{ mt: 2 }}>
            Location Details
          </Typography>

          <TextField
            label="Address"
            fullWidth
            required
            value={formData.location.address}
            onChange={(e) => handleLocationChange('address', e.target.value)}
            placeholder="123 Beach Road, Near Lighthouse"
          />

          <TextField
            label="City"
            fullWidth
            required
            value={formData.location.city}
            onChange={(e) => handleLocationChange('city', e.target.value)}
            placeholder="Mumbai"
          />

          <TextField
            label="Volunteers Needed"
            type="number"
            fullWidth
            required
            value={formData.maxVolunteers}
            onChange={(e) => handleChange('maxVolunteers', parseInt(e.target.value))}
            InputProps={{
              inputProps: { min: 1, max: 100 }
            }}
            helperText="Maximum number of volunteers for this event"
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/events')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Container>
  )
}

export default CreateEvent
