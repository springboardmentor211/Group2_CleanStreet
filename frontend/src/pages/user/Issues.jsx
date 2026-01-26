import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  Button,
  Avatar,
  Collapse
} from '@mui/material'
import {
  ThumbUp,
  ThumbDown,
  Visibility,
  Comment,
  Send,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

const Issues = () => {
  const { isAuthenticated } = useAuth()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [votingStates, setVotingStates] = useState({})
  const [expandedIssues, setExpandedIssues] = useState({})
  const [comments, setComments] = useState({})
  const [newComments, setNewComments] = useState({})
  const [submittingComments, setSubmittingComments] = useState({})

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/reports', { withCredentials: true })
      if (res.data?.success) {
        setIssues(res.data.reports || [])
        // Fetch vote status for each issue
        res.data.reports.forEach(issue => {
          fetchVoteStatus(issue._id)
        })
      } else {
        setError('Failed to load issues')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch issues')
    } finally {
      setLoading(false)
    }
  }

  const fetchVoteStatus = async (issueId) => {
    if (!isAuthenticated) return
    
    try {
      const response = await axios.get(`/api/reports/${issueId}/vote`, {
        withCredentials: true
      })
      
      if (response.data.success) {
        setVotingStates(prev => ({
          ...prev,
          [issueId]: response.data.vote
        }))
      }
    } catch (err) {
      console.error('Fetch vote status error:', err)
    }
  }

  const fetchComments = async (issueId) => {
    try {
      const response = await axios.get(`/api/reports/${issueId}/comments`, {
        withCredentials: true
      })
      
      if (response.data.success) {
        setComments(prev => ({
          ...prev,
          [issueId]: response.data.comments
        }))
      }
    } catch (err) {
      console.error('Fetch comments error:', err)
    }
  }

  const handleVote = async (issueId, voteType) => {
    if (!isAuthenticated) {
      alert('Please login to vote')
      return
    }

    try {
      const response = await axios.post(
        `/api/reports/${issueId}/vote`,
        { voteType },
        { withCredentials: true }
      )

      if (response.data.success) {
        setIssues(prevIssues => 
          prevIssues.map(issue => {
            if (issue._id === issueId) {
              return {
                ...issue,
                upvotes: response.data.upvotes,
                downvotes: response.data.downvotes
              }
            }
            return issue
          })
        )

        setVotingStates(prev => ({
          ...prev,
          [issueId]: response.data.userVote
        }))
      }
    } catch (err) {
      console.error('Vote error:', err)
      alert(err.response?.data?.error || 'Failed to record vote')
    }
  }

  const handleToggleExpand = (issueId) => {
    const newExpanded = { ...expandedIssues }
    newExpanded[issueId] = !newExpanded[issueId]
    setExpandedIssues(newExpanded)
    
    // Fetch comments if expanding
    if (!newExpanded[issueId] && !comments[issueId]) {
      fetchComments(issueId)
    }
  }

  const handleSubmitComment = async (issueId) => {
    const content = newComments[issueId]?.trim()
    if (!content) return

    setSubmittingComments(prev => ({ ...prev, [issueId]: true }))

    try {
      const response = await axios.post(
        `/api/reports/${issueId}/comments`,
        { content },
        { withCredentials: true }
      )

      if (response.data.success) {
        // Add new comment to list
        setComments(prev => ({
          ...prev,
          [issueId]: [response.data.comment, ...(prev[issueId] || [])]
        }))
        setNewComments(prev => ({ ...prev, [issueId]: '' }))
      }
    } catch (err) {
      console.error('Submit comment error:', err)
      alert(err.response?.data?.error || 'Failed to add comment')
    } finally {
      setSubmittingComments(prev => ({ ...prev, [issueId]: false }))
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      received: 'info',
      in_review: 'warning',
      'in-progress': 'warning',
      resolved: 'success',
      rejected: 'error'
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status) => {
    const labels = {
      received: 'Received',
      in_review: 'In Review',
      'in-progress': 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected'
    }
    return labels[status] || status
  }

  const getCategoryLabel = (category) => {
    const labels = {
      garbage: 'Garbage Dump',
      pothole: 'Pothole/Road Damage',
      water: 'Water Leakage',
      streetlight: 'Broken Light',
      park: 'Park Maintenance',
      sewage: 'Sewage Issue',
      vandalism: 'Vandalism',
      other: 'Other'
    }
    return labels[category] || category
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          All Issues
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse community-reported issues across the city.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {issues.length === 0 ? (
        <Alert severity="info">No issues found.</Alert>
      ) : (
        <Grid container spacing={3}>
          {issues.map((issue) => (
            <Grid item xs={12} key={issue._id}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {issue.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {issue.address}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={getCategoryLabel(issue.category)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={getStatusLabel(issue.status)}
                        size="small"
                        color={getStatusColor(issue.status)}
                        variant="filled"
                      />
                      <Chip
                        label={issue.priority}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {issue.description}
                  </Typography>

                  {/* Engagement Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Tooltip title="Upvote">
                      <IconButton
                        size="small"
                        onClick={() => handleVote(issue._id, 'upvote')}
                        color={votingStates[issue._id] === 'upvote' ? 'primary' : 'default'}
                      >
                        <ThumbUp fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="body2">
                      {issue.upvotes || 0}
                    </Typography>

                    <Tooltip title="Downvote">
                      <IconButton
                        size="small"
                        onClick={() => handleVote(issue._id, 'downvote')}
                        color={votingStates[issue._id] === 'downvote' ? 'error' : 'default'}
                      >
                        <ThumbDown fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="body2">
                      {issue.downvotes || 0}
                    </Typography>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Visibility fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {issue.views || 0}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <Button
                      size="small"
                      startIcon={<Comment />}
                      onClick={() => handleToggleExpand(issue._id)}
                      endIcon={expandedIssues[issue._id] ? <ExpandLess /> : <ExpandMore />}
                    >
                      {comments[issue._id]?.length || 0} Comments
                    </Button>

                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                      {formatDate(issue.createdAt)}
                    </Typography>
                  </Box>

                  {/* Comments Section */}
                  <Collapse in={expandedIssues[issue._id]}>
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Comment Input */}
                    {isAuthenticated ? (
                      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Add a comment..."
                          value={newComments[issue._id] || ''}
                          onChange={(e) => setNewComments(prev => ({ 
                            ...prev, 
                            [issue._id]: e.target.value 
                          }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSubmitComment(issue._id)
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSubmitComment(issue._id)}
                          disabled={!newComments[issue._id]?.trim() || submittingComments[issue._id]}
                        >
                          <Send fontSize="small" />
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Please login to comment
                      </Typography>
                    )}

                    {/* Comments List */}
                    {comments[issue._id]?.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {comments[issue._id].map((comment) => (
                          <Box key={comment._id} sx={{ display: 'flex', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {comment.userId?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {comment.userId?.name || 'Unknown User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(comment.createdAt)}
                                  {comment.isEdited && ' (edited)'}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {comment.content}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No comments yet. Be the first to comment!
                      </Typography>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default Issues

