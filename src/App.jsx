import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider";
import NotificationProvider from "./contexts/NotificationProvider";
import EnhancedErrorBoundary from "./components/EnhancedErrorBoundary";
import performanceService from "./services/PerformanceService";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import StaffLayout from "./layouts/StaffLayout";
import SupervisorLayout from "./layouts/SupervisorLayout";
import ConditionalStaffLayout from "./layouts/ConditionalStaffLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";

// Customer Pages (penyewa)
import CustomerDashboard from "./pages/customer/Dashboard";
import BookingForm from "./pages/customer/Booking/BookingForm";
import BookingList from "./pages/customer/Booking/BookingList";
import FieldList from "./pages/customer/Field/FieldList";
import PaymentPage from "./pages/customer/Payment/PaymentPage";
import ProfilePage from "./pages/customer/Profile/ProfilePage";
import BookingDebugger from "./components/BookingDebugger";

// Staff Pages (kasir, operator, manager, supervisor)
import StaffDashboard from "./pages/staff/Dashboard";
import BookingManagement from "./pages/staff/Booking/BookingManagement";
import FieldManagement from "./pages/staff/Field/FieldManagement";
import PaymentManagement from "./pages/staff/Payment/PaymentManagement";
import UserManagement from "./pages/staff/User/UserManagement";

// Protected Route Wrapper
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  console.log('🚀 Booking Futsal App is starting...');

  // Initialize performance monitoring
  // if (typeof window !== 'undefined') {
  //   performanceService.startMeasure('app-initialization');
  // }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* CUSTOMER ROUTES (penyewa) */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["penyewa"]}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="bookings/new" element={<BookingForm />} />
            <Route path="bookings" element={<BookingList />} />
            <Route path="bookings/debug" element={<BookingDebugger />} />
            <Route path="fields" element={<FieldList />} />
            <Route path="payments" element={<PaymentPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* STAFF ROUTES - CONDITIONAL LAYOUT BASED ON ROLE */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["staff_kasir", "operator_lapangan", "manajer_futsal", "supervisor_sistem"]}>
                <ConditionalStaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="fields" element={<FieldManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Redirect unknown route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
