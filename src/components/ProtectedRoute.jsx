// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { user, loading, isAuthenticated, hasAnyRole, isStaff } = useContext(AuthContext);

  // Show loading while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('🚫 Access denied: User not authenticated');
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check user role
  if (allowedRoles.length > 0 && user) {
    if (!hasAnyRole(allowedRoles)) {
      console.log('🚫 Access denied: Insufficient role permissions', {
        userRole: user.role,
        allowedRoles
      });

      // Redirect based on user role
      if (user.role === "penyewa") {
        return <Navigate to="/" replace />;
      } else if (isStaff()) {
        return <Navigate to="/staff" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  // If user is authenticated but accessing wrong area
  if (user && allowedRoles.length > 0) {
    const currentPath = window.location.pathname;

    // Customer trying to access staff area
    if (user.role === "penyewa" && currentPath.startsWith("/staff")) {
      console.log('🚫 Customer trying to access staff area');
      return <Navigate to="/" replace />;
    }

    // Staff trying to access customer area (except dashboard)
    if (isStaff() && currentPath === "/" && !allowedRoles.includes("penyewa")) {
      console.log('🚫 Staff trying to access customer area');
      return <Navigate to="/staff" replace />;
    }
  }

  console.log('✅ Access granted:', {
    userRole: user?.role,
    allowedRoles,
    currentPath: window.location.pathname
  });

  return children;
};

export default ProtectedRoute;
