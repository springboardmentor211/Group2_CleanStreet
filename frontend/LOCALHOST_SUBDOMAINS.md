# Setting Up Localhost Subdomains (Windows)

## Problem
By default, browsers treat `admin.localhost:3000`, `volunteer.localhost:3000` as different from `localhost:3000`. To access them locally, you need to configure your system.

## Solution 1: Edit Hosts File (Recommended for Development)

### Windows Steps:

1. **Open Hosts File:**
   - Press `Win + R`
   - Type: `notepad C:\Windows\System32\drivers\etc\hosts`
   - Click OK
   - Click "Yes" when UAC prompt appears

2. **Add Subdomains:**
   Add these lines at the end of the file:
   ```
   127.0.0.1 localhost
   127.0.0.1 admin.localhost
   127.0.0.1 volunteer.localhost
   ```

3. **Save the File:**
   - Press `Ctrl + S`
   - Close Notepad

4. **Flush DNS Cache:**
   - Press `Win + R`
   - Type: `cmd`
   - In Command Prompt, run:
     ```bash
     ipconfig /flushdns
     ```

5. **Test in Browser:**
   ```
   http://localhost:3000           → User Portal
   http://admin.localhost:3000     → Admin Portal
   http://volunteer.localhost:3000 → Volunteer Portal
   ```

## Solution 2: Using PowerShell (Alternative)

1. **Open PowerShell as Administrator**
2. **Add to hosts file:**
   ```powershell
   $hostsPath = "C:\Windows\System32\drivers\etc\hosts"
   $newLines = @(
       "127.0.0.1 admin.localhost",
       "127.0.0.1 volunteer.localhost"
   )
   Add-Content -Path $hostsPath -Value $newLines -Force
   ```
3. **Flush DNS:**
   ```powershell
   ipconfig /flushdns
   ```

## After Setup - Backend Configuration

### 1. Update Backend CORS Configuration

In `backend/src/server.js`, update CORS to accept all localhost variants:

```javascript
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://admin.localhost:3000',
      'http://volunteer.localhost:3000',
      'http://localhost:5000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 2. Update Session Cookie Domain

In `backend/src/server.js`, update session configuration:

```javascript
app.use(session({
  // ... other config
  cookie: { 
    domain: 'localhost',  // Allows all localhost variants
    httpOnly: true,
    secure: false,        // Set to true in production with HTTPS
    sameSite: 'lax'
  }
}));
```

## Troubleshooting

### Still getting "admin.localhost not found"
1. Verify hosts file changes saved (no admin rights issues)
2. Flush DNS again: `ipconfig /flushdns`
3. Try in an incognito/private window
4. Restart your browser

### Backend CORS still blocking
1. Check backend console for CORS errors
2. Verify CORS config includes all subdomain origins
3. Restart backend server after config changes

### Port already in use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

## Verify Setup

After all changes, test each portal:

1. **User Portal:**
   ```
   http://localhost:3000
   → Should see user login page
   ```

2. **Admin Portal:**
   ```
   http://admin.localhost:3000
   → Should see admin login page
   ```

3. **Volunteer Portal:**
   ```
   http://volunteer.localhost:3000
   → Should see volunteer login page
   ```

## Starting Servers

For complete setup, start both servers:

**Terminal 1 - Frontend:**
```bash
cd e:\Infosys\frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd e:\Infosys\backend
npm start
```

Then access:
- User: `http://localhost:3000`
- Admin: `http://admin.localhost:3000`
- Volunteer: `http://volunteer.localhost:3000`

## How Subdomain Detection Works

The `src/utils/subdomain.js` now:
1. Extracts subdomain from hostname
2. For `admin.localhost:3000` → detects `admin`
3. For `volunteer.localhost:3000` → detects `volunteer`
4. For `localhost:3000` → defaults to main user portal

The App.jsx then conditionally renders the appropriate routes based on detected subdomain.

## Cleanup (If Needed)

To remove subdomains from hosts file:
1. Open `C:\Windows\System32\drivers\etc\hosts` as admin
2. Delete these lines:
   ```
   127.0.0.1 admin.localhost
   127.0.0.1 volunteer.localhost
   ```
3. Save and flush DNS again
