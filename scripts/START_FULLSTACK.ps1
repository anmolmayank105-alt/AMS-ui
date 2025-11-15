# Start Both Frontend & Backend Servers

Write-Host "🚀 Starting ALUMNETICS Full Stack Application..." -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is required
Write-Host "📦 MongoDB Connection Required" -ForegroundColor Yellow
Write-Host "Make sure MongoDB is running or update MONGODB_URI in backend/.env" -ForegroundColor Yellow
Write-Host ""

# Start Backend in new window
Write-Host "🔧 Starting Backend Server (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'e:\demo\demo\alumnetics-backend'; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Green; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend in new window  
Write-Host "⚛️  Starting Frontend Server (Port 5173)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'e:\demo\demo\alumnetics-react'; Write-Host '⚛️ Frontend Server Starting...' -ForegroundColor Blue; npm run dev"

# Wait for frontend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API:  http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop the servers" -ForegroundColor Yellow
