#!/usr/bin/env node
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(dirname(__dirname), '.env') })

// Import User model
const modelsPath = join(dirname(__dirname), 'src', 'models', 'User.js')
const { default: User } = await import(`file://${modelsPath}`)

const createAdmin = async (options = {}) => {
  let mongoConnection = null

  try {
    console.log('===================================')
    console.log('   ADMIN CREATION TOOL')
    console.log('===================================\n')

    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...')
    mongoConnection = await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const email = options.email || 'adimin@test'
    const password = options.password || 'Admin@123'
    const name = options.name || 'Admin User'

    // Check if email already exists
    console.log('🔍 Checking if email already exists...')
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })

    if (existingUser) {
      console.log('\n❌ User with this email already exists!')
      console.log('📧 Email:', existingUser.email)
      console.log('🎭 Role:', existingUser.role)
      console.log('\n⚠️  Use a different email or delete the existing user first')
      return {
        success: false,
        error: 'Email already exists'
      }
    }

    console.log('\n🔄 Creating admin user...')

    // Create regular admin
    const admin = new User({
      email: email.toLowerCase().trim(),
      password: password,
      name: name.trim(),
      role: 'admin',
      isSuperAdmin: false,
      permissions: ['manage_users', 'manage_reports', 'view_analytics'],
      isEmailVerified: true,
      isActive: true,
      mustChangePassword: false
    })

    await admin.save()

    console.log('\n' + '='.repeat(50))
    console.log('✅ ADMIN CREATED SUCCESSFULLY')
    console.log('='.repeat(50))
    console.log('📧 Email:', admin.email)
    console.log('👤 Name:', admin.name)
    console.log('🎭 Role:', admin.role)
    console.log('🔑 Permissions:', admin.permissions.join(', '))
    console.log('🆔 User ID:', admin._id)
    console.log('📅 Created:', admin.createdAt)
    console.log('='.repeat(50))

    console.log('\n🔒 SECURITY NOTES:')
    console.log('1. Store these credentials securely')
    console.log('2. Change the password regularly')
    console.log('\n🚀 Admin created successfully!\n')

    return {
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    return {
      success: false,
      error: error.message
    }
  } finally {
    if (mongoConnection) {
      await mongoose.disconnect()
      console.log('🔗 MongoDB connection closed')
    }
  }
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const options = {}

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      options.email = args[++i]
    } else if (args[i] === '--password' && args[i + 1]) {
      options.password = args[++i]
    } else if (args[i] === '--name' && args[i + 1]) {
      options.name = args[++i]
    } else if (args[i] === '--help') {
      console.log(`
Admin Creation Tool
===================
Usage: node scripts/create-admin.js [options]

Options:
  --email <email>      Admin email address
  --password <pass>    Admin password (min 8 chars)
  --name <name>        Admin full name
  --help               Show this help message

Examples:
  node scripts/create-admin.js
  node scripts/create-admin.js --email admin@example.com --password "Pass123!" --name "Admin Name"
      `)
      process.exit(0)
    }
  }

  createAdmin(options).then(result => {
    if (!result.success) {
      process.exit(1)
    }
    process.exit(0)
  })
}

export default createAdmin

