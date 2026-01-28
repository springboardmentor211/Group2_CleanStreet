$API_URL = "http://localhost:5000/api"
$RANDOM_ID = Get-Date -Format "yyyyMMddHHmmss"
$EMAIL = "volunteer_test_${RANDOM_ID}@example.com"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Volunteer Registration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Email: $EMAIL" -ForegroundColor Yellow
Write-Host "URL: $API_URL/volunteers/register-basic" -ForegroundColor Yellow
Write-Host ""

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

Write-Host "Sending POST request..." -ForegroundColor Gray

$response = Invoke-WebRequest -Uri "$API_URL/volunteers/register-basic" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10

Write-Host ""
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host ""
Write-Host "Response:" -ForegroundColor Green

$content = $response.Content | ConvertFrom-Json
$content | ConvertTo-Json | Write-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Check backend logs for email status" -ForegroundColor Green
Write-Host "========================================"
