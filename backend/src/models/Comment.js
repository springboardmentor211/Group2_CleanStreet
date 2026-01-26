import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index for efficient queries
commentSchema.index({ reportId: 1, createdAt: -1 })
commentSchema.index({ userId: 1 })

// Virtual for formatted date
commentSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const Comment = mongoose.model('Comment', commentSchema)

export default Comment

