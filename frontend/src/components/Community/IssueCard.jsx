import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Box,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Share,
  LocationOn,
  MoreVert,
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const IssueCard = ({ issue, onOpenDetails, onRefresh, currentUserId }) => {
  // Handle both string IDs and populated user objects in likes array
  const [liked, setLiked] = useState(
    issue.likes?.some(id => {
      // Check if id is an object with _id or just a string
      const userId = typeof id === 'object' ? id._id : id
      return userId === currentUserId
    }) || false
  )
  const [likesCount, setLikesCount] = useState(issue.likes?.length || 0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const handleLike = async (e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    
    if (!currentUserId) {
      toast.error('Please login to like issues')
      return
    }

    try {
      const response = await axios.post(`/api/reports/${issue._id}/like`, {}, {
        withCredentials: true
      })

      if (response.data.success) {
        setLiked(!liked)
        setLikesCount(response.data.likesCount || 0)
        toast.success(response.data.message || 'Like updated')
      }
    } catch (err) {
      console.error('Like error:', err)
      const errorMsg = err.response?.data?.error || 'Failed to like issue'
      toast.error(errorMsg)
    }
  }

  const handleShare = async (platform) => {
    try {
      // Track share
      await axios.post(`/api/reports/${issue._id}/share`, {}, {
        withCredentials: true
      })

      // Share URL logic
      const shareUrl = `${window.location.origin}/community/post/${issue._id}`
      const shareText = `Check out this community issue: ${issue.title} - ${issue.address}`
  const emailSubject = `Community Issue: ${issue.title}`
  const emailBody = `${shareText}%0A%0AView details: ${shareUrl}`

      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`)
          break
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`
          break
        case 'instagram':
          navigator.clipboard.writeText(shareUrl)
          toast.success('Link copied! Share it in your Instagram story or bio')
          break
        default:
          break
      }

      setShareDialogOpen(false)
      if (platform !== 'instagram') {
        toast.success('Thanks for sharing!')
      }
    } catch (err) {
      console.error('Share error:', err)
      toast.error('Failed to record share')
    }
  }

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const getMapUrl = () => {
    if (issue.latitude && issue.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${issue.latitude},${issue.longitude}`
    }
    if (issue.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(issue.address)}`
    }
    return null
  }

  const mapUrl = getMapUrl()

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'success'
      case 'in-progress':
        return 'warning'
      case 'open':
        return 'info'
      default:
        return 'default'
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      garbage: '#FF6B6B',
      pothole: '#4ECDC4',
      water: '#45B7D1',
      streetlight: '#FFA07A',
      park: '#98D8C8',
      sewage: '#F7DC6F',
      vandalism: '#BB8FCE',
      other: '#85C1E2',
    }
    return colors[category] || '#95A5A6'
  }

  return (
    <>
      <Card
        onClick={onOpenDetails}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {/* User Info Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={issue.userId?.profilePicture}
                alt={issue.userId?.name}
                sx={{ width: 32, height: 32 }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {issue.userId?.name}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationOn sx={{ width: 12, height: 12, color: 'text.secondary' }} />
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px',
                    }}
                  >
                    {issue.address}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleMenuOpen(e)
              }}
            >
              <MoreVert sx={{ width: 20, height: 20 }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Full Width Image */}
        <Box sx={{ position: 'relative' }}>
          {issue.images && issue.images.length > 0 ? (
            <CardMedia
              component="img"
              image={issue.images[0].url}
              alt={issue.title}
              sx={{
                width: '100%',
                height: 220,
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 220,
                backgroundColor: getCategoryColor(issue.category),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h4" color="white" sx={{ fontWeight: 'bold' }}>
                {issue.category.toUpperCase()}
              </Typography>
            </Box>
          )}
          <Button
            size="small"
            variant="contained"
            onClick={(e) => {
              e.stopPropagation()
              onOpenDetails()
            }}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              textTransform: 'none',
            }}
          >
            More
          </Button>
        </Box>

        {/* Actions */}
        <CardActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title={liked ? 'Unlike' : 'Like'}>
              <IconButton
                size="small"
                onClick={handleLike}
                color={liked ? 'primary' : 'default'}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                {liked ? (
                  <ThumbUp sx={{ width: 24, height: 24 }} />
                ) : (
                  <ThumbUpOutlined sx={{ width: 24, height: 24 }} />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Comments">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenDetails()
                }}
              >
                <Comment sx={{ width: 24, height: 24 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  setShareDialogOpen(true)
                }}
              >
                <Share sx={{ width: 24, height: 24 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardActions>

        {/* Bottom Info */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>{issue.userId?.name}</strong> {issue.title}
          </Typography>
          {issue.description && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {issue.description}
            </Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip
              label={issue.category}
              size="small"
              sx={{
                backgroundColor: getCategoryColor(issue.category),
                color: 'white',
                fontSize: '0.7rem',
              }}
            />
            <Chip
              label={issue.status}
              size="small"
              color={getStatusColor(issue.status)}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Stack>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            {new Date(issue.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        </Box>
      </Card>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Share This Issue</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ minWidth: 300, mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Share this issue with others to raise awareness
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
          <Button
            onClick={() => handleShare('whatsapp')}
            variant="outlined"
            color="success"
            fullWidth
            sx={{ flex: '1 1 45%' }}
          >
            WhatsApp
          </Button>
          <Button
            onClick={() => handleShare('email')}
            variant="outlined"
            color="error"
            fullWidth
            sx={{ flex: '1 1 45%' }}
          >
            Email
          </Button>
          <Button
            onClick={() => handleShare('instagram')}
            variant="outlined"
            sx={{ 
              flex: '1 1 45%',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                opacity: 0.9
              }
            }}
            fullWidth
          >
            Instagram
          </Button>
        </DialogActions>
      </Dialog>

      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {mapUrl && (
          <MenuItem onClick={() => {
            window.open(mapUrl, '_blank', 'noopener,noreferrer')
            handleMenuClose()
          }}>
            Open Location
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          onOpenDetails()
          handleMenuClose()
        }}>
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          setShareDialogOpen(true)
          handleMenuClose()
        }}>
          Share
        </MenuItem>
      </Menu>
    </>
  )
}

export default IssueCard
