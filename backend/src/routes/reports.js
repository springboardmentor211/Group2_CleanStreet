import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import Report from '../models/Report.js'
import User from '../models/User.js'
import Vote from '../models/Vote.js'
import Comment from '../models/Comment.js'
import AdminLog from '../models/AdminLog.js'
import { body, validationResult } from 'express-validator'

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'reports')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'), false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
})

const router = express.Router()

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({
    success: false,
    error: 'Not authenticated'
  })
}

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const user = await User.findById(req.user._id)
      if (user && ['admin', 'super-admin'].includes(user.role)) {
        return next()
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Server error'
      })
    }
  }
  res.status(403).json({
    success: false,
    error: 'Admin access required'
  })
}

// Create a new report
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    let reportData
    
    // Check if we're receiving multipart/form-data or application/json
    if (req.body.data) {
      // Parse the JSON data from 'data' field (file upload scenario)
      reportData = JSON.parse(req.body.data)
    } else {
      // Regular JSON submission
      reportData = req.body
    }

    const {
      category,
      title,
      description,
      priority = 'medium',
      latitude,
      longitude,
      address,
      isAnonymous = false,
      allowComments = true
    } = reportData

    // Validate required fields
    const validCategories = ['garbage', 'pothole', 'water', 'streetlight', 'park', 'sewage', 'vandalism', 'other']
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      })
    }

    if (!title || title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Title must be at least 5 characters long'
      })
    }

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Description must be at least 10 characters long'
      })
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      })
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Location coordinates are required'
      })
    }

    const report = new Report({
      userId: req.user._id,
      category,
      title,
      description,
      priority,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      latitude,
      longitude,
      address,
      isAnonymous,
      allowComments
    })

    // Add uploaded images
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => ({
        url: `/uploads/reports/${path.basename(file.path)}`,
        public_id: path.basename(file.path),
        uploadedAt: new Date()
      }))
      report.images = imageUrls.slice(0, 10) // Max 10 images
    }

    await report.save()

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report: {
        id: report._id,
        category: report.category,
        title: report.title,
        status: report.status,
        images: report.images,
        createdAt: report.createdAt
      }
    })
  } catch (error) {
    console.error('Report creation error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create report'
    })
  }
})

// Get user's reports
router.get('/my-reports', isAuthenticated, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .select('-comments')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      reports,
      count: reports.length
    })
  } catch (error) {
    console.error('Fetch reports error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    })
  }
})

// Get single report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'name email profilePicture')

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    res.json({
      success: true,
      report
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report'
    })
  }
})

// Update report status (admin only)
router.put('/:id/status', isAdmin, [
  body('status').isIn(['received', 'in_review', 'in-progress', 'resolved', 'rejected'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { status } = req.body
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'resolved' && { resolvedAt: new Date(), resolvedBy: req.user._id })
      },
      { new: true }
    )

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    // Log admin action
    await AdminLog.create({
      adminId: req.user._id,
      action: 'REPORT_STATUS_CHANGED',
      targetId: report._id,
      targetModel: 'Report',
      details: `Status changed to ${status}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    res.json({
      success: true,
      message: 'Report status updated',
      report
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update report'
    })
  }
})

// ========== VOTING ENDPOINTS ==========

// Vote on a report (upvote or downvote)
router.post('/:id/vote', isAuthenticated, [
  body('voteType').isIn(['upvote', 'downvote'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { voteType } = req.body
    const reportId = req.params.id

    // Check if report exists
    const report = await Report.findById(reportId)
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      userId: req.user._id,
      reportId
    })

    let voteChange = 0
    let previousVoteType = null

    if (existingVote) {
      previousVoteType = existingVote.voteType
      
      if (existingVote.voteType === voteType) {
        // User is removing their vote (toggle off)
        await Vote.deleteOne({ _id: existingVote._id })
        voteChange = voteType === 'upvote' ? -1 : 1
      } else {
        // User is changing vote type
        existingVote.voteType = voteType
        await existingVote.save()
        voteChange = voteType === 'upvote' ? 2 : -2 // +2 or -2 because we're switching
      }
    } else {
      // Create new vote
      await Vote.create({
        userId: req.user._id,
        reportId,
        voteType
      })
      voteChange = voteType === 'upvote' ? 1 : -1
    }

    // Update report vote counts
    if (voteChange !== 0) {
      if (voteChange === 1) {
        report.upvotes += 1
        report.downvotes = Math.max(0, report.downvotes - 1)
      } else if (voteChange === -1) {
        report.downvotes += 1
        report.upvotes = Math.max(0, report.upvotes - 1)
      } else if (voteChange === 2) {
        report.upvotes += 2
        report.downvotes = Math.max(0, report.downvotes - 1)
      } else if (voteChange === -2) {
        report.downvotes += 2
        report.upvotes = Math.max(0, report.upvotes - 1)
      }
      await report.save()
    }

    // Get user's current vote status
    const userVote = await Vote.findOne({
      userId: req.user._id,
      reportId
    })

    res.json({
      success: true,
      message: existingVote && existingVote.voteType === voteType ? 'Vote removed' : 'Vote recorded',
      upvotes: report.upvotes,
      downvotes: report.downvotes,
      userVote: userVote ? userVote.voteType : null
    })
  } catch (error) {
    console.error('Vote error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to record vote'
    })
  }
})

// Get user's vote on a report
router.get('/:id/vote', isAuthenticated, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      userId: req.user._id,
      reportId: req.params.id
    })

    res.json({
      success: true,
      vote: vote ? vote.voteType : null
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get vote'
    })
  }
})

// ========== COMMENT ENDPOINTS ==========

// Add a comment to a report
router.post('/:id/comments', isAuthenticated, [
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

    const { content } = req.body
    const reportId = req.params.id

    // Check if report exists and allows comments
    const report = await Report.findById(reportId)
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    if (!report.allowComments) {
      return res.status(400).json({
        success: false,
        error: 'Comments are disabled for this report'
      })
    }

    // Create comment
    const comment = await Comment.create({
      userId: req.user._id,
      reportId,
      content
    })

    // Populate user info
    await comment.populate('userId', 'name email profilePicture')

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    })
  } catch (error) {
    console.error('Comment error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add comment'
    })
  }
})

// Get all comments for a report
router.get('/:id/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const comments = await Comment.find({
      reportId: req.params.id,
      isDeleted: false
    })
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean()

    const total = await Comment.countDocuments({
      reportId: req.params.id,
      isDeleted: false
    })

    res.json({
      success: true,
      comments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    })
  }
})

// Update a comment
router.put('/comments/:commentId', isAuthenticated, [
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

    const { content } = req.body
    const comment = await Comment.findById(req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      })
    }

    // Check ownership
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to edit this comment'
      })
    }

    comment.content = content
    comment.isEdited = true
    await comment.save()

    await comment.populate('userId', 'name email profilePicture')

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update comment'
    })
  }
})

// Delete a comment (soft delete)
router.delete('/comments/:commentId', isAuthenticated, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      })
    }

    // Check ownership or admin
    const user = await User.findById(req.user._id)
    if (comment.userId.toString() !== req.user._id.toString() && 
        !['admin', 'super-admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      })
    }

    comment.isDeleted = true
    await comment.save()

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment'
    })
  }
})

// ========== ASSIGNMENT ENDPOINTS ==========

// Assign report to an authority/volunteer (admin only)
router.put('/:id/assign', isAdmin, [
  body('assignedTo').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { assignedTo } = req.body

    // Verify the assigned user exists and is a volunteer or admin
    const assignee = await User.findById(assignedTo)
    if (!assignee) {
      return res.status(404).json({
        success: false,
        error: 'Assigned user not found'
      })
    }

    if (!['volunteer', 'admin', 'super-admin'].includes(assignee.role)) {
      return res.status(400).json({
        success: false,
        error: 'Reports can only be assigned to volunteers or admins'
      })
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo,
        assignedAt: new Date(),
        status: 'in_review'
      },
      { new: true }
    ).populate('assignedTo', 'name email')

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    // Log admin action
    await AdminLog.create({
      adminId: req.user._id,
      action: 'REPORT_ASSIGNED',
      targetId: report._id,
      targetModel: 'Report',
      details: `Assigned to ${assignee.name} (${assignee.role})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    res.json({
      success: true,
      message: 'Report assigned successfully',
      report
    })
  } catch (error) {
    console.error('Assignment error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to assign report'
    })
  }
})

// Get reports assigned to current user (for volunteers/admins)
router.get('/assigned/me', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!['volunteer', 'admin', 'super-admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      })
    }

    const reports = await Report.find({ assignedTo: req.user._id })
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      reports,
      count: reports.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assigned reports'
    })
  }
})

// Get available volunteers for assignment (admin only)
router.get('/volunteers', isAdmin, async (req, res) => {
  try {
    const volunteers = await User.find({
      role: { $in: ['volunteer', 'admin'] },
      isActive: true
    })
      .select('name email role zone location')
      .lean()

    res.json({
      success: true,
      volunteers
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch volunteers'
    })
  }
})

// ========== IMAGE UPLOAD ENDPOINTS ==========

// Upload images for a report
router.post('/upload/:reportId', isAuthenticated, upload.array('images', 5), async (req, res) => {
  try {
    const reportId = req.params.reportId
    const files = req.files

    // Check if report exists
    const report = await Report.findById(reportId)
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    // Check ownership
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to upload images to this report'
      })
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      })
    }

    // Save file paths to report
    const newImages = files.map(file => ({
      url: `/uploads/reports/${path.basename(file.path)}`,
      public_id: path.basename(file.path),
      uploadedAt: new Date()
    }))
    report.images = [...(report.images || []), ...newImages].slice(0, 10) // Max 10 images
    await report.save()

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: report.images,
      uploadedCount: files.length
    })
  } catch (error) {
    console.error('Image upload error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    })
  }
})

// Delete an image from a report
router.delete('/images/:reportId/:imageIndex', isAuthenticated, async (req, res) => {
  try {
    const { reportId, imageIndex } = req.params
    const index = parseInt(imageIndex)

    const report = await Report.findById(reportId)
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      })
    }

    // Check ownership
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete images from this report'
      })
    }

    if (!report.images || index >= report.images.length || index < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image index'
      })
    }

    // Delete the file from filesystem
    const imageToDelete = report.images[index]
    if (imageToDelete && imageToDelete.url) {
      const filePath = path.join(process.cwd(), imageToDelete.url)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Remove from array
    report.images.splice(index, 1)
    await report.save()

    res.json({
      success: true,
      message: 'Image deleted successfully',
      images: report.images
    })
  } catch (error) {
    console.error('Image delete error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    })
  }
})

export default router
