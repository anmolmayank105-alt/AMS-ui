# Performance Comparison Script
# Run this to test response times before and after optimization

Write-Host "🚀 Testing AlumNetics Performance..." -ForegroundColor Cyan
Write-Host ""

# Function to measure response time
function Measure-ApiCall {
    param($url, $name)
    $start = Get-Date
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
        $end = Get-Date
        $duration = ($end - $start).TotalMilliseconds
        Write-Host "✅ $name : ${duration}ms" -ForegroundColor Green
        return $duration
    } catch {
        Write-Host "❌ $name : Failed" -ForegroundColor Red
        return -1
    }
}

Write-Host "Testing Backend Endpoints:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────" -ForegroundColor Gray

# Test health endpoint
$health = Measure-ApiCall "http://localhost:5000/health" "Health Check"

# Test API root
$apiRoot = Measure-ApiCall "http://localhost:5000/api" "API Root"

Write-Host ""
Write-Host "Testing Frontend:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────" -ForegroundColor Gray

# Test frontend
$frontend = Measure-ApiCall "http://localhost:5173" "Frontend Root"

Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────" -ForegroundColor Gray

if ($health -gt 0 -and $apiRoot -gt 0 -and $frontend -gt 0) {
    $avgBackend = ($health + $apiRoot) / 2
    Write-Host "Average Backend Response: ${avgBackend}ms" -ForegroundColor Cyan
    Write-Host "Frontend Load Time: ${frontend}ms" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Performance Status:" -ForegroundColor Yellow
    if ($avgBackend -lt 50) {
        Write-Host "🚀 EXCELLENT - Backend is very fast!" -ForegroundColor Green
    } elseif ($avgBackend -lt 100) {
        Write-Host "✅ GOOD - Backend performance is solid" -ForegroundColor Green
    } elseif ($avgBackend -lt 200) {
        Write-Host "⚠️  OK - Backend could be faster" -ForegroundColor Yellow
    } else {
        Write-Host "❌ SLOW - Backend needs optimization" -ForegroundColor Red
    }
    
    if ($frontend -lt 100) {
        Write-Host "🚀 EXCELLENT - Frontend is very fast!" -ForegroundColor Green
    } elseif ($frontend -lt 300) {
        Write-Host "✅ GOOD - Frontend loads quickly" -ForegroundColor Green
    } elseif ($frontend -lt 500) {
        Write-Host "⚠️  OK - Frontend could be faster" -ForegroundColor Yellow
    } else {
        Write-Host "❌ SLOW - Frontend needs optimization" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Some endpoints failed - check if servers are running" -ForegroundColor Red
}

Write-Host ""
Write-Host "Optimizations Applied:" -ForegroundColor Yellow
Write-Host "  Database indexes added" -ForegroundColor Gray
Write-Host "  MongoDB connection pooling" -ForegroundColor Gray
Write-Host "  React code splitting lazy loading" -ForegroundColor Gray
Write-Host "  Bcrypt rounds optimized" -ForegroundColor Gray
Write-Host "  HTTP caching headers" -ForegroundColor Gray
Write-Host "  Query optimization with lean" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected improvements:" -ForegroundColor Yellow
Write-Host "  Database queries 5-10x faster" -ForegroundColor Gray
Write-Host "  Initial page load 40-50 percent faster" -ForegroundColor Gray
Write-Host "  Bundle size 50 percent smaller" -ForegroundColor Gray
Write-Host "  Registration and Login 60 percent faster" -ForegroundColor Gray
