import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password not required if user is OAuth authenticated
      return !this.googleId
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['citizen', 'volunteer', 'admin', 'super-admin'],
    default: 'citizen'
  },
  
  // Super admin specific fields
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  permissions: [{
    type: String,
    enum: ['all', 'manage_users', 'manage_reports', 'manage_settings', 'manage_admins', 'view_analytics', 'manage_content']
  }],
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: {
    type: String
  },
  emailVerificationExpiry: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  }, // User's geographic area/zone for assignment
  zone: {
    type: String,
    default: ''
  }, // Zone for zonal assignment
  
  // Volunteer specific information
  volunteerInfo: {
    reason: {
      type: String,
      default: ''
    },
    appliedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedAt: {
      type: Date
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      default: ''
    },
    skills: [{
      type: String
    }],
    availability: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    completedReports: {
      type: Number,
      default: 0
    },
    averageResolutionTime: {
      type: Number, // in hours
      default: 0
    }
  },
  
  lastLogin: {
    type: Date
  },
  
  // 2FA settings
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String
  },
  
  // Account security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  
  // Password reset
  resetPasswordOTP: {
    type: String
  },
  resetPasswordExpiry: {
    type: Date
  },
  
  // Google OAuth
  googleId: {
    type: String
  },
  
  // Citizen specific fields (for future use)
  citizenStats: {
    reportsSubmitted: {
      type: Number,
      default: 0
    },
    reportsResolved: {
      type: Number,
      default: 0
    },
    upvotesGiven: {
      type: Number,
      default: 0
    },
    commentsMade: {
      type: Number,
      default: 0
    }
  },
  
  // Admin specific fields
  adminStats: {
    reportsAssigned: {
      type: Number,
      default: 0
    },
    reportsResolved: {
      type: Number,
      default: 0
    },
    volunteersManaged: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Check if user has permission
userSchema.methods.hasPermission = function(permission) {
  if (this.isSuperAdmin || this.permissions.includes('all')) {
    return true
  }
  return this.permissions.includes(permission)
}

// Check if user can manage other admins
userSchema.methods.canManageAdmins = function() {
  return this.isSuperAdmin || this.hasPermission('manage_admins')
}

// Check if user is approved volunteer
userSchema.methods.isApprovedVolunteer = function() {
  return this.role === 'volunteer' && 
         this.isActive && 
         this.volunteerInfo.status === 'approved'
}

// Get volunteer rating (rounded to 1 decimal)
userSchema.methods.getVolunteerRating = function() {
  if (this.role !== 'volunteer') return null
  return Math.round(this.volunteerInfo.rating * 10) / 10
}

// Increment completed reports for volunteer
userSchema.methods.incrementCompletedReports = async function() {
  if (this.role === 'volunteer') {
    this.volunteerInfo.completedReports += 1
    await this.save()
  }
}

// Update volunteer rating
userSchema.methods.updateVolunteerRating = async function(newRating) {
  if (this.role === 'volunteer' && newRating >= 0 && newRating <= 5) {
    // Calculate new average rating
    const currentRating = this.volunteerInfo.rating
    const completedReports = this.volunteerInfo.completedReports
    
    if (completedReports === 0) {
      this.volunteerInfo.rating = newRating
    } else {
      this.volunteerInfo.rating = ((currentRating * completedReports) + newRating) / (completedReports + 1)
    }
    
    await this.save()
  }
}

// Update average resolution time for volunteer
userSchema.methods.updateResolutionTime = async function(hoursToResolve) {
  if (this.role === 'volunteer' && hoursToResolve > 0) {
    const currentAvg = this.volunteerInfo.averageResolutionTime
    const completed = this.volunteerInfo.completedReports
    
    if (completed === 0) {
      this.volunteerInfo.averageResolutionTime = hoursToResolve
    } else {
      this.volunteerInfo.averageResolutionTime = 
        ((currentAvg * completed) + hoursToResolve) / (completed + 1)
    }
    
    await this.save()
  }
}

// Check if volunteer can be assigned new reports (not overloaded)
userSchema.methods.canAcceptNewReports = function(maxReports = 10) {
  if (this.role !== 'volunteer') return false
  
  // You can implement logic here to check if volunteer is overloaded
  // For now, just check if they're active and approved
  return this.isActive && this.volunteerInfo.status === 'approved'
}

// Virtual for volunteer performance score
userSchema.virtual('volunteerPerformanceScore').get(function() {
  if (this.role !== 'volunteer') return null
  
  const ratingWeight = 0.4
  const completedWeight = 0.3
  const timeWeight = 0.3
  
  const ratingScore = (this.volunteerInfo.rating / 5) * 100
  const completedScore = Math.min(this.volunteerInfo.completedReports * 10, 100)
  const timeScore = this.volunteerInfo.averageResolutionTime > 0 
    ? Math.max(0, 100 - (this.volunteerInfo.averageResolutionTime * 2))
    : 50 // Default score if no data
  
  return Math.round(
    (ratingScore * ratingWeight) + 
    (completedScore * completedWeight) + 
    (timeScore * timeWeight)
  )
})

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ 'volunteerInfo.status': 1 })
userSchema.index({ location: 1 })
userSchema.index({ zone: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ 'volunteerInfo.rating': -1 })

const User = mongoose.model('User', userSchema)
export default User