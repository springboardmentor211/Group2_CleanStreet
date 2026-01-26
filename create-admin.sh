#!/bin/bash

# Clean Street - Admin Creation Script
# Run this to create an admin user

echo "==================================="
echo "   Clean Street Admin Creator"
echo "==================================="
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    exit 1
fi

# Check if MongoDB is running
echo "📋 Creating admin account..."
echo ""

# Run the admin creation script
node scripts/create-super-admin.js "$@"

echo ""
echo "==================================="
echo "   Admin Creation Complete!"
echo "==================================="
echo ""
echo "🌐 To access admin panel:"
echo "   1. Go to: http://localhost:3000/admin/login"
echo "   2. Login with your admin credentials"
echo ""
echo "📝 To create admin directly (skip prompts):"
echo "   cd backend"
echo "   node scripts/create-super-admin.js --email admin@cleanstreet.com --password Admin123! --name \"Admin\""
echo ""

