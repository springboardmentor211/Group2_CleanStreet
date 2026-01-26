import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['garbage', 'pothole', 'water', 'streetlight', 'park', 'sewage', 'vandalism', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  latitude: Number,
  longitude: Number,
  images: [{
    url: String,
    public_id: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['received', 'in_review', 'in-progress', 'resolved', 'rejected'],
    default: 'received'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }, // Assigned municipal authority or volunteer
  assignedAt: {
    type: Date,
    default: null
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: mongoose.Schema.Types.ObjectId,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date,
  resolvedBy: mongoose.Schema.Types.ObjectId
}, {
  timestamps: true
})

// Create geospatial index for map queries
reportSchema.index({ 'location': '2dsphere' })
reportSchema.index({ userId: 1, createdAt: -1 })
reportSchema.index({ status: 1 })
reportSchema.index({ category: 1 })
reportSchema.index({ assignedTo: 1 })
reportSchema.index({ createdAt: -1 })

export default mongoose.model('Report', reportSchema)
