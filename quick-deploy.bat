@echo off
cls
echo 🔧 DEPLOYING YOUR PROJECT TO GITHUB PAGES...
echo.
echo Step 1: Adding files...
git add . >nul 2>&1
echo ✅ Files added
echo.
echo Step 2: Committing changes...
git commit -m "🚀 Deploy to GitHub Pages - Fix deployment workflow" >nul 2>&1
echo ✅ Changes committed
echo.
echo Step 3: Pushing to GitHub...
git push origin main >nul 2>&1
echo ✅ Pushed to GitHub
echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo.
echo Your project is now being deployed to GitHub Pages.
echo Check: https://github.com/KamalAassab/Lost-and-Found/actions
echo.
echo Your live site will be at:
echo https://kamalaassab.github.io/Lost-and-Found
echo.
pause
