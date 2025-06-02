# 🏟️ Booking Futsal Frontend

Frontend application untuk sistem booking futsal menggunakan Vite + React + Tailwind CSS yang terintegrasi dengan backend Railway.

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- npm atau yarn

### Installation
```bash
npm install
npm run dev
```

## 🏗️ **Struktur Project**

```
src/
├── api/                    # API integration layer
│   ├── axiosInstance.js   # Axios configuration dengan interceptors
│   ├── authAPI.js         # Authentication API calls
│   ├── bookingAPI.js      # Booking API calls
│   ├── fieldAPI.js        # Field API calls
│   ├── paymentAPI.js      # Payment API calls
│   └── userAPI.js         # User API calls
├── components/            # Reusable components
│   ├── CustomerNavbar.jsx # Navigation untuk customer
│   ├── StaffNavbar.jsx    # Navigation untuk staff
│   └── ProtectedRoute.jsx # Route protection dengan role-based access
├── contexts/              # React Context untuk state management
│   ├── AuthContext.jsx    # Authentication context
│   └── AuthProvider.jsx   # Authentication provider dengan login/logout
├── hooks/                 # Custom React hooks
│   └── useAuth.js         # Authentication hook
├── layouts/               # Layout components
│   ├── CustomerLayout.jsx # Layout untuk customer (penyewa)
│   └── StaffLayout.jsx    # Layout untuk staff (kasir, operator, manager, supervisor)
├── pages/                 # Page components
│   ├── auth/              # Authentication pages
│   │   ├── Login.jsx      # Login page
│   │   └── Register.jsx   # Registration page
│   ├── customer/          # Customer pages (role: penyewa)
│   │   ├── Dashboard.jsx  # Customer dashboard
│   │   ├── Booking/       # Booking management
│   │   ├── Field/         # Field browsing
│   │   ├── Payment/       # Payment management
│   │   └── Profile/       # Profile management
│   └── staff/             # Staff pages (roles: kasir, operator, manager, supervisor)
│       ├── Dashboard.jsx  # Role-based staff dashboard
│       ├── Booking/       # Booking management untuk staff
│       ├── Field/         # Field management
│       ├── Payment/       # Payment processing
│       └── User/          # User management
├── App.jsx                # Main app component dengan routing
└── main.jsx               # Application entry point
```

## 🔐 **Role-Based Access Control**

### User Roles (sesuai backend):
- **penyewa** - Customer yang dapat booking lapangan
- **staff_kasir** - Kasir yang mengelola pembayaran
- **operator_lapangan** - Operator yang mengelola lapangan
- **manajer_futsal** - Manager dengan akses business analytics
- **supervisor_sistem** - Supervisor dengan full system access

### Route Protection:
- `/` - Customer routes (role: penyewa)
- `/staff` - Staff routes (roles: kasir, operator, manager, supervisor)
- `/login`, `/register` - Public routes

## 🌐 **API Integration**

### Backend URL:
- **Production**: `https://booking-futsal-production.up.railway.app/api`
- **Authentication**: HttpOnly Cookie-based JWT

### Key Features:
- ✅ Automatic token handling via cookies
- ✅ Request/Response interceptors untuk error handling
- ✅ Role-based route protection
- ✅ Automatic redirect pada unauthorized access

## 🧪 **Test Users**

```javascript
// Supervisor
email: 'pweb@futsalapp.com'
password: 'password123'

// Manager
email: 'manajer1@futsalapp.com'
password: 'password123'

// Operator
email: 'operator1@futsalapp.com'
password: 'password123'

// Kasir
email: 'kasir1@futsalapp.com'
password: 'password123'

// Customer
email: 'ari@gmail.com'
password: 'password123'
```
