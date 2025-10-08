
Write-Host "🔧 Fixing GitHub Pages Deployment..." -ForegroundColor Green

# Add the fixed workflow file
Write-Host "Adding workflow file to git..." -ForegroundColor Yellow
git add .github/workflows/deploy.yml

# Commit the changes
Write-Host "Committing deployment fix..." -ForegroundColor Yellow
git commit -m "🔧 Fix GitHub Pages deployment with official GitHub Pages actions and proper permissions"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Deployment fix pushed successfully!" -ForegroundColor Green
Write-Host "🌐 Check your repository Actions tab for the new deployment." -ForegroundColor Cyan
