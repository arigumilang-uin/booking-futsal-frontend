# 🚀 Development Quick Start Guide

Panduan cepat untuk memulai development environment booking futsal system.

---

## ⚡ **Quick Setup (5 Minutes)**

### **1. Prerequisites Check**
```bash
node --version    # Should be >= 18.20.4
npm --version     # Should be >= 9.0.0
git --version     # Any recent version
```

### **2. Frontend Setup**
```bash
# Clone and setup frontend
git clone <frontend-repo>
cd booking-futsal-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### **3. Backend Setup (Separate Terminal)**
```bash
# Clone and setup backend
git clone https://github.com/arigumilang-uin/booking-futsal.git
cd booking_futsal

# Install dependencies
npm install

# Setup environment
cp .env.example .env.development
# Edit .env.development with your database config

# Start backend server
npm run dev
```

---

## 🔧 **Environment Configuration**

### **Frontend (.env.development)**
```env
VITE_API_URL=http://localhost:3000/api
VITE_NODE_ENV=development
VITE_DEBUG_MODE=true
```

### **Backend (.env.development)**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/booking_futsal_dev
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
RETURN_JWT_IN_RESPONSE=true
```

---

## 🧪 **Testing Integration**

### **1. Start Both Servers**
```bash
# Terminal 1: Backend
cd booking_futsal
npm run dev
# Should show: 🚀 Server running on port 3000

# Terminal 2: Frontend  
cd booking-futsal-frontend
npm run dev
# Should show: ➜ Local: http://localhost:5173/
```

### **2. Test in Browser**
```bash
# Open browser at http://localhost:5173
# Open browser console (F12)
# Run integration test:
testDevelopmentEnvironment()
```

### **3. Expected Test Results**
```
🧪 Starting Development Environment Test...

1️⃣ Testing Environment Configuration...
✅ Environment OK

2️⃣ Testing Backend Connectivity...
✅ Backend OK

3️⃣ Testing Authentication Flow...
✅ Authentication OK

4️⃣ Testing Booking API...
✅ Booking API OK

🎯 Overall Status: ✅ ALL TESTS PASSED
```

---

## 🔄 **Development Workflow**

### **Daily Development Routine**
```bash
# 1. Start backend
cd booking_futsal && npm run dev

# 2. Start frontend (new terminal)
cd booking-futsal-frontend && npm run dev

# 3. Test integration
# Browser console: testDevelopmentEnvironment()

# 4. Start coding!
```

### **Common Development Commands**
```bash
# Frontend
npm run dev          # Start development server
npm run lint         # Check code quality
npm run lint:fix     # Fix linting issues
npm run build:dev    # Build for development

# Backend
npm run dev          # Start with hot reload
npm run health       # Check backend health
```

---

## 🚨 **Troubleshooting**

### **Backend Not Starting**
```bash
# Check if port 3000 is free
npx kill-port 3000

# Check database connection
psql -d booking_futsal_dev -c "SELECT NOW();"

# Check environment file
cat .env.development
```

### **Frontend Not Connecting**
```bash
# Check API URL in browser console
console.log(import.meta.env.VITE_API_URL)

# Test backend directly
curl http://localhost:3000/api/test/health

# Clear browser cache and localStorage
localStorage.clear()
```

### **Authentication Issues**
```bash
# Check token in localStorage
localStorage.getItem('auth_token')

# Test login directly
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ari@gmail.com","password":"password123"}'
```

---

## 📊 **Development URLs**

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend API** | http://localhost:3000/api | API endpoints |
| **Backend Health** | http://localhost:3000/api/test/health | Health check |
| **Backend Routes** | http://localhost:3000/api/test/routes | Available routes |

---

## 🎯 **Development Features**

### **Frontend Features**
- ✅ Hot Module Replacement (HMR)
- ✅ Auto-browser refresh
- ✅ Development logging
- ✅ Source maps
- ✅ API request/response logging
- ✅ Integration testing tools

### **Backend Features**
- ✅ Hot reload with nodemon
- ✅ Development logging
- ✅ JWT token in response body
- ✅ CORS enabled for localhost
- ✅ Detailed error messages
- ✅ Health check endpoints

---

## 📈 **Next Steps**

### **After Setup Complete**
1. **Test Authentication**: Login at http://localhost:5173/login
2. **Test Booking Creation**: Create a new booking
3. **Test Booking List**: View booking list
4. **Check Console Logs**: Monitor API calls
5. **Start Development**: Begin coding features

### **Development Best Practices**
- Always run integration test after changes
- Monitor browser console for errors
- Check backend logs for API issues
- Use development tools in browser
- Test on different screen sizes

---

## 🏆 **Success Criteria**

✅ **Environment Ready When:**
- Both servers start without errors
- Frontend loads at http://localhost:5173
- Backend health check returns "healthy"
- Integration test passes all checks
- Login/logout works correctly
- Booking creation/retrieval works

---

## 📞 **Need Help?**

### **Common Issues & Solutions**
- **Port conflicts**: Use `npx kill-port 3000` or `npx kill-port 5173`
- **Database issues**: Check PostgreSQL service and connection string
- **CORS errors**: Verify backend CORS configuration
- **Token issues**: Clear localStorage and login again

### **Documentation**
- 📚 Full setup guide: `docs/DEVELOPMENT_SETUP.md`
- 🔧 Technical docs: `docs/DOKUMENTASI_TEKNIS.md`
- 🏗️ Architecture: `docs/FRONTEND_ARCHITECTURE.md`

---

**🏟️ Happy Development! Let's build an amazing futsal booking system!**
