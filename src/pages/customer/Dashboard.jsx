import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getCustomerBookings } from "../../api/bookingAPI";
import { getPublicFields } from "../../api/fieldAPI";
import MinimalistCustomerDashboard from "../../components/MinimalistCustomerDashboard";
import ErrorBoundary from "../../components/ErrorBoundary";
import {
  getDashboardStats,
  getAvailablePromotions,
  getFavoriteFields,
  getRecommendations,
  getUnreadNotificationCount
} from "../../api";
import FavoriteFields from "../../components/FavoriteFields";
import PromotionList from "../../components/PromotionList";

const CustomerDashboard = () => {
  const { user } = useAuth();

  // Use minimalist dashboard for customer with error boundary
  return (
    <ErrorBoundary>
      <MinimalistCustomerDashboard />
    </ErrorBoundary>
  );


};

export default CustomerDashboard;
