import rateLimit from 'express-rate-limit'

// Helper: per-user key (email preferred), falls back to IP
const getKeyGenerator = (emailField = 'email') => {
  return (req) => {
    if (req.body && req.body[emailField]) {
      return `${emailField}:${String(req.body[emailField]).toLowerCase()}`
    }
    return req.ip || req.connection?.remoteAddress || 'unknown'
  }
}

// Custom handler for consistent error responses
const rateLimitHandler = (req, res, next, options) => {
  res.status(options.statusCode).json({
    success: false,
    error: options.message?.error || 'Too many attempts, please try again later'
  })
}

// General auth rate limiter (per email) - for login/register
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 requests per windowMs (increased from 5)
  message: {
    success: false,
    error: 'Too many attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: getKeyGenerator('email'),
  handler: rateLimitHandler,
  statusCode: 429
})

// Stricter limiter for password reset (per email)
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per windowMs
  message: {
    success: false,
    error: 'Too many password reset attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKeyGenerator('email')
})

// Limiter for OTP requests (per email)
export const otpRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 2, // 2 requests per windowMs
  message: {
    success: false,
    error: 'Too many OTP requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKeyGenerator('email')
})

// API rate limiter for general endpoints (IP-based is fine here)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  statusCode: 429
})

// User info limiter - for /auth/me endpoint (session check)
// Higher limit since this is called frequently for auth status checks
export const userInfoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per windowMs - higher limit for session checks
  message: {
    success: false,
    error: 'Too many auth status requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown',
  handler: rateLimitHandler,
  statusCode: 429
})
