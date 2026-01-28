# Subdomain Setup Verification Checklist

## Overview
This checklist ensures localhost subdomains are properly configured for development.

## Part 1: Windows Hosts File Setup

### Status Check
- [ ] Edit Windows hosts file at `C:\Windows\System32\drivers\etc\hosts`
- [ ] Add these lines to the end of the file:
  ```
  127.0.0.1 localhost
  127.0.0.1 admin.localhost
  127.0.0.1 volunteer.localhost
  ```
- [ ] Save the file (Ctrl+S)
- [ ] Open Command Prompt as Administrator
- [ ] Run: `ipconfig /flushdns`
- [ ] Restart your browser

### Quick Test (PowerShell)
```powershell
# Test DNS resolution
nslookup admin.localhost
nslookup volunteer.localhost
nslookup localhost

# You should see:
# Server: <your-dns-server>
# Address: 127.0.0.1
```

## Part 2: Backend Configuration

### CORS Settings
The backend is already configured with:
```
CORS origins: 
  - http://localhost:3000
  - http://localhost:3001
  - http://admin.localhost:3000
  - http://volunteer.localhost:3000
  - http://*.localhost:3000 (regex pattern)
```

**No additional changes needed** - Already in `backend/src/server.js`

### Session Cookies
The backend is already configured with:
```
- cookie.domain: undefined (in development)
- cookie.sameSite: 'lax' (in development)
- cookie.secure: false (in development)
```

**No additional changes needed** - Already in `backend/src/server.js`

## Part 3: Frontend Configuration

### Subdomain Detection
✅ Already implemented in `frontend/src/utils/subdomain.js`:
- Detects: `localhost`, `admin.localhost`, `volunteer.localhost`
- Returns appropriate subdomain: 'main', 'admin', 'volunteer'

### Vite Dev Server
✅ Already configured in `frontend/vite.config.js`:
- `host: '0.0.0.0'` (listens on all interfaces)
- `strictPort: false` (flexible port handling)

### App Routing
✅ Already implemented in `frontend/src/App.jsx`:
- Subdomain detection on mount
- Conditional route rendering based on subdomain
- Volunteer routes only shown on `volunteer` subdomain
- Admin routes only shown on `admin` subdomain
- User routes only shown on main domain

## Part 4: Starting Development

### Terminal 1: Backend
```bash
cd backend
npm start
# Should output: Server running on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Should output: ➜ Local: http://0.0.0.0:3000 or similar
```

### Access Portals
```
User Portal:      http://localhost:3000
Admin Portal:     http://admin.localhost:3000
Volunteer Portal: http://volunteer.localhost:3000
```

## Part 5: Testing

### User Portal (Main Domain)
- [ ] Access: `http://localhost:3000`
- [ ] Login as user
- [ ] Check: "Become a Volunteer" button visible
- [ ] Click button → Should redirect to `volunteer.localhost:3000/register/basic`

### Volunteer Portal (Volunteer Subdomain)
- [ ] Access: `http://volunteer.localhost:3000`
- [ ] Subdomain detection should show 'volunteer'
- [ ] Login page visible
- [ ] Register/Basic form available
- [ ] After login → Dashboard loads

### Admin Portal (Admin Subdomain)
- [ ] Access: `http://admin.localhost:3000`
- [ ] Subdomain detection should show 'admin'
- [ ] Login page visible
- [ ] After login → Admin dashboard loads

### Cross-Subdomain Navigation
- [ ] From volunteer dashboard → Should navigate to correct subdomains
- [ ] From admin dashboard → Should navigate to correct subdomains
- [ ] Session should work across subdomains (same cookie domain)

## Part 6: Troubleshooting

### Issue: Subdomains don't resolve
**Solution:**
```bash
# Flush DNS cache again
ipconfig /flushdns

# Or in PowerShell:
Clear-DnsClientCache

# Restart browser completely (close all tabs)
```

### Issue: "Connection refused" error
**Solution:**
1. Verify backend is running on port 5000: `http://localhost:5000`
2. Verify frontend is running on port 3000: `http://localhost:3000`
3. Check that Vite config has `host: '0.0.0.0'`

### Issue: Session not persisting across subdomains
**Solution:**
```bash
# Verify CORS credentials are enabled
# Check browser DevTools > Application > Cookies
# Should see "clean_street.sid" with domain ".localhost"

# If not, restart both backend and frontend
```

### Issue: "Cannot find module" or 404 errors
**Solution:**
1. Check that all imports use correct paths
2. Verify no circular dependencies
3. Restart dev servers (Vite and Express)

### Issue: Browser shows "Localhost refused to connect"
**Solution:**
1. Verify hosts file has correct entries
2. Run `ipconfig /flushdns`
3. Restart browser
4. Try in incognito/private mode to avoid caching

## Part 7: Browser Console Checks

Open DevTools (F12) and check console for:

### ✅ Expected Logs
```javascript
// When accessing volunteer.localhost:3000
Subdomain detected: 'volunteer'
```

```javascript
// When accessing admin.localhost:3000
Subdomain detected: 'admin'
```

```javascript
// When accessing localhost:3000
Subdomain detected: 'main'
```

### ❌ Error Messages to Watch For
- `CORS error` → Check CORS configuration in backend
- `Cannot POST /api/...` → Check API routes in backend
- `TypeError: getSubdomain is not a function` → Check subdomain.js exports
- `Cannot find module` → Check file paths and imports

## Part 8: Final Verification

Run this in browser console while on each subdomain:

```javascript
// Check subdomain detection
import { getSubdomain, getSubdomainUrl } from './utils/subdomain.js'
console.log('Current subdomain:', getSubdomain())
console.log('Subdomain URL for admin:', getSubdomainUrl('admin'))
console.log('Subdomain URL for volunteer:', getSubdomainUrl('volunteer'))

// Check session cookie
console.log('Cookies:', document.cookie)
```

All three subdomains should work independently with proper routing and session management.

---

## Next Steps

1. **Setup hosts file** (if not done)
2. **Start backend**: `npm start` in backend folder
3. **Start frontend**: `npm run dev` in frontend folder
4. **Test each portal** using the checklist above
5. **Report any issues** with specific error messages and browser console logs

For detailed production setup, see: [SUBDOMAIN_SETUP.md](./frontend/SUBDOMAIN_SETUP.md)
