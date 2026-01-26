# Clean Street - Civic Complaint Management System

A full-stack web application for reporting and managing civic issues like garbage dumps, potholes, and broken streetlights.

## Features

- **User Authentication**: Manual registration with email/password and Google OAuth
- **Role-Based Access**: Citizens, Volunteers, and Admins
- **Admin Panel**: Separate admin login and dashboard
- **User Dashboard**: Track complaints and profile statistics
- **Volunteer Dashboard**: View assigned issues and track performance
- **Secure Sessions**: Express sessions with MongoDB store

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Passport.js for authentication (Local & Google OAuth)
- Express Session with connect-mongo
- bcryptjs for password hashing
- express-validator for input validation
- Helmet.js for security headers
- Multer for file uploads
- Morgan for request logging

### Frontend
- React 19
- Material-UI (MUI)
- React Router v7
- React Hook Form with Yup validation
- Axios for API calls
- Vite as build tool
- React Hot Toast for notifications

---

## Complete Project Structure

```
CleanStreet-ramkumar-lpu/
├── create-admin.sh                      # Shell script to create admin user
├── PROJECT_COMPLETION_PLAN.md           # Project completion tracking
├── BUGFIXES_PLAN.md                     # Bug fixes documentation
├── README.md                            # Project documentation
├── Architecture.tldr                    # Architecture summary
├── structure.txt                        # Structure documentation
│
├── backend/
│   ├── .gitignore                       # Git ignore rules
│   ├── cookie.txt                       # Cookie configuration
│   ├── package.json                     # Backend dependencies
│   ├── REPORT_API_TESTING.md            # API testing documentation
│   ├── src/
│   │   ├── server.js                    # Express server setup and entry point
│   │   ├── config/
│   │   │   ├── database.js              # MongoDB connection configuration
│   │   │   ├── email.js                 # Email service configuration
│   │   │   └── passport.js              # Passport authentication strategies
│   │   ├── middleware/
│   │   │   └── rateLimiter.js           # Rate limiting middleware
│   │   ├── models/
│   │   │   ├── AdminLog.js              # Admin activity logging model
│   │   │   ├── Comment.js               # Comment on reports model
│   │   │   ├── Report.js                # Issue/complaint report model
│   │   │   ├── User.js                  # User model (all roles)
│   │   │   └── Vote.js                  # Upvote/downvote model
│   │   └── routes/
│   │       ├── admin.js                 # Admin panel routes
│   │       ├── auth.js                  # User authentication routes
│   │       ├── reports.js               # Report management routes
│   │       ├── setup.js                 # System setup routes
│   │       └── volunteer.js             # Volunteer dashboard routes
│   ├── scripts/
│   │   ├── create-admin.js              # Script to create admin user
│   │   ├── create-super-admin.js        # Script to create super admin
│   │   ├── seed-admin.js                # Script to seed admin data
│   │   └── setup-env.js                 # Environment setup script
│   └── uploads/
│       └── reports/                     # Uploaded report images
│
├── frontend/
│   ├── .gitignore                       # Git ignore rules
│   ├── eslint.config.js                 # ESLint configuration
│   ├── index.html                       # HTML entry point
│   ├── package.json                     # Frontend dependencies
│   ├── package-lock.json                # Locked dependency versions
│   ├── README.md                        # Frontend documentation
│   ├── vite.config.js                   # Vite configuration
│   ├── public/
│   │   └── vite.svg                     # Vite logo
│   └── src/
│       ├── App.jsx                      # Main app component with routes
│       ├── main.jsx                     # App entry point
│       ├── index.css                    # Global styles
│       ├── assets/
│       │   ├── react.svg                # React logo
│       │   └── images/
│       │       └── logo.svg             # App logo
│       ├── components/
│       │   ├── ErrorBoundary.jsx        # Error boundary for error handling
│       │   ├── Auth/
│       │       ├── ProtectedRoute.jsx       # Protected route wrapper
│       │       └── ProtectedVolunteerRoute.jsx  # Volunteer route protection
│       │   ├── Layout/
│       │       ├── AdminLayout.jsx          # Admin panel layout
│       │       ├── MainLayout.jsx           # Main app layout
│       │       ├── PublicLayout.jsx         # Public pages layout
│       │       └── VolunteerLayout.jsx      # Volunteer pages layout
│       │   └── setup/
│       │       └── SetupWizard.jsx          # Setup wizard component
│       ├── contexts/
│       │   └── AuthContext.jsx              # Authentication state management
│       └── pages/
│           ├── Home.jsx                     # Home page
│           ├── About.jsx                    # About page
│           ├── Contact.jsx                  # Contact page
│           ├── Profile.jsx                  # User profile page
│           ├── ReportIssue.jsx              # Report new issue page
│           ├── auth/
│           │   ├── Login.jsx                # User login page
│           │   ├── Register.jsx             # User registration page
│           │   ├── ForgotPassword.jsx       # Forgot password page
│           │   ├── VerifyEmail.jsx          # Email verification page
│           │   ├── VolunteerLogin.jsx       # Volunteer login page
│           │   └── VolunteerRegister.jsx    # Volunteer registration page
│           ├── admin/
│           │   ├── Login.jsx                # Admin login page
│           │   ├── Dashboard.jsx            # Admin dashboard
│           │   ├── Home.jsx                 # Admin home page
│           │   ├── Reports.jsx              # Admin reports management
│           │   ├── Settings.jsx             # Admin settings
│           │   └── Users.jsx                # Admin user management
│           ├── user/
│           │   ├── Dashboard.jsx            # User dashboard
│           │   ├── Activity.jsx             # User activity page
│           │   ├── Analytics.jsx            # User analytics page
│           │   ├── History.jsx              # User history page
│           │   ├── Issues.jsx               # User issues page
│           │   ├── Map.jsx                  # User map page
│           │   ├── Reports.jsx              # User reports page
│           │   └── Settings.jsx             # User settings page
│           └── volunteer/
│               ├── Dashboard.jsx            # Volunteer dashboard (with real data)
│               ├── History.jsx              # Volunteer history
│               ├── Issues.jsx               # Volunteer issues page
│               ├── Map.jsx                  # Volunteer map page
│               ├── Performance.jsx          # Volunteer performance page
│               ├── Profile.jsx              # Volunteer profile page
│               ├── TasksActive.jsx          # Active tasks page
│               └── TasksCompleted.jsx       # Completed tasks page
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/clean_street
   SESSION_SECRET=your_session_secret_change_this_in_production
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   FRONTEND_URL=http://localhost:3000
   ADMIN_FRONTEND_URL=http://admin.localhost:3000
   ```

4. Create the first admin user:
   ```bash
   node scripts/setup-admin.js
   ```
   Default credentials:
   - Email: admin@cleanstreet.com
   - Password: admin123
   - ⚠️ Change password immediately after first login!

5. Start the backend server:
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_FRONTEND_URL=http://localhost:3000
   VITE_ADMIN_URL=http://admin.localhost:3000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:3000

---

## API Endpoints

### User Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| POST | `/logout` | Logout |
| GET | `/me` | Get current user info |
| GET | `/google` | Google OAuth login |
| GET | `/google/callback` | Google OAuth callback |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password with OTP |
| PUT | `/profile` | Update user profile |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Admin login |
| GET | `/dashboard/stats` | Dashboard statistics |
| GET | `/users` | Get all users (paginated) |
| POST | `/users` | Create admin/volunteer |
| PUT | `/users/:id/status` | Update user status |
| GET | `/profile` | Get admin profile |

### Reports (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create new report |
| GET | `/my-reports` | Get user's reports |
| GET | `/:id` | Get single report |
| PUT | `/:id/status` | Update report status (admin) |
| POST | `/:id/vote` | Vote on report |
| GET | `/:id/vote` | Get user's vote |
| POST | `/:id/comments` | Add comment |
| GET | `/:id/comments` | Get comments |
| PUT | `/comments/:commentId` | Update comment |
| DELETE | `/comments/:commentId` | Delete comment |
| PUT | `/:id/assign` | Assign report (admin) |
| GET | `/assigned/me` | Get assigned reports |
| GET | `/volunteers` | Get available volunteers |

### Volunteer (`/api/volunteer`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Volunteer registration |
| POST | `/login` | Volunteer login |
| GET | `/dashboard/stats` | Dashboard statistics (real data) |
| GET | `/dashboard/issues` | Get assigned issues (real data) |
| GET | `/dashboard/performance` | Get performance metrics (real data) |
| GET | `/dashboard/debug` | Debug auth status |
| GET | `/status/:email` | Check volunteer status |

---

## User Roles

### 1. Citizen (default)
- Report complaints
- View own complaints
- Vote and comment on reports
- Track complaint status

### 2. Volunteer
- All citizen features
- View assigned issues
- Update issue status
- Performance tracking
- View rating and resolution stats

### 3. Admin
- Full access to admin panel
- Manage all users
- View all complaints
- Assign issues to volunteers
- View analytics and reports
- Cannot login via regular user login

---

## Security Features

- Password hashing with bcryptjs
- Session-based authentication with HTTP-only cookies
- Rate limiting on auth endpoints
- Account lockout after failed attempts
- Admin-only routes protection
- CORS configuration for allowed origins
- Helmet.js security headers
- Input validation with express-validator

---

## Database Models

### User Model
- Email, password, name, role
- Volunteer info (reason, status, rating, skills)
- Admin stats, citizen stats
- Timestamps for created/updated

### Report Model
- User reference, category, title, description
- Priority, location (GeoJSON), address
- Images array, status, assignedTo
- Upvotes, downvotes, views
- Comments array, timestamps

### AdminLog Model
- Admin reference, action type
- Target model and ID
- Details, IP address, user agent

### Comment Model
- User reference, report reference
- Content, isDeleted flag
- Timestamps

### Vote Model
- User reference, report reference
- Vote type (upvote/downvote)
- Timestamps

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env` files

---

## Notes

- Admin accounts can ONLY be created manually via script or by existing admins
- Admins must use the admin login portal (`/admin/login`)
- Regular users login at `/login`
- Volunteers login at `/volunteer/login`
- The model file is named `User.js` (singular) for consistency

---

## Development

- Backend uses ES6 modules (`"type": "module"` in package.json)
- Frontend uses Vite for fast development and building
- Hot reload enabled for both frontend and backend

---

## Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running
2. **Session Issues**: Clear cookies and restart server
3. **CORS Errors**: Check FRONTEND_URL and ADMIN_FRONTEND_URL in backend .env
4. **Port Conflicts**: Change PORT in .env files if 3000 or 5000 are in use
5. **401 Unauthorized**: Clear browser cookies and login again

---

## Project Files Summary

| Category | File Count | Description |
|----------|------------|-------------|
| Root Files | 7 | Configuration and documentation |
| Backend Config | 3 | Database, email, passport |
| Backend Middleware | 1 | Rate limiting |
| Backend Models | 5 | Data models |
| Backend Routes | 5 | API endpoints |
| Backend Scripts | 4 | Setup and admin scripts |
| Frontend Components | 7 | Layout and utility components |
| Frontend Pages | 24 | All page components |
| Frontend Context | 1 | Authentication state |

---

## License

MIT License

