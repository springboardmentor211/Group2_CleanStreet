import mongoose from 'mongoose'

const voteSchema = new mongoose.Schema({
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
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  }
}, {
  timestamps: true
})

// Prevent duplicate votes from same user on same report
voteSchema.index({ userId: 1, reportId: 1 }, { unique: true })

// Index for efficient queries
voteSchema.index({ reportId: 1 })
voteSchema.index({ userId: 1 })

const Vote = mongoose.model('Vote', voteSchema)

export default Vote

