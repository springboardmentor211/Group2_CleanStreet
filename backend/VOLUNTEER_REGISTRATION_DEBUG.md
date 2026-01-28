# Volunteer Registration Debugging Guide

## Common Issues & Solutions

### 1. "Registration failed" - Generic Error

**Causes:**
- Phone number format rejection
- Backend not running
- Email already registered
- Database connection issue

**Solution:**
1. Check browser console (F12) for detailed error message
2. Check backend console for error logs
3. Verify backend is running on port 5000

### 2. Phone Number Validation Error

**Issue:** Indian phone numbers being rejected

**Example that should work:**
- `6006835102` (10 digits)
- `+91 60068 35102` (with country code)
- `0120-1234567` (with formatting)

**Backend Validation:**
```javascript
// Accepts:
// - 10 digit numbers: 6006835102
// - E.164 format: +916006835102
// - With formatting: +91 (600) 683-5102
```

### 3. Email Already Registered

**Symptom:** Same email keeps failing

**Solution:**
1. Check if user exists in database
2. Use a different email address
3. Admin can manually delete user from database if needed

### 4. Backend Connection Issues

**Check:**
1. Backend is running: `npm start` in `backend/` folder
2. Backend port: 5000
3. CORS is enabled
4. Credentials mode is set to `withCredentials: true`

### 5. Email Verification Not Sending

**If OTP email not received:**
1. Check email service configuration in `backend/src/config/email.js`
2. Verify email credentials in `.env`
3. Check backend console for email sending errors

## Testing Checklist

```javascript
// Valid test data
{
  "name": "shreya tripathi",
  "email": "shreya.tripathi23@lpu.in",  // or unique email
  "password": "password123",            // min 6 characters
  "phone": "6006835102",               // 10 digit Indian number
  "location": {
    "city": "Sultanpur",
    "state": "Uttar Pradesh",
    "zipCode": "222302"
  }
}
```

## API Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Basic volunteer registration successful. Check your email for OTP verification.",
  "email": "shreya.tripathi23@lpu.in"
}
```

### Error Response with Details
```json
{
  "success": false,
  "error": "Validation error: Invalid email format",
  "errors": [
    {
      "field": "email",
      "message": "Invalid value"
    }
  ]
}
```

## Detailed Error Messages Now Shown

Frontend will display:
- Validation errors
- Email already registered
- Server errors with details (in development mode)

Backend logs will show:
- Full error stack trace
- Validation details
- Database operation errors

## Next Steps if Issue Persists

1. **Check backend logs:**
   ```
   Look for: "Volunteer registration error: ..."
   ```

2. **Verify database:**
   - Check MongoDB is running
   - Verify users collection exists
   - Check if email exists already

3. **Test API directly with curl:**
   ```bash
   curl -X POST http://localhost:5000/api/volunteers/register-basic \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "phone": "1234567890",
       "location": {"city": "Test", "state": "Test", "zipCode": "12345"}
     }'
   ```

4. **Enable debug mode:**
   - Set `NODE_ENV=development` in backend
   - Frontend will show `details` field with error details

## File Locations for Error Handling

- Frontend: `src/pages/volunteer/RegisterBasic.jsx` (Lines 48-58)
- Backend: `src/routes/volunteers.js` (Lines 40-120)
- Auth: `src/routes/auth.js` (Lines 107-140)

## After Registration

1. User receives OTP email
2. Navigate to `/verify-email` or `volunteer.cleanstreet.com/verify-email`
3. Enter OTP to verify email
4. After verification, user can login
5. User is assigned `volunteer_tier: 'basic'` and `volunteer_status: 'active'`
