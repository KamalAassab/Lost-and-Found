# PowerShell script to deploy StreetStyleCentral to GitHub Pages
# Run this script from the project root directory

Write-Host "🚀 StreetStyleCentral GitHub Pages Deployment Script" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add all files
Write-Host "📝 Adding files to Git..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Deploy StreetStyleCentral to GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# Get repository URL from user
$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repository.git)"

# Add remote origin
Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
git remote add origin $repoUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔄 Updating remote origin..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
}

# Push to GitHub
Write-Host "⬆️ Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 Your site will be available at: https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME" -ForegroundColor Cyan
    Write-Host "⏳ It may take a few minutes for GitHub Pages to deploy." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Magenta
    Write-Host "1. Go to your repository on GitHub" -ForegroundColor White
    Write-Host "2. Click Settings > Pages" -ForegroundColor White
    Write-Host "3. Select 'GitHub Actions' as source" -ForegroundColor White
    Write-Host "4. Wait for the deployment workflow to complete" -ForegroundColor White
} else {
    Write-Host "❌ Failed to push to GitHub. Please check your repository URL and try again." -ForegroundColor Red
}

Write-Host ""
Write-Host "📖 For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
