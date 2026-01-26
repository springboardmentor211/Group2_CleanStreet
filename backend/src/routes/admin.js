import express from 'express'
import passport from '../config/passport.js'
import User from '../models/User.js'
import { body, validationResult } from 'express-validator'
import { authLimiter, otpRequestLimiter } from '../middleware/rateLimiter.js'
import emailService from '../config/email.js'
import crypto from 'crypto'

const router = express.Router()

// ========== ADMIN MIDDLEWARE ==========

// Check if user is authenticated AND is admin
const isAdmin = (req, res, next) => {
  console.log('🔐 isAdmin check:', {
    authenticated: req.isAuthenticated(),
    user: req.user?.email,
    role: req.user?.role,
    sessionID: req.sessionID,
    cookies: Object.keys(req.cookies)
  })
  if (req.isAuthenticated() && ['admin', 'super-admin'].includes(req.user.role)) {
    return next()
  }
  res.status(403).json({ 
    success: false,
    error: 'Admin access required' 
  })
}

// Check if user is super admin
const isSuperAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isSuperAdmin === true) {
    return next()
  }
  res.status(403).json({ 
    success: false,
    error: 'Super admin access required' 
  })
}

// ========== ADMIN AUTH ROUTES ==========

// 1. Admin Login (with super admin check)
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], authLimiter, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: info?.message || 'Invalid credentials' 
      })
    }
    
    // Check if user is admin or super-admin
    if (!['admin', 'super-admin'].includes(user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required. Please use regular login.',
        userLoginUrl: '/login'
      })
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Contact super admin.'
      })
    }
    
    req.login(user, async (err) => {
      if (err) {
        return next(err)
      }
      
      // Update last login
      user.lastLogin = new Date()
      await user.save()
      
      // Check if password change is required
      if (user.mustChangePassword) {
        return res.json({
          success: true,
          message: 'Login successful. Password change required.',
          requiresPasswordChange: true,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            isSuperAdmin: user.isSuperAdmin
          }
        })
      }
      
      res.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
          permissions: user.permissions,
          isEmailVerified: user.isEmailVerified,
          twoFactorEnabled: user.twoFactorEnabled
        }
      })
    })
  })(req, res, next)
})

// 2. Setup First Super Admin (via web - protected by secret key)
router.post('/setup', async (req, res) => {
  try {
    const { secretKey } = req.body
    
    // Validate secret key
    if (!secretKey || secretKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ 
        success: false,
        error: 'Invalid setup key' 
      })
    }
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ isSuperAdmin: true })
    if (existingSuperAdmin) {
      return res.status(400).json({ 
        success: false,
        error: 'Super admin already exists. Cannot create another via web.',
        note: 'Use CLI tool for additional super admins'
      })
    }
    
    // Get credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_NAME || 'System Administrator'
    
    if (!adminEmail || !adminPassword) {
      return res.status(500).json({
        success: false,
        error: 'Admin credentials not configured in environment variables'
      })
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: adminEmail })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      })
    }
    
    // Create super admin
    const admin = new User({
      email: adminEmail.toLowerCase().trim(),
      password: adminPassword,
      name: adminName,
      role: 'super-admin',
      isSuperAdmin: true,
      permissions: ['all'],
      isEmailVerified: true,
      isActive: true,
      mustChangePassword: process.env.FORCE_PASSWORD_CHANGE === 'true'
    })
    
    await admin.save()
    
    // Generate 2FA secret if enabled
    let twoFactorSecret = null
    if (process.env.ENABLE_SUPER_ADMIN_2FA === 'true') {
      twoFactorSecret = crypto.randomBytes(20).toString('hex')
      admin.twoFactorSecret = twoFactorSecret
      await admin.save()
    }
    
    // Send welcome email
    await emailService.sendEmail(
      adminEmail,
      'Super Administrator Account Created',
      `
        <h2>Super Administrator Account Created</h2>
        <p>Your super administrator account has been created successfully.</p>
        <p><strong>Email:</strong> ${adminEmail}</p>
        <p><strong>Name:</strong> ${adminName}</p>
        ${admin.mustChangePassword ? '<p><strong>Note:</strong> You must change your password on first login.</p>' : ''}
        ${twoFactorSecret ? `<p><strong>2FA Secret:</strong> ${twoFactorSecret}</p>` : ''}
        <hr>
        <p><em>Please store these credentials securely.</em></p>
      `
    )
    
    // Clear password from response for security
    const response = {
      success: true,
      message: 'Super admin created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        mustChangePassword: admin.mustChangePassword
      }
    }
    
    // Only include 2FA secret in response if not sent via email
    if (twoFactorSecret && process.env.ENABLE_SUPER_ADMIN_2FA === 'true') {
      response.twoFactorSecret = twoFactorSecret
      response.note = 'Save this 2FA secret securely!'
    }
    
    res.status(201).json(response)
    
  } catch (error) {
    console.error('Admin setup error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Admin setup failed' 
    })
  }
})

// 3. Force Password Change (for first login)
router.post('/force-password-change', isAdmin, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      })
    }
    
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')
    
    // Verify current password
    const isValid = await user.comparePassword(currentPassword)
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }
    
    // Update password
    user.password = newPassword
    user.mustChangePassword = false
    await user.save()
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    })
    
  } catch (error) {
    console.error('Password change error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    })
  }
})

// 4. Create Regular Admin (only by super admin)
router.post('/create-admin', isSuperAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty(),
  body('permissions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      })
    }
    
    const { email, password, name, permissions = [] } = req.body
    
    console.log('📝 Creating admin:', { email, name })
    
    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already registered' 
      })
    }
    
    // Create admin (not super admin)
    const admin = new User({
      email,
      password,
      name,
      role: 'admin',
      isSuperAdmin: false,
      permissions,
      isEmailVerified: true,
      isActive: true,
      mustChangePassword: true // Force password change for new admins
    })
    
    await admin.save()
    console.log('✅ Admin created:', admin.email)
    
    // Send welcome email
    try {
      await emailService.sendEmail(
        email,
        'Admin Account Created',
        `
          <h2>Welcome to Clean Street Admin Panel</h2>
          <p>Your administrator account has been created.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
          <p><strong>Note:</strong> You must change your password on first login.</p>
          <p>Login URL: ${process.env.ADMIN_FRONTEND_URL || 'http://localhost:3000/admin'}</p>
          <hr>
          <p><em>This is an automated message. Do not reply.</em></p>
        `
      )
      console.log('📧 Welcome email sent to:', email)
    } catch (emailError) {
      console.warn('⚠️  Email send failed (non-critical):', emailError.message)
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      }
    })
    
  } catch (error) {
    console.error('❌ Create admin error:', error.message, error.stack)
    res.status(500).json({ 
      success: false,
      error: 'Failed to create admin',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// 5. Get All Admins (super admin only)
router.get('/admins', isSuperAdmin, async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ['admin', 'super-admin'] }
    }).select('-password -twoFactorSecret')
    
    res.json({
      success: true,
      admins
    })
    
  } catch (error) {
    console.error('Get admins error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admins'
    })
  }
})

// 6. Update Admin Permissions (super admin only)
router.put('/admins/:id/permissions', isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { permissions } = req.body
    
    const admin = await User.findOne({
      _id: id,
      role: { $in: ['admin', 'super-admin'] }
    })
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      })
    }
    
    // Cannot modify super admin permissions
    if (admin.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify super admin permissions'
      })
    }
    
    // Cannot modify yourself
    if (admin._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify your own permissions'
      })
    }
    
    admin.permissions = permissions
    await admin.save()
    
    res.json({
      success: true,
      message: 'Permissions updated successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        permissions: admin.permissions
      }
    })
    
  } catch (error) {
    console.error('Update permissions error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update permissions'
    })
  }
})

// ========== ADMIN DASHBOARD ROUTES ==========
// Get users (admin or super-admin)
router.get('/users', isAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 0
    const query = {}

    const usersQuery = User.find(query)
      .select('-password -twoFactorSecret')
      .sort({ createdAt: -1 })

    if (limit > 0) {
      usersQuery.limit(limit)
    }

    const users = await usersQuery.exec()

    res.json({
      success: true,
      users
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    })
  }
})

// Update user active status (admin or super-admin)
router.put('/users/:id/status', isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Prevent disabling super admin unless caller is super admin
    if (user.isSuperAdmin && !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only a super admin can modify another super admin'
      })
    }

    user.isActive = !!isActive
    await user.save()

    res.json({
      success: true,
      message: 'User status updated',
      user: {
        id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    })
  }
})

// Delete user (admin or super-admin)
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Prevent deleting super admin unless caller is super admin
    if (user.isSuperAdmin && !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only a super admin can delete another super admin'
      })
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      })
    }

    await User.deleteOne({ _id: id })

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    })
  }
})

// Basic dashboard stats (optional)
router.get('/dashboard/stats', isAdmin, async (_req, res) => {
  try {
    const [totalUsers, activeUsers, totalAdmins, totalSuperAdmins] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $in: ['admin', 'super-admin'] } }),
      User.countDocuments({ isSuperAdmin: true })
    ])

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalAdmins,
        totalSuperAdmins
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    })
  }
})

// ========== VOLUNTEER MANAGEMENT ROUTES ==========

// Get pending volunteers (admin only)
router.get('/volunteers/pending', isAdmin, async (req, res) => {
  try {
    const volunteers = await User.find({
      role: 'volunteer',
      isActive: false,
      'volunteerInfo.status': 'pending'
    }).select('-password')

    res.json({
      success: true,
      volunteers,
      count: volunteers.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending volunteers'
    })
  }
})

// Approve/Reject volunteer (admin only)
router.put('/volunteers/:id/status', isAdmin, [
  body('status').isIn(['approved', 'rejected']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const volunteer = await User.findById(id)
    
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({
        success: false,
        error: 'Volunteer not found'
      })
    }

    // Update volunteer status
    volunteer.isActive = status === 'approved'
    volunteer.volunteerInfo.status = status
    volunteer.volunteerInfo.approvedAt = new Date()
    volunteer.volunteerInfo.approvedBy = req.user._id
    if (notes) volunteer.volunteerInfo.notes = notes

    // Auto-verify email upon approval (admin approval supersedes email verification)
    // This ensures approved volunteers can login immediately
    if (status === 'approved' && !volunteer.isEmailVerified) {
      volunteer.isEmailVerified = true
      volunteer.emailVerificationOTP = undefined
      volunteer.emailVerificationExpiry = undefined
    }

    await volunteer.save()

    // Send email notification to volunteer
    await emailService.sendEmail(
      volunteer.email,
      status === 'approved' 
        ? 'Volunteer Application Approved - Clean Street' 
        : 'Volunteer Application Update - Clean Street',
      status === 'approved'
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">🎉 Congratulations! Your Volunteer Application is Approved</h2>
            <p>Welcome to the Clean Street Volunteer Team!</p>
            <p>You can now login to your volunteer dashboard and start helping your community.</p>
            <div style="background: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Login Details:</strong></p>
              <p><strong>Email:</strong> ${volunteer.email}</p>
              <p><strong>Role:</strong> Volunteer</p>
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/volunteer/login" 
               style="display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Go to Volunteer Login
            </a>
            <hr>
            <p style="color: #999; font-size: 12px;">Thank you for joining our mission!</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f44336;">Volunteer Application Update</h2>
            <p>Thank you for your interest in volunteering with Clean Street.</p>
            <p>After careful review, we regret to inform you that your application was not approved at this time.</p>
            ${notes ? `<p><strong>Note from admin:</strong> ${notes}</p>` : ''}
            <p>You can still contribute as a regular citizen by reporting issues in your area.</p>
            <hr>
            <p style="color: #999; font-size: 12px;">We appreciate your understanding.</p>
          </div>
        `
    )

    res.json({
      success: true,
      message: `Volunteer application ${status}`,
      volunteer: {
        id: volunteer._id,
        email: volunteer.email,
        name: volunteer.name,
        isActive: volunteer.isActive,
        status: volunteer.volunteerInfo.status
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update volunteer status'
    })
  }
})

export default router
