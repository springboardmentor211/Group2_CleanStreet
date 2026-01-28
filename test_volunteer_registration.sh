#!/bin/bash

# Test Volunteer Registration and Email Verification

API_URL="http://localhost:5000/api"

# Generate random email
RANDOM_ID=$(date +%s)
EMAIL="volunteer_test_${RANDOM_ID}@example.com"

echo "=========================================="
echo "Testing Volunteer Registration"
echo "=========================================="
echo ""
echo "Email: $EMAIL"
echo "Sending request to: $API_URL/volunteers/register-basic"
echo ""

# Make the request
RESPONSE=$(curl -s -X POST "$API_URL/volunteers/register-basic" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"Test@123456\",
    \"name\": \"Test Volunteer\",
    \"phone\": \"9876543210\",
    \"location\": {
      \"city\": \"Mumbai\",
      \"state\": \"Maharashtra\",
      \"zipCode\": \"400001\"
    }
  }")

echo "Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

echo ""
echo "=========================================="
echo "If success: Email should be sent to $EMAIL"
echo "Check backend console logs for:"
echo "  ✅ Email service connected successfully"
echo "  📧 Email sent to: $EMAIL"
echo "=========================================="
