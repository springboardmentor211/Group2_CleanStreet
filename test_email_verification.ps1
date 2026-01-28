# Complete Volunteer Registration & Email Verification Test

$API_URL = "http://localhost:5000/api"
$RANDOM_ID = Get-Date -Format "yyyyMMddHHmmss"
$EMAIL = "volunteer_test_${RANDOM_ID}@example.com"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "VOLUNTEER REGISTRATION & EMAIL VERIFICATION TEST" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Register as Basic Volunteer
Write-Host "[STEP 1] Registering as Basic Volunteer..." -ForegroundColor Yellow
Write-Host "Email: $EMAIL" -ForegroundColor Gray
Write-Host ""

$registerBody = @{
    email = $EMAIL
    password = "Test@123456"
    name = "Test Volunteer User"
    phone = "9876543210"
    location = @{
        city = "Mumbai"
        state = "Maharashtra"
        zipCode = "400001"
    }
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$API_URL/volunteers/register-basic" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -TimeoutSec 10 `
        -UseBasicParsing

    $registerData = $registerResponse.Content | ConvertFrom-Json
    
    Write-Host "Status Code: $($registerResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Success: $($registerData.success)" -ForegroundColor Green
    Write-Host "Message: $($registerData.message)" -ForegroundColor Green
    Write-Host ""
    
    if ($registerData.success) {
        Write-Host "✅ Registration successful!" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "EMAIL VERIFICATION DETAILS" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "An OTP email should have been sent to: $EMAIL" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Email Subject: Welcome to Clean Street Volunteers - Verify Email" -ForegroundColor Gray
        Write-Host "Email Content: 6-digit OTP code (valid for 10 minutes)" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "CHECK BACKEND CONSOLE FOR THESE LOGS:" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Email Service Status:" -ForegroundColor Yellow
        Write-Host "   Look for: Email service connected successfully" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. OTP Generation:" -ForegroundColor Yellow
        Write-Host "   Look for: Generated OTP for $EMAIL" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Email Sending:" -ForegroundColor Yellow
        Write-Host "   Look for: Email sent to: $EMAIL" -ForegroundColor Gray
        Write-Host "   OR" -ForegroundColor Gray
        Write-Host "   Look for: Email skipped (service disabled) or error message" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "NEXT STEPS" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Check your email inbox for OTP" -ForegroundColor Yellow
        Write-Host "2. (Optional) Use verify-email endpoint to confirm OTP works:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   curl -X POST http://localhost:5000/api/auth/verify-email " -ForegroundColor Gray
        Write-Host '     -H "Content-Type: application/json" ' -ForegroundColor Gray
        Write-Host "     -d '{" -ForegroundColor Gray
        Write-Host '       "email": "'$EMAIL'",' -ForegroundColor Gray
        Write-Host '       "otp": "123456"  # Replace with actual OTP from email' -ForegroundColor Gray
        Write-Host "     }'" -ForegroundColor Gray
        Write-Host ""
        
    } else {
        Write-Host "Error: $($registerData.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Registration failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
