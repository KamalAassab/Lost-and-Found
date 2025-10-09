@echo off
echo 🔄 Migrating local MySQL data to GitHub Pages...
echo.

echo 📊 Exporting data from MySQL database...
npx tsx scripts/export-data.ts

echo.
echo 📝 Updating static data file...
echo ✅ Data exported and static files updated

echo.
echo 🚀 Committing and pushing to GitHub...
git add .
git commit -m "🔄 MIGRATE: Update static data with current MySQL database content"
git push origin main

echo.
echo ✅ Migration complete! Your GitHub Pages site will update in 2-3 minutes.
echo 🌐 Check: https://kamalaassab.github.io/Lost-and-Found/
echo.
pause
