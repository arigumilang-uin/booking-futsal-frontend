import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider"; 

// Layouts
import UserLayout from "./layouts/UserLayout";
import PengelolaLayout from "./layouts/PengelolaLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import BookingForm from "./pages/user/Booking/BookingForm";
import BookingList from "./pages/user/Booking/BookingList";
import FieldList from "./pages/user/Field/FieldList";
import PaymentPage from "./pages/user/Payment/PaymentPage";
import ProfilePage from "./pages/user/Profile/ProfilePage";

// Pengelola Pages
import PengelolaDashboard from "./pages/pengelola/Dashboard";
import BookingManagement from "./pages/pengelola/Booking/BookingManagement";
import FieldManagement from "./pages/pengelola/Field/FieldManagement";
import PaymentManagement from "./pages/pengelola/Payment/PaymentManagement";
import UserManagement from "./pages/pengelola/User/UserManagement";

// Protected Route Wrapper
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* USER ROUTES */}
          <Route
            path="/"
            element={
              <ProtectedRoute role="user">
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="bookings/new" element={<BookingForm />} />
            <Route path="bookings" element={<BookingList />} />
            <Route path="fields" element={<FieldList />} />
            <Route path="payments" element={<PaymentPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* PENGELOLA ROUTES */}
          <Route
            path="/pengelola"
            element={
              <ProtectedRoute role="pengelola">
                <PengelolaLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PengelolaDashboard />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="fields" element={<FieldManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Redirect unknown route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
