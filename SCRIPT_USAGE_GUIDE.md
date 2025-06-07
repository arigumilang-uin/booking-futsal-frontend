# 📋 SCRIPT USAGE GUIDE - FRONTEND DEVELOPMENT

## 🎯 **PERBEDAAN SCRIPT DEVELOPMENT**

### **📊 Environment Configuration Matrix:**

| Script | Frontend | Backend | Environment File | Use Case |
|--------|----------|---------|------------------|----------|
| `npm run dev:local` | localhost:5173 | localhost:3000 | `.env.development.local` | Full local development |
| `npm run dev` | localhost:5173 | Railway (prod) | `.env.development` | Frontend dev + Stable backend |

## 🔧 **SCRIPT DETAILS**

### **1. `npm run dev:local` - Full Local Development**
```bash
npm run dev:local
```
**Configuration:**
- **Frontend:** http://localhost:5173 (development)
- **Backend:** http://localhost:3000/api (local)
- **Environment:** `.env.development.local` (highest priority)
- **API URL:** `http://localhost:3000/api`

**Use Case:**
- Developing both frontend and backend
- Testing local backend changes
- Full control over both services
- Requires local backend server running

**Prerequisites:**
```bash
# Start local backend first
cd ../booking_futsal
npm run dev
```

### **2. `npm run dev` - Frontend Development with Production Backend**
```bash
npm run dev
```
**Configuration:**
- **Frontend:** http://localhost:5173 (development)
- **Backend:** https://booking-futsal-production.up.railway.app/api (production)
- **Environment:** `.env.development`
- **API URL:** `https://booking-futsal-production.up.railway.app/api`

**Use Case:**
- Frontend-only development
- Using stable production backend
- No need to run local backend
- Faster development iteration

**Advantages:**
- No local backend setup required
- Always latest backend features
- Stable database connection
- Real production data

## 🚀 **PRODUCTION SCRIPTS**

### **3. `npm run build` - Production Build**
```bash
npm run build
```
**Configuration:**
- **Environment:** `.env.production`
- **API URL:** `https://booking-futsal-production.up.railway.app/api`
- **Output:** `dist/` folder for deployment

### **4. `npm run preview` - Preview Production Build**
```bash
npm run preview
```
**Configuration:**
- **Frontend:** http://localhost:4173 (preview)
- **Backend:** Production (Railway)
- **Purpose:** Test production build locally

## 🧪 **TESTING & UTILITY SCRIPTS**

### **Health Checks:**
```bash
npm run health           # Check frontend server
npm run health:backend   # Check backend API
npm run test:backend     # Quick backend system info
```

### **Maintenance:**
```bash
npm run clean           # Clean build artifacts
npm run lint            # Code quality check
npm run lint:fix        # Auto-fix lint issues
```

## 📁 **ENVIRONMENT FILES PRIORITY**

Vite loads environment files in this order (highest to lowest priority):

1. `.env.development.local` ← **Used by `dev:local`**
2. `.env.local`
3. `.env.development` ← **Used by `dev`**
4. `.env`

## 🎯 **RECOMMENDED WORKFLOW**

### **For Frontend-Only Development:**
```bash
npm run dev              # Use production backend
```

### **For Full-Stack Development:**
```bash
# Terminal 1: Start backend
cd ../booking_futsal
npm run dev

# Terminal 2: Start frontend with local backend
cd ../booking-futsal-frontend
npm run dev:local
```

### **For Production Testing:**
```bash
npm run build           # Build for production
npm run preview         # Test production build
```

## 🔍 **DEBUGGING**

### **Check Current Configuration:**
```bash
# Check which API URL is being used
npm run dev              # Check browser console for API URL
npm run dev:local        # Check browser console for API URL
```

### **Environment Variables Debug:**
```javascript
// In browser console
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Environment:', import.meta.env.VITE_NODE_ENV);
console.log('App Name:', import.meta.env.VITE_APP_NAME);
```

## ⚠️ **IMPORTANT NOTES**

1. **Local Backend Requirements:**
   - PostgreSQL database running
   - All environment variables configured
   - Port 3000 available

2. **Production Backend:**
   - Always available (Railway hosting)
   - Latest features and data
   - No local setup required

3. **CORS Configuration:**
   - Both scripts handle CORS correctly
   - Local backend allows localhost:5173
   - Production backend allows Vercel domain

## 🎉 **QUICK START**

**Most developers should use:**
```bash
npm run dev              # Frontend dev + Production backend
```

**Only use local backend when:**
- Testing backend changes
- Working offline
- Need specific local data
