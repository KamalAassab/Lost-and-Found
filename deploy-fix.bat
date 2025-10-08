@echo off
echo 🔧 Fixing GitHub Pages Deployment...
echo.
echo Adding workflow file to git...
git add .github/workflows/deploy.yml
echo.
echo Committing deployment fix...
git commit -m "🔧 Fix GitHub Pages deployment with official GitHub Pages actions and proper permissions"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo ✅ Deployment fix pushed successfully!
echo 🌐 Check your repository Actions tab for the new deployment.
echo.
pause
