# Report API Testing Guide

## Prerequisites
- Backend running on `http://localhost:5000`
- MongoDB running locally
- User must be authenticated to create reports

## Test Steps

### Step 1: Health Check
```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "success": true,
  "status": "OK",
  "message": "Clean Street API is running",
  "session": "active",
  "user": "guest",
  "timestamp": "2026-01-03T12:33:51.537Z"
}
```

---

### Step 2: Login to Get Session
```bash
curl -c cookies.txt http://localhost:5000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Note:** First, ensure a test user exists in the database. If not, register one:
```bash
curl http://localhost:5000/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

---

### Step 3: Create a Report (Authenticated)
```bash
curl -b cookies.txt http://localhost:5000/api/reports/create \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "category": "garbage",
    "title": "Garbage pile at main street",
    "description": "Large garbage pile blocking the sidewalk near the corner market",
    "priority": "high",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main Street, New York, NY",
    "isAnonymous": false,
    "allowComments": true
  }'
```

Expected Success Response (201):
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "report": {
    "id": "507f1f77bcf86cd799439011",
    "category": "garbage",
    "title": "Garbage pile at main street",
    "status": "open",
    "createdAt": "2026-01-03T12:35:00.000Z"
  }
}
```

Expected Error Response (401):
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

---

### Step 4: Fetch User's Reports (Authenticated)
```bash
curl -b cookies.txt http://localhost:5000/api/reports/my-reports
```

Expected Response:
```json
{
  "success": true,
  "reports": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "category": "garbage",
      "title": "Garbage pile at main street",
      "description": "Large garbage pile blocking the sidewalk...",
      "priority": "high",
      "address": "123 Main Street, New York, NY",
      "status": "open",
      "views": 0,
      "upvotes": 0,
      "downvotes": 0,
      "createdAt": "2026-01-03T12:35:00.000Z",
      "updatedAt": "2026-01-03T12:35:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Step 5: Get All Public Reports
```bash
curl "http://localhost:5000/api/reports?category=garbage&limit=10&page=1"
```

Expected Response:
```json
{
  "success": true,
  "reports": [...],
  "pagination": {
    "total": 5,
    "page": 1,
    "pages": 1
  }
}
```

---

## Database Verification

Check MongoDB for saved reports:

```bash
# Connect to MongoDB
mongo

# Select database
use clean_street

# Find all reports
db.reports.find()

# Count reports
db.reports.countDocuments()

# Find reports by user email (requires user ID)
db.reports.find({ userId: ObjectId("...") })
```

---

## Troubleshooting

### 401 Unauthorized
- Ensure you're using `-b cookies.txt` to include session cookies
- Make sure the user is authenticated before creating reports

### 400 Validation Error
- Check all required fields are provided
- Validate field types (latitude/longitude should be numbers)
- Ensure category is one of the valid options

### 500 Server Error
- Check backend logs for errors
- Ensure MongoDB is running
- Verify database connection in `.env` file

---

## Summary of API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/reports/create` | Required | Create new report |
| GET | `/api/reports/my-reports` | Required | Get user's reports |
| GET | `/api/reports/:id` | Optional | Get single report |
| GET | `/api/reports` | None | Get all public reports |
| PUT | `/api/reports/:id/status` | Required | Update report status |
