# 🚀 Booking Futsal Frontend - Mode Guide

## 📋 Available Scripts

### Information
```bash
npm start            # Show all modes and URLs information
```

### Development
```bash
npm run dev          # Development mode (localhost:5173)
```

### Production
```bash
npm run prod         # Production mode (localhost:3000)
npm run build:prod   # Build for production deployment
npm run deploy       # Prepare for GitHub push and Vercel auto-deployment
npm run test:api     # Test production API endpoints
```

### Utilities
```bash
npm run lint         # Check code quality
npm run preview      # Preview built files
npm run clean        # Clean build cache
```

## 🌐 Production URLs

- **Frontend:** https://booking-futsal-frontend.vercel.app
- **Backend:** https://booking-futsal-production.up.railway.app
- **API:** https://booking-futsal-production.up.railway.app/api

## 🔧 Mode Differences

| Mode | Command | Port | Backend | Purpose |
|------|---------|------|---------|---------|
| **Information** | `npm start` | - | - | Show all modes and URLs |
| **Development** | `npm run dev` | 5173 | Development | Local development |
| **Production** | `npm run prod` | 3000 | Production | Production mode |

## 🚀 Quick Start

### 1. Show Information
```bash
npm start
# Shows: All modes, URLs, and commands
```

### 2. Development Mode
```bash
npm run dev
# Access: http://localhost:5173
```

### 3. Production Mode
```bash
npm run prod
# Access: http://localhost:3000
```

## 🚀 Deployment Workflow

### GitHub + Vercel Auto-Deployment
```bash
# 1. Prepare for deployment
npm run deploy

# 2. Commit and push to GitHub
git add .
git commit -m "Fix production API configuration"
git push origin main

# 3. Vercel auto-deploys from GitHub
# Wait 2-3 minutes for deployment

# 4. Test production
npm run test:api
```

## 🔒 CORS Configuration

Production mode automatically configures CORS for:
- Frontend: https://booking-futsal-frontend.vercel.app
- Backend: https://booking-futsal-production.up.railway.app
- Local: http://localhost:3000

## 📝 Notes

- **Production mode** displays Vercel URL in console
- **CORS** is automatically configured for production URLs
- **Environment** uses `.env.production` file
- **Port 3000** is used for production mode (different from dev)
