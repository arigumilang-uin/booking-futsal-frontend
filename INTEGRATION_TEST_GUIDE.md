# 🚀 PANDUAN TESTING INTEGRASI FRONTEND-BACKEND YANG DIPERBARUI

## 📋 **OVERVIEW**

Dokumen ini berisi panduan lengkap untuk testing integrasi frontend dengan backend yang telah diperbarui oleh rekan tim, termasuk kredensial pengguna baru dan endpoint API yang ditingkatkan.

---

## 🔐 **KREDENSIAL PENGGUNA BARU**

### **Primary Credentials (Diperbarui oleh Backend Team):**

1. **👑 Supervisor Sistem**
   - Email: `ppwweebb01@gmail.com`
   - Password: `futsaluas`
   - Role: `supervisor_sistem`
   - Access: Full system administration

2. **📊 Manager Futsal**
   - Email: `ppwweebb02@gmail.com`
   - Password: `futsaluas`
   - Role: `manajer_futsal`
   - Access: Business analytics and management

3. **⚽ Operator Lapangan**
   - Email: `ppwweebb03@gmail.com`
   - Password: `futsaluas`
   - Role: `operator_lapangan`
   - Access: Field management and booking confirmation

4. **💰 Staff Kasir**
   - Email: `ppwweebb04@gmail.com`
   - Password: `futsaluas`
   - Role: `staff_kasir`
   - Access: Payment processing and transaction management

5. **👤 Customer/Penyewa**
   - Email: `ppwweebb05@gmail.com`
   - Password: `futsaluas`
   - Role: `penyewa`
   - Access: Personal bookings and field availability

### **Legacy Credentials (Fallback):**
- Customer: `ari@gmail.com` / `password123`
- Kasir: `kasir1@futsalapp.com` / `password123`
- Manager: `manajer1@futsalapp.com` / `password123`
- Supervisor: `pweb@futsalapp.com` / `password123`

---

## 🌐 **CARA TESTING**

### **1. Manual Testing via UI**

1. **Buka Frontend:**
   ```
   http://localhost:5173
   ```

2. **Quick Login Buttons:**
   - Gunakan tombol quick login di halaman login
   - Tersedia untuk semua role: Manager, Kasir, Operator, Supervisor, Customer

3. **Test Flow:**
   - Login → Dashboard → Kelola Booking → Test CRUD operations

### **2. Automated Testing via Browser Console**

Buka browser console (F12) dan jalankan fungsi-fungsi berikut:

#### **🧪 Test Kredensial Baru:**
```javascript
testNewCredentials()
```
- Test login untuk semua 5 akun baru
- Verifikasi token JWT dan user data
- Menampilkan hasil success/failure

#### **📊 Test Dashboard Role-Specific:**
```javascript
testRoleSpecificDashboards()
```
- Test akses dashboard untuk setiap role
- Verifikasi data yang dikembalikan
- Check authorization middleware

#### **🔍 Test Integrasi Komprehensif:**
```javascript
testComprehensiveIntegration()
```
- Test authentication untuk semua user
- Test booking access per role
- Test cross-role data visibility
- Generate summary report

#### **⚡ Test Performance API:**
```javascript
testAPIPerformance()
```
- Measure login response time
- Measure booking fetch performance
- Categorize as fast/moderate/slow

#### **📋 Show Test Info:**
```javascript
logTestInfo()
```
- Tampilkan semua kredensial yang tersedia
- Show API URL dan environment info

---

## 🎯 **EXPECTED RESULTS**

### **✅ Authentication Success:**
- Semua 5 akun baru dapat login
- Token JWT diterima dengan benar
- User data dan role sesuai

### **✅ Role-Based Access:**
- **Supervisor:** Akses ke semua endpoint + system analytics
- **Manager:** Akses ke business analytics + booking management
- **Operator:** Akses ke field operations + booking confirmation
- **Kasir:** Akses ke payment processing + transaction data
- **Customer:** Akses ke personal bookings + field availability

### **✅ Dashboard Functionality:**
- Dashboard menampilkan data sesuai role
- Statistics dan analytics berfungsi
- Real-time data updates

### **✅ Booking Management:**
- CRUD operations sesuai permission
- Status updates berdasarkan role
- Data filtering yang tepat

---

## 🔧 **TROUBLESHOOTING**

### **❌ Login Gagal:**
1. Check network connection
2. Verify backend API status: https://booking-futsal-production.up.railway.app/api/test/health
3. Try legacy credentials sebagai fallback
4. Check browser console untuk error details

### **❌ Dashboard Kosong:**
1. Check role-specific endpoint availability
2. Verify token authorization
3. Check browser network tab untuk API calls
4. Try refresh atau re-login

### **❌ Booking Data Tidak Muncul:**
1. Verify user role dan permissions
2. Check endpoint response di network tab
3. Try different role untuk comparison
4. Check backend logs jika ada akses

---

## 📈 **PERFORMANCE BENCHMARKS**

### **Target Performance:**
- **Login:** < 1000ms (fast), < 3000ms (acceptable)
- **Dashboard Load:** < 2000ms (fast), < 5000ms (acceptable)
- **Booking Fetch:** < 500ms (fast), < 2000ms (acceptable)

### **Success Rate Targets:**
- **Authentication:** 100% success rate
- **Dashboard Access:** 100% success rate
- **Booking Operations:** 95%+ success rate

---

## 🎉 **INTEGRATION SUCCESS CRITERIA**

✅ **Authentication:** All 5 new accounts working  
✅ **Authorization:** Role-based access functioning  
✅ **Dashboard:** Role-specific data display  
✅ **Booking Management:** CRUD operations per role  
✅ **Performance:** Meeting benchmark targets  
✅ **Error Handling:** Graceful fallbacks working  

---

## 📞 **SUPPORT**

Jika mengalami issues:
1. Run `testComprehensiveIntegration()` untuk diagnostic
2. Check browser console untuk error details
3. Verify backend status dan connectivity
4. Document error untuk debugging

**Happy Testing! 🚀**
