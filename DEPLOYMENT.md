# Deployment Guide for StreetStyleCentral

## GitHub Pages Deployment (Frontend Only)

This guide will help you deploy the frontend of your StreetStyleCentral project to GitHub Pages.

### Prerequisites
- GitHub account
- Git installed on your computer
- Node.js installed

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `streetstylecentral` (or any name you prefer)
3. Make it public (required for free GitHub Pages)
4. Don't initialize with README (since you already have files)

### Step 2: Push Your Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: StreetStyleCentral ecommerce app"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "GitHub Actions"
5. The workflow will automatically deploy when you push to main branch

### Step 4: Access Your Deployed Site

After deployment, your site will be available at:
`https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME`

### Important Notes

⚠️ **Backend Limitation**: GitHub Pages only hosts static files. Your backend API will not work on GitHub Pages.

**For Full-Stack Deployment**, consider these alternatives:
- **Vercel** (recommended for full-stack React apps)
- **Netlify** (with serverless functions)
- **Railway** (supports databases)
- **Render** (free tier available)

### Frontend-Only Features That Will Work:
- ✅ Static pages and navigation
- ✅ UI components and styling
- ✅ Client-side routing
- ❌ API calls (will fail without backend)
- ❌ User authentication
- ❌ Shopping cart functionality
- ❌ Product management

### Next Steps for Full-Stack Deployment

To deploy the complete application with backend:

1. **Choose a hosting platform** that supports Node.js and databases
2. **Set up a database** (MySQL or PostgreSQL)
3. **Configure environment variables**
4. **Deploy both frontend and backend**

Would you like help setting up deployment on Vercel or another platform for the full-stack application?
