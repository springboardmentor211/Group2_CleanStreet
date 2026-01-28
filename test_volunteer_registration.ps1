# Test Volunteer Registration and Email Verification

$API_URL = "http://localhost:5000/api"

# Generate random email
$RANDOM_ID = Get-Date -Format "yyyyMMddHHmmss"
$EMAIL = "volunteer_test_${RANDOM_ID}@example.com"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing Volunteer Registration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Email: $EMAIL" -ForegroundColor Yellow
Write-Host "Sending request to: $API_URL/volunteers/register-basic" -ForegroundColor Yellow
Write-Host ""

# Create request body
$body = @{
    email = $EMAIL
    password = "Test@123456"
    name = "Test Volunteer"
    phone = "9876543210"
    location = @{
        city = "Mumbai"
        state = "Maharashtra"
        zipCode = "400001"
    }
} | ConvertTo-Json

try {
    Write-Host "Sending POST request..." -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri "$API_URL/volunteers/register-basic" `
      -Method POST `
      -ContentType "application/json" `
      -Body $body `
      -TimeoutSec 10
    
    Write-Host ""
    Write-Host "✅ Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Green
    
    $content = $response.Content | ConvertFrom-Json
    $content | ConvertTo-Json | Write-Host
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Registration Success!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Email should be sent to: $EMAIL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check backend console for these logs:" -ForegroundColor Yellow
    Write-Host "  ✅ Email service connected successfully" -ForegroundColor Gray
    Write-Host "  📧 Email sent to: $EMAIL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next step: Enter the OTP from email in verify-email endpoint" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "Error Response:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    try {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        $errorResponse | ConvertTo-Json | Write-Host -ForegroundColor Red
    } catch {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        Write-Host $_ -ForegroundColor Red
    }
}
