# Clean Street - Subdomain Configuration

## Architecture

The application uses subdomain-based routing to separate different user roles:

### Subdomains

1. **Main Domain (User Portal)**
   - URL: `cleanstreet.com` or `www.cleanstreet.com`
   - Routes: `/login`, `/register`, `/dashboard`, `/reports`, etc.
   - Users: Regular citizens reporting and viewing issues

2. **Volunteer Subdomain**
   - URL: `volunteer.cleanstreet.com`
   - Routes: `/login`, `/register/basic`, `/register/verified`, `/dashboard`, `/events`, `/reports`, etc.
   - Users: Volunteers with different tiers (basic, verified, team_lead)

3. **Admin Subdomain**
   - URL: `admin.cleanstreet.com`
   - Routes: `/login`, `/dashboard`, `/users`, `/reports`, `/settings`, etc.
   - Users: Administrators and super-admins

## Development Setup

For local development (localhost), subdomain detection uses path-based routing:

```
http://localhost:3000/               → User Portal (main)
http://localhost:3000/volunteer/*    → Volunteer Portal (volunteer subdomain)
http://localhost:3000/admin/*        → Admin Portal (admin subdomain)
```

## Production Setup (Nginx Example)

```nginx
# User Portal
server {
    server_name cleanstreet.com www.cleanstreet.com;
    listen 80;
    
    location / {
        proxy_pass http://localhost:3000;
    }
}

# Volunteer Portal
server {
    server_name volunteer.cleanstreet.com;
    listen 80;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}

# Admin Portal
server {
    server_name admin.cleanstreet.com;
    listen 80;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

## How It Works

1. **Subdomain Detection** (`src/utils/subdomain.js`)
   - Function `getSubdomain()` detects current subdomain from hostname
   - For localhost, checks URL path for subdomain indicators

2. **Conditional Routing** (`src/App.jsx`)
   - App detects subdomain on mount
   - Routes are conditionally rendered based on subdomain
   - Volunteer and Admin routes are completely isolated from user routes

3. **Navigation** (`redirectToSubdomain()`)
   - Helper function to navigate between subdomains
   - Used in CTAs and links that cross subdomain boundaries
   - Example: User clicking "Become Volunteer" redirects to `volunteer.cleanstreet.com`

## Backend Considerations

The backend API runs on a single domain and uses session-based authentication with cookies:

- Cookie domain: `.cleanstreet.com` (shared across subdomains)
- CORS: Configured to accept requests from all subdomains
- Session: User authentication is maintained across subdomain navigation

## Files Modified

- `src/App.jsx` - Subdomain detection and conditional routing
- `src/utils/subdomain.js` - Subdomain detection utilities
- `src/pages/volunteer/Landing.jsx` - Updated to use subdomain navigation
- `src/pages/user/Dashboard.jsx` - Added volunteer CTA with subdomain redirect
- `src/components/Layout/MainLayout.jsx` - Navigation adjusted for single domain

## Testing

To test subdomain functionality locally:

1. Start the development server: `npm run dev`
2. Access different sections:
   - User: http://localhost:3000/
   - Volunteer: http://localhost:3000/volunteer/login
   - Admin: http://localhost:3000/admin/login

In production, test with actual subdomains:
- User: https://cleanstreet.com
- Volunteer: https://volunteer.cleanstreet.com
- Admin: https://admin.cleanstreet.com
