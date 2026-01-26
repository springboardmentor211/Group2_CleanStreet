import mongoose from 'mongoose'

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'USER_BLOCKED',
      'USER_UNBLOCKED',
      'REPORT_CREATED',
      'REPORT_UPDATED',
      'REPORT_DELETED',
      'REPORT_STATUS_CHANGED',
      'REPORT_ASSIGNED',
      'ADMIN_CREATED',
      'ADMIN_UPDATED',
      'ADMIN_DELETED',
      'SETTINGS_CHANGED',
      'LOGIN',
      'LOGOUT'
    ]
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['User', 'Report', 'Admin', 'Settings']
  },
  details: {
    type: String,
    maxLength: 1000
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
})

// Index for efficient queries
adminLogSchema.index({ adminId: 1, createdAt: -1 })
adminLogSchema.index({ action: 1, createdAt: -1 })
adminLogSchema.index({ targetId: 1 })

const AdminLog = mongoose.model('AdminLog', adminLogSchema)

export default AdminLog

