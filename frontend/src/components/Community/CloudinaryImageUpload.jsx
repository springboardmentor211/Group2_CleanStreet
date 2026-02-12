import React, { useRef, useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  LinearProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  PhotoCamera,
  AddPhotoAlternate,
  Delete,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const CloudinaryImageUpload = ({ onImagesChange, maxImages = 5, onCaptureStart }) => {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const startCamera = async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError('Unable to access camera. Please check permissions.')
    }
  }

  const handleOpenCamera = () => {
    if (onCaptureStart) {
      onCaptureStart()
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setCameraOpen(true)
    } else if (cameraInputRef.current) {
      cameraInputRef.current.click()
    } else {
      setCameraError('Camera is not supported on this device.')
    }
  }

  const handleCloseCamera = () => {
    setCameraOpen(false)
    stopCamera()
  }

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const width = video.videoWidth || 1280
    const height = video.videoHeight || 720

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, width, height)

    canvas.toBlob(async (blob) => {
      if (!blob) return
      const fileName = `camera-${Date.now()}.jpg`
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      await uploadToCloudinary([file])
      handleCloseCamera()
    }, 'image/jpeg', 0.9)
  }

  useEffect(() => {
    if (cameraOpen) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [cameraOpen])

  const handleImageSelect = async (event) => {
    const files = Array.from(event.target.files)
    
    if (!files.length) return

    const validImages = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    )
    
    if (validImages.length === 0) {
      toast.error('Please upload valid image files (max 10MB each)')
      return
    }

    if (images.length + validImages.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    // Upload each file to Cloudinary
    await uploadToCloudinary(validImages)

    if (event.target) {
      event.target.value = ''
    }
  }

  const uploadToCloudinary = async (files) => {
    setUploading(true)
    const uploadedImages = [...images]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('image', file)

      try {
        // Show loading state
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }))

        const response = await axios.post(
          '/api/reports/upload-image',
          formData,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: percentCompleted
              }))
            }
          }
        )

        if (response.data.success) {
          uploadedImages.push({
            url: response.data.image.url,
            public_id: response.data.image.public_id,
            thumbnail: response.data.image.thumbnail,
            name: file.name,
            uploaded: true
          })
          toast.success(`Image ${i + 1} uploaded successfully`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error(`Failed to upload ${file.name}`)
        
        // Add failed image with error state
        uploadedImages.push({
          name: file.name,
          uploaded: false,
          error: error.response?.data?.error || 'Upload failed'
        })
      }

      // Clear progress for this file
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[file.name]
        return newProgress
      })
    }

    setImages(uploadedImages)
    onImagesChange(uploadedImages.filter(img => img.uploaded))
    setUploading(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages.filter(img => img.uploaded))
  }

  const handleRetryUpload = (failedImage) => {
    // Remove failed image and retry
    const newImages = images.filter(img => img !== failedImage)
    setImages(newImages)
  }

  return (
    <Box>
      {/* Upload Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AddPhotoAlternate />}
          onClick={() => fileInputRef.current.click()}
          fullWidth
          disabled={uploading || images.filter(i => i.uploaded).length >= maxImages}
        >
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<PhotoCamera />}
          onClick={handleOpenCamera}
          fullWidth
          disabled={uploading || images.filter(i => i.uploaded).length >= maxImages}
        >
          Take Photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </Box>

      <Dialog open={cameraOpen} onClose={handleCloseCamera} maxWidth="sm" fullWidth>
        <DialogTitle>Take Photo</DialogTitle>
        <DialogContent>
          {cameraError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cameraError}
            </Alert>
          )}
          <Box sx={{ width: '100%', borderRadius: 1, overflow: 'hidden', bgcolor: 'black' }}>
            <video ref={videoRef} style={{ width: '100%', height: 'auto' }} muted playsInline />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCamera}>Cancel</Button>
          <Button
            onClick={handleCapturePhoto}
            variant="contained"
            disabled={!!cameraError}
          >
            Capture
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Text */}
      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
        Upload up to {maxImages} photos (max 10MB each)
      </Typography>

      {/* Upload Count Badge */}
      {images.length > 0 && (
        <Chip
          label={`${images.filter(i => i.uploaded).length} uploaded`}
          color={images.some(i => i.uploaded) ? 'success' : 'default'}
          icon={images.some(i => i.uploaded) ? <CheckCircle /> : <CloudUpload />}
          sx={{ mb: 2 }}
        />
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {images.map((image, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card
                sx={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: image.uploaded ? 1 : 0.7,
                  border: image.uploaded ? '2px solid green' : '2px solid red',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Image */}
                {image.uploaded && (
                  <Box
                    component="img"
                    src={image.thumbnail}
                    alt={`Upload ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: '4px 4px 0 0'
                    }}
                  />
                )}

                {/* Status Icon */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 5,
                    left: 5,
                    bgcolor: image.uploaded ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)',
                    borderRadius: '50%',
                    p: 0.5
                  }}
                >
                  {image.uploaded ? (
                    <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
                  ) : (
                    <ErrorIcon sx={{ color: 'white', fontSize: 20 }} />
                  )}
                </Box>

                {/* Delete/Retry Button */}
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

                {/* Content */}
                <CardContent sx={{ py: 1, px: 2, flex: 1 }}>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      display: 'block',
                      fontWeight: image.uploaded ? 'bold' : 'normal'
                    }}
                  >
                    {image.name}
                  </Typography>
                  {image.error && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                      {image.error}
                    </Typography>
                  )}
                  {image.uploaded && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                      ✓ Ready
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          📸 Upload clear photos of the issue to help with identification. Images will be attached to your report.
        </Alert>
      )}

      {/* Uploading State */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <Box sx={{ mt: 2 }}>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <Box key={fileName} sx={{ mb: 2 }}>
              <Typography variant="caption">{fileName}</Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 0.5 }}
              />
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default CloudinaryImageUpload
