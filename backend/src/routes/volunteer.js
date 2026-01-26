import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import Report from '../models/Report.js'
import Comment from '../models/Comment.js'
import Vote from '../models/Vote.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// ========== MIDDLEWARE ==========

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ 
    success: false,
    error: 'Not authenticated' 
  })
}

// Check if user is a volunteer
const isVolunteer = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'volunteer') {
    return next()
  }
  res.status(403).json({ 
    success: false,
    error: 'Volunteer access required' 
  })
}

// ========== VOLUNTEER AUTH ROUTES ==========

// Volunteer registration (self-registration with pending approval)
router.post('/register', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('location').trim().notEmpty().withMessage('Please specify your location/area'),
  body('zone').optional().trim(),
  body('reason').trim().notEmpty().withMessage('Please tell us why you want to volunteer')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      })
    }

    const { email, password, name, phone, location, zone, reason } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already registered' 
      })
    }

    // Create volunteer with pending approval status
    const volunteer = new User({
      email,
      password,
      name,
      phone: phone || '',
      location,
      zone: zone || '',
      role: 'volunteer',
      isActive: false,
      isEmailVerified: false,
      volunteerInfo: {
        reason,
        appliedAt: new Date(),
        status: 'pending',
        notes: '',
        completedReports: 0,
        averageResolutionTime: 0,
        rating: 0
      }
    })

    await volunteer.save()

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully. Please wait for admin approval.',
      email: volunteer.email,
      applicationId: volunteer._id
    })
  } catch (error) {
    console.error('Volunteer registration error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Volunteer application failed' 
    })
  }
})

// Volunteer login (will work only after approval)
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      })
    }

    const { email, password } = req.body

    console.log('🔐 Volunteer login attempt for:', email)

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      console.log('❌ User not found:', email)
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      })
    }

    // Check password
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email)
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      })
    }

    // Check if user is a volunteer
    if (user.role !== 'volunteer') {
      console.log('❌ Not a volunteer:', email, 'Role:', user.role)
      return res.status(403).json({ 
        success: false,
        error: 'Volunteer login only. Please use regular login.',
        userLoginUrl: '/login'
      })
    }

    // ========== AUTO-FIX INCONSISTENT STATES ==========
    let needsSave = false
    
    // FIX 1: If isActive=true but status=pending, auto-approve
    if (user.isActive && user.volunteerInfo?.status === 'pending') {
      console.log('🔄 Auto-approving: isActive=true but status=pending')
      user.volunteerInfo.status = 'approved'
      if (!user.volunteerInfo.approvedAt) {
        user.volunteerInfo.approvedAt = new Date()
      }
      needsSave = true
    }
    
    // FIX 2: If status=approved but isActive=false, activate account
    if (user.volunteerInfo?.status === 'approved' && !user.isActive) {
      console.log('🔄 Activating: status=approved but isActive=false')
      user.isActive = true
      needsSave = true
    }
    
    // FIX 3: Auto-verify email for approved volunteers
    if (user.isActive && user.volunteerInfo?.status === 'approved' && !user.isEmailVerified) {
      console.log('🔄 Auto-verifying email for approved volunteer')
      user.isEmailVerified = true
      user.emailVerificationOTP = undefined
      user.emailVerificationExpiry = undefined
      needsSave = true
    }
    
    // Save all fixes at once
    if (needsSave) {
      await user.save()
      console.log('✅ Saved fixes for:', user.email)
    }

    // Check if volunteer is approved (after fixing all states)
    if (!user.isActive || user.volunteerInfo?.status !== 'approved') {
      console.log('❌ Volunteer not approved:', {
        isActive: user.isActive,
        status: user.volunteerInfo?.status
      })
      
      let errorMessage = 'Your volunteer application is '
      
      if (user.volunteerInfo?.status === 'rejected') {
        errorMessage += 'rejected. Please contact admin.'
      } else if (user.volunteerInfo?.status === 'pending') {
        errorMessage += 'pending approval. Please wait for admin approval.'
      } else if (!user.isActive) {
        errorMessage += 'not active. Please contact admin.'
      } else {
        errorMessage += 'not approved yet. Current status: ' + (user.volunteerInfo?.status || 'unknown')
      }
      
      return res.status(403).json({ 
        success: false,
        error: errorMessage,
        status: user.volunteerInfo?.status || 'unknown',
        isActive: user.isActive
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Establish Passport session (CRITICAL for authenticated requests)
    req.login(user, (err) => {
      if (err) {
        console.error('❌ Session creation error:', err)
        return res.status(500).json({
          success: false,
          error: 'Login succeeded but session creation failed'
        })
      }

      console.log('✅ Volunteer session established for:', user.email)

      // Return success with user data
      res.json({
        success: true,
        message: 'Volunteer login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          location: user.location,
          zone: user.zone,
          profilePicture: user.profilePicture,
          isActive: user.isActive,
          volunteerStatus: user.volunteerInfo?.status,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          volunteerInfo: user.volunteerInfo
        }
      })
    })
  } catch (error) {
    console.error('❌ Volunteer login error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Login failed: ' + error.message
    })
  }
})

// ========== VOLUNTEER DASHBOARD ROUTES ==========

// Get volunteer dashboard stats
router.get('/dashboard/stats', isAuthenticated, isVolunteer, async (req, res) => {
  try {
    const volunteerId = req.user._id
    
    // Get counts from database
    const [assignedCount, inProgressCount, completedCount, pendingCount] = await Promise.all([
      Report.countDocuments({ assignedTo: volunteerId }),
      Report.countDocuments({ assignedTo: volunteerId, status: 'in-progress' }),
      Report.countDocuments({ assignedTo: volunteerId, status: 'resolved' }),
      Report.countDocuments({ assignedTo: volunteerId, status: 'received' })
    ])

    // Calculate resolution time (average hours to resolve)
    const resolvedReports = await Report.find({ 
      assignedTo: volunteerId, 
      status: 'resolved',
      resolvedAt: { $exists: true }
    })

    let averageResolutionTime = 0
    if (resolvedReports.length > 0) {
      const totalHours = resolvedReports.reduce((sum, report) => {
        const created = new Date(report.createdAt)
        const resolved = new Date(report.resolvedAt)
        const hours = (resolved - created) / (1000 * 60 * 60)
        return sum + hours
      }, 0)
      averageResolutionTime = Math.round(totalHours / resolvedReports.length)
    }

    // Get volunteer rating
    const volunteer = await User.findById(volunteerId)
    const rating = volunteer?.volunteerInfo?.rating || 0

    res.json({
      success: true,
      stats: {
        assigned: assignedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        pending: pendingCount,
        rating: rating.toFixed(1),
        averageResolutionTime,
        resolutionRate: completedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0
      }
    })
  } catch (error) {
    console.error('Volunteer stats error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch volunteer stats'
    })
  }
})

// Get assigned issues with filtering
router.get('/issues', isAuthenticated, isVolunteer, async (req, res) => {
  try {
    const volunteerId = req.user._id
    const { status, page = 1, limit = 10, priority } = req.query
    const skip = (page - 1) * limit

    // Build query
    const query = { assignedTo: volunteerId }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority
    }

    // Get issues with pagination
    const [issues, total] = await Promise.all([
      Report.find(query)
        .populate('userId', 'name email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Report.countDocuments(query)
    ])

    // Count by status
    const statusCounts = await Report.aggregate([
      { $match: { assignedTo: volunteerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    // Count by priority
    const priorityCounts = await Report.aggregate([
      { $match: { assignedTo: volunteerId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ])

    res.json({
      success: true,
      issues,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      counts: {
        byStatus: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count
          return acc
        }, {}),
        byPriority: priorityCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count
          return acc
        }, {})
      }
    })
  } catch (error) {
    console.error('Get assigned issues error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assigned issues'
    })
  }
})

// Get issue details
router.get('/issues/:id', isAuthenticated, isVolunteer, async (req, res) => {
  try {
    const volunteerId = req.user._id
    const issueId = req.params.id

    // Find issue assigned to this volunteer
    const issue = await Report.findOne({
      _id: issueId,
      assignedTo: volunteerId
    })
    .populate('userId', 'name email profilePicture')
    .populate('resolvedBy', 'name email')
    .lean()

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found or not assigned to you'
      })
    }

    // Get comments
    const comments = await Comment.find({ reportId: issueId })
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .lean()

    // Get user's vote
    const userVote = await Vote.findOne({
      userId: volunteerId,
      reportId: issueId
    })

    res.json({
      success: true,
      issue: {
        ...issue,
        userVote: userVote ? userVote.voteType : null
      },
      comments
    })
  } catch (error) {
    console.error('Get issue details error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch issue details'
    })
  }
})

// Update issue status
router.put('/issues/:id/status', isAuthenticated, isVolunteer, [
  body('status').isIn(['received', 'in_review', 'in-progress', 'resolved']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const volunteerId = req.user._id
    const issueId = req.params.id
    const { status, notes } = req.body

    // Find issue assigned to this volunteer
    const issue = await Report.findOne({
      _id: issueId,
      assignedTo: volunteerId
    })

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found or not assigned to you'
      })
    }

    // Update issue
    const updateData = { status }
    
    if (status === 'resolved') {
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = volunteerId
      
      // Update volunteer stats
      await User.findByIdAndUpdate(volunteerId, {
        $inc: { 'volunteerInfo.completedReports': 1 }
      })
    }

    if (notes) {
      // Add comment with the update
      await Comment.create({
        userId: volunteerId,
        reportId: issueId,
        content: `Status changed to ${status}: ${notes}`,
        isStatusUpdate: true
      })
    }

    const updatedIssue = await Report.findByIdAndUpdate(
      issueId,
      updateData,
      { new: true }
    ).populate('userId', 'name email')

    res.json({
      success: true,
      message: 'Issue status updated successfully',
      issue: updatedIssue
    })
  } catch (error) {
    console.error('Update issue status error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update issue status'
    })
  }
})

// Add comment to issue
router.post('/issues/:id/comments', isAuthenticated, isVolunteer, [
  body('content').trim().notEmpty().isLength({ min: 1, max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const volunteerId = req.user._id
    const issueId = req.params.id
    const { content } = req.body

    // Verify issue is assigned to volunteer
    const issue = await Report.findOne({
      _id: issueId,
      assignedTo: volunteerId
    })

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found or not assigned to you'
      })
    }

    // Create comment
    const comment = await Comment.create({
      userId: volunteerId,
      reportId: issueId,
      content
    })

    await comment.populate('userId', 'name email profilePicture')

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add comment'
    })
  }
})

// ========== VOLUNTEER PROFILE ROUTES ==========

// Get volunteer profile
router.get('/profile', isAuthenticated, isVolunteer, async (req, res) => {
  try {
    const volunteer = await User.findById(req.user._id)
      .select('-password -twoFactorSecret -resetPasswordOTP -resetPasswordExpiry')

    res.json({
      success: true,
      profile: volunteer
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    })
  }
})

// Update volunteer profile
router.put('/profile', isAuthenticated, isVolunteer, [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('location').optional().trim(),
  body('zone').optional().trim(),
  body('profilePicture').optional().trim(),
  body('availability').optional().trim(),
  body('skills').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const updateData = {}
    const { name, phone, location, zone, profilePicture, availability, skills } = req.body

    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (location) updateData.location = location
    if (zone) updateData.zone = zone
    if (profilePicture) updateData.profilePicture = profilePicture
    if (availability) updateData['volunteerInfo.availability'] = availability
    if (skills) updateData['volunteerInfo.skills'] = skills

    const volunteer = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-password -twoFactorSecret')

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: volunteer
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    })
  }
})

// Get volunteer performance metrics
router.get('/performance', isAuthenticated, isVolunteer, async (req, res) => {
  try {
    const volunteerId = req.user._id

    // Get performance data
    const [monthlyStats, categoryStats, recentActivity] = await Promise.all([
      // Monthly completion stats
      Report.aggregate([
        {
          $match: {
            assignedTo: volunteerId,
            status: 'resolved',
            resolvedAt: { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$resolvedAt' },
              month: { $month: '$resolvedAt' }
            },
            count: { $sum: 1 },
            avgResolutionTime: {
              $avg: {
                $divide: [
                  { $subtract: ['$resolvedAt', '$createdAt'] },
                  1000 * 60 * 60 // Convert to hours
                ]
              }
            }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ]),

      // Stats by category
      Report.aggregate([
        {
          $match: {
            assignedTo: volunteerId,
            status: 'resolved'
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        }
      ]),

      // Recent activity
      Report.find({ assignedTo: volunteerId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('userId', 'name')
        .select('title category status updatedAt')
        .lean()
    ])

    // Get volunteer info for rating
    const volunteer = await User.findById(volunteerId)
    const rating = volunteer?.volunteerInfo?.rating || 0
    const completedReports = volunteer?.volunteerInfo?.completedReports || 0
    const averageResolutionTime = volunteer?.volunteerInfo?.averageResolutionTime || 0

    res.json({
      success: true,
      performance: {
        overallRating: rating,
        totalCompleted: completedReports,
        averageResolutionTime,
        monthlyStats,
        categoryStats,
        recentActivity
      }
    })
  } catch (error) {
    console.error('Get performance error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance data'
    })
  }
})

// ========== UTILITY ROUTES ==========

// Check volunteer status
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params
    const user = await User.findOne({ email })
      .select('email role isActive volunteerInfo isEmailVerified createdAt lastLogin')
    
    if (!user) {
      return res.json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get volunteer's zone map data
router.get('/map-data', isAuthenticated, isVolunteer, async (req, res) => {
  try {
    const volunteerId = req.user._id
    const volunteer = await User.findById(volunteerId)
    const zone = volunteer?.zone || volunteer?.location

    // Get issues in volunteer's zone
    const zoneIssues = await Report.find({
      $or: [
        { assignedTo: volunteerId },
        { address: { $regex: zone, $options: 'i' } }
      ],
      status: { $in: ['received', 'in_review', 'in-progress'] }
    })
    .select('title category status priority location latitude longitude address createdAt')
    .lean()

    // Get volunteer's location
    const volunteerLocation = {
      latitude: volunteer?.latitude,
      longitude: volunteer?.longitude,
      address: volunteer?.location,
      zone: volunteer?.zone
    }

    res.json({
      success: true,
      mapData: {
        issues: zoneIssues,
        volunteerLocation,
        zone
      }
    })
  } catch (error) {
    console.error('Get map data error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch map data'
    })
  }
})

// Get volunteer task history
router.get('/history', isAuthenticated, isVolunteer, async (req, res) => {
  try {
    const volunteerId = req.user._id
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const [history, total] = await Promise.all([
      Report.find({ assignedTo: volunteerId })
        .populate('userId', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Report.countDocuments({ assignedTo: volunteerId })
    ])

    res.json({
      success: true,
      history,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get history error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    })
  }
})

// ========== VOLUNTEER ACHIEVEMENTS ==========

// Get volunteer achievements/badges
router.get('/achievements', isAuthenticated, isVolunteer, async (req, res) => {
  try {
    const volunteerId = req.user._id
    
    // Get volunteer info
    const volunteer = await User.findById(volunteerId)
    const completedReports = volunteer?.volunteerInfo?.completedReports || 0
    const rating = volunteer?.volunteerInfo?.rating || 0
    
    // Calculate achievements based on stats
    const achievements = []
    const now = new Date()
    
    // Star Performer - 5-star rating for consecutive tasks
    if (rating >= 4.5 && completedReports >= 5) {
      achievements.push({
        id: 'star_performer',
        name: '⭐ Star Performer',
        description: 'Maintained 4.5+ rating for 5+ tasks',
        earnedAt: now.toISOString()
      })
    }
    
    // Quick Responder - Average response time under 24 hours
    const avgResolutionTime = volunteer?.volunteerInfo?.averageResolutionTime || 0
    if (avgResolutionTime > 0 && avgResolutionTime < 24 && completedReports >= 3) {
      achievements.push({
        id: 'quick_responder',
        name: '⏱️ Quick Responder',
        description: 'Average response time under 24 hours',
        earnedAt: now.toISOString()
      })
    }
    
    // Photo Expert - Submitted photos for 10+ tasks
    // This would require tracking in the Report model
    if (completedReports >= 10) {
      achievements.push({
        id: 'photo_expert',
        name: '📸 Photo Expert',
        description: 'Completed 10+ tasks',
        earnedAt: now.toISOString()
      })
    }
    
    // First Steps - Completed first task
    if (completedReports >= 1) {
      achievements.push({
        id: 'first_steps',
        name: '🚀 First Steps',
        description: 'Completed your first task',
        earnedAt: now.toISOString()
      })
    }
    
    // Dedicated Volunteer - 25+ tasks
    if (completedReports >= 25) {
      achievements.push({
        id: 'dedicated',
        name: '🏆 Dedicated Volunteer',
        description: 'Completed 25+ tasks',
        earnedAt: now.toISOString()
      })
    }
    
    // Community Hero - 50+ tasks
    if (completedReports >= 50) {
      achievements.push({
        id: 'community_hero',
        name: '🦸 Community Hero',
        description: 'Completed 50+ tasks',
        earnedAt: now.toISOString()
      })
    }

    res.json({
      success: true,
      achievements: {
        badges: achievements,
        stats: {
          totalBadges: achievements.length,
          totalTasks: completedReports,
          currentRating: rating
        }
      }
    })
  } catch (error) {
    console.error('Get achievements error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch achievements'
    })
  }
})

// ========== VOLUNTEER NOTIFICATIONS ==========

// Get volunteer notifications
router.get('/notifications', isAuthenticated, isVolunteer, async (req, res) => {
  try {
    const volunteerId = req.user._id
    
    // In a real app, you'd have a separate Notification model
    // For now, we'll generate notifications based on assigned issues
    
    // Get recent assignments
    const recentAssignments = await Report.find({
      assignedTo: volunteerId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
    .select('title category priority status createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

    // Transform into notifications
    const notifications = recentAssignments.map(issue => ({
      id: `assignment-${issue._id}`,
      type: 'assignment',
      title: 'New Issue Assigned',
      message: `You've been assigned: ${issue.title}`,
      issueId: issue._id,
      priority: issue.priority,
      category: issue.category,
      read: false,
      createdAt: issue.createdAt
    }))

    // Get high priority unassigned issues in zone (optional assignments)
    const zoneIssues = await Report.find({
      assignedTo: null,
      status: 'received',
      $or: [
        { address: { $regex: req.user.zone || req.user.location, $options: 'i' } }
      ],
      priority: { $in: ['high', 'critical'] },
      createdAt: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    })
    .select('title category priority address createdAt')
    .limit(5)
    .lean()

    const optionalAssignments = zoneIssues.map(issue => ({
      id: `optional-${issue._id}`,
      type: 'optional_assignment',
      title: 'Help Needed in Your Zone',
      message: `High priority issue near you: ${issue.title}`,
      issueId: issue._id,
      priority: issue.priority,
      category: issue.category,
      read: false,
      createdAt: issue.createdAt
    }))

    // Combine notifications
    const allNotifications = [...notifications, ...optionalAssignments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Get unread count
    const unreadCount = allNotifications.filter(n => !n.read).length

    res.json({
      success: true,
      notifications: allNotifications,
      unreadCount,
      total: allNotifications.length
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    })
  }
})

// Mark notification as read
router.put('/notifications/:id/read', isAuthenticated, isVolunteer, async (req, res) => {
  try {
    // In a real app, you'd update a Notification document
    // For now, we just return success
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    })
  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    })
  }
})

// ========== ISSUE COMPLETION ==========

// Complete an issue with photos and feedback
router.put('/issues/:id/complete', isAuthenticated, isVolunteer, [
  body('completionNotes').optional().trim(),
  body('beforePhotos').optional().isArray(),
  body('afterPhotos').optional().isArray(),
  body('hoursSpent').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const volunteerId = req.user._id
    const issueId = req.params.id
    const { completionNotes, beforePhotos, afterPhotos, hoursSpent } = req.body

    // Find issue assigned to this volunteer
    const issue = await Report.findOne({
      _id: issueId,
      assignedTo: volunteerId
    })

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found or not assigned to you'
      })
    }

    // Check if issue is already resolved
    if (issue.status === 'resolved') {
      return res.status(400).json({
        success: false,
        error: 'Issue is already resolved'
      })
    }

    // Add completion photos if provided
    if (afterPhotos && afterPhotos.length > 0) {
      const newPhotos = afterPhotos.map(url => ({
        url,
        uploadedAt: new Date()
      }))
      issue.images = [...(issue.images || []), ...newPhotos]
    }

    // Update issue status to resolved
    const updateData = {
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: volunteerId
    }

    // Calculate resolution time
    if (hoursSpent) {
      updateData.resolutionTimeHours = hoursSpent
    }

    // Add completion comment if notes provided
    if (completionNotes) {
      await Comment.create({
        userId: volunteerId,
        reportId: issueId,
        content: `Task completed: ${completionNotes}`,
        isStatusUpdate: true
      })
    }

    // Update the issue
    const updatedIssue = await Report.findByIdAndUpdate(
      issueId,
      updateData,
      { new: true }
    ).populate('userId', 'name email')

    // Update volunteer stats
    const resolutionTimeHours = hoursSpent || 
      (new Date() - new Date(issue.createdAt)) / (1000 * 60 * 60)

    await User.findByIdAndUpdate(volunteerId, {
      $inc: { 'volunteerInfo.completedReports': 1 }
    })

    // Update average resolution time
    const volunteer = await User.findById(volunteerId)
    const currentAvg = volunteer?.volunteerInfo?.averageResolutionTime || 0
    const completedReports = volunteer?.volunteerInfo?.completedReports || 0
    
    const newAvg = completedReports === 1 
      ? resolutionTimeHours 
      : ((currentAvg * (completedReports - 1)) + resolutionTimeHours) / completedReports
    
    await User.findByIdAndUpdate(volunteerId, {
      'volunteerInfo.averageResolutionTime': newAvg
    })

    res.json({
      success: true,
      message: 'Issue marked as complete',
      issue: updatedIssue,
      stats: {
        resolutionTimeHours: Math.round(resolutionTimeHours * 10) / 10,
        totalCompleted: completedReports
      }
    })
  } catch (error) {
    console.error('Complete issue error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to complete issue'
    })
  }
})

export default router
