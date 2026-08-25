# Script para organizar CRM automáticamente
# Ejecutar en PowerShell en la carpeta C:\Users\Alan\CRM

Write-Host "🚀 Iniciando organización del proyecto CRM..." -ForegroundColor Green

# Crear carpetas
Write-Host "📁 Creando carpetas..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "backend" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/public" | Out-Null

Write-Host "✅ Carpetas creadas" -ForegroundColor Green

# Esperar a que el usuario descargue los archivos
Write-Host "`n📥 IMPORTANTE: Descarga TODOS los archivos de outputs primero" -ForegroundColor Cyan
Write-Host "   Luego coloca todos los archivos en C:\Users\Alan\CRM (la raíz)" -ForegroundColor Cyan
Write-Host "`nPresiona ENTER cuando hayas descargado y colocado todos los archivos..." -ForegroundColor Yellow
Read-Host

# Renombrar y mover archivos
Write-Host "`n🔄 Reorganizando archivos..." -ForegroundColor Yellow

# Backend
if (Test-Path "backend-server.js") {
    Move-Item "backend-server.js" "backend/server.js" -Force
    Write-Host "✅ backend-server.js → backend/server.js"
}

if (Test-Path "backend-package.json") {
    Move-Item "backend-package.json" "backend/package.json" -Force
    Write-Host "✅ backend-package.json → backend/package.json"
}

# Frontend
if (Test-Path "frontend-package-json.txt") {
    Move-Item "frontend-package-json.txt" "frontend/package.json" -Force
    Write-Host "✅ frontend-package-json.txt → frontend/package.json"
}

# Frontend src
if (Test-Path "App.js") {
    Copy-Item "App.js" "frontend/src/App.js" -Force
    Write-Host "✅ App.js → frontend/src/App.js"
}

if (Test-Path "App.css") {
    Copy-Item "App.css" "frontend/src/App.css" -Force
    Write-Host "✅ App.css → frontend/src/App.css"
}

if (Test-Path "index.js") {
    Copy-Item "index.js" "frontend/src/index.js" -Force
    Write-Host "✅ index.js → frontend/src/index.js"
}

# Frontend public
if (Test-Path "index.html") {
    Copy-Item "index.html" "frontend/public/index.html" -Force
    Write-Host "✅ index.html → frontend/public/index.html"
}

# Crear .dockerignore en backend
@"
node_modules
npm-debug.log
"@ | Out-File -Encoding UTF8 "backend/.dockerignore"
Write-Host "✅ backend/.dockerignore creado"

# Crear .dockerignore en frontend
@"
node_modules
npm-debug.log
build
"@ | Out-File -Encoding UTF8 "frontend/.dockerignore"
Write-Host "✅ frontend/.dockerignore creado"

Write-Host "`n✅ Estructura lista!" -ForegroundColor Green

# Git
Write-Host "`n🔄 Haciendo git push..." -ForegroundColor Yellow
git add .
git commit -m "CRM rediseñado - Listo para producción"
git push

Write-Host "`n✅ ¡LISTO! Tu proyecto está en GitHub" -ForegroundColor Green
Write-Host "`nAhora:" -ForegroundColor Cyan
Write-Host "1. Ve a Render.com" -ForegroundColor Cyan
Write-Host "2. New Web Service" -ForegroundColor Cyan
Write-Host "3. Conecta izzys-dev/crm-izzy" -ForegroundColor Cyan
Write-Host "4. Environment: Docker" -ForegroundColor Cyan
Write-Host "5. Create Web Service" -ForegroundColor Cyan
Write-Host "6. Espera 15 minutos" -ForegroundColor Cyan
Write-Host "7. ¡Tu CRM estará en la nube! 🎉" -ForegroundColor Green
