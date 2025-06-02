// src/pages/staff/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getAllBookings, getBookingAnalytics } from "../../api/bookingAPI";
import { getAllFields } from "../../api/fieldAPI";
import { getAllPayments, getPaymentAnalytics } from "../../api/paymentAPI";

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalFields: 0,
    pendingPayments: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load bookings data
      const bookingsResponse = await getAllBookings({ limit: 5 });
      if (bookingsResponse.success) {
        setRecentBookings(bookingsResponse.data);
        setStats(prev => ({
          ...prev,
          totalBookings: bookingsResponse.total || bookingsResponse.data.length,
          pendingBookings: bookingsResponse.data.filter(b => b.status === 'pending').length
        }));
      }

      // Load analytics if user has permission
      if (['manajer_futsal', 'supervisor_sistem'].includes(user?.role)) {
        try {
          const analyticsResponse = await getBookingAnalytics();
          if (analyticsResponse.success) {
            setStats(prev => ({
              ...prev,
              totalRevenue: analyticsResponse.data.totalRevenue || 0
            }));
          }
        } catch (error) {
          console.log('Analytics not available for this role');
        }
      }

      // Load fields count
      try {
        const fieldsResponse = await getAllFields({ limit: 1 });
        if (fieldsResponse.success) {
          setStats(prev => ({
            ...prev,
            totalFields: fieldsResponse.total || 4
          }));
        }
      } catch (error) {
        console.log('Fields data not available');
      }

      // Load payments data for kasir and above
      if (['staff_kasir', 'manajer_futsal', 'supervisor_sistem'].includes(user?.role)) {
        try {
          const paymentsResponse = await getAllPayments({ status: 'pending', limit: 1 });
          if (paymentsResponse.success) {
            setStats(prev => ({
              ...prev,
              pendingPayments: paymentsResponse.total || 0
            }));
          }
        } catch (error) {
          console.log('Payments data not available');
        }
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Get role-specific title and features
  const getRoleInfo = (role) => {
    switch (role) {
      case 'staff_kasir':
        return {
          title: 'Dashboard Kasir',
          description: 'Kelola pembayaran dan transaksi',
          color: 'green',
          features: ['Verifikasi Pembayaran', 'Laporan Keuangan']
        };
      case 'operator_lapangan':
        return {
          title: 'Dashboard Operator Lapangan',
          description: 'Kelola lapangan dan booking',
          color: 'blue',
          features: ['Status Lapangan', 'Konfirmasi Booking']
        };
      case 'manajer_futsal':
        return {
          title: 'Dashboard Manager',
          description: 'Analytics dan manajemen bisnis',
          color: 'purple',
          features: ['Business Analytics', 'Laporan Lengkap']
        };
      case 'supervisor_sistem':
        return {
          title: 'Dashboard Supervisor',
          description: 'Full system administration',
          color: 'red',
          features: ['System Admin', 'User Management']
        };
      default:
        return {
          title: 'Dashboard Staff',
          description: 'Staff dashboard',
          color: 'gray',
          features: ['Basic Access']
        };
    }
  };

  const roleInfo = getRoleInfo(user?.role);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{roleInfo.title}</h1>
        <p className="text-gray-600 mt-1">Selamat datang, {user?.name || "Staff"} • {roleInfo.description}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Booking</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Lapangan</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalFields}</p>
            </div>
          </div>
        </div>

        {['staff_kasir', 'manajer_futsal', 'supervisor_sistem'].includes(user?.role) && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions & Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/staff/bookings")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Kelola Booking
            </button>

            {['operator_lapangan', 'manajer_futsal', 'supervisor_sistem'].includes(user?.role) && (
              <button
                onClick={() => navigate("/staff/fields")}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Kelola Lapangan
              </button>
            )}

            {['staff_kasir', 'manajer_futsal', 'supervisor_sistem'].includes(user?.role) && (
              <button
                onClick={() => navigate("/staff/payments")}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                Kelola Pembayaran
              </button>
            )}

            {['manajer_futsal', 'supervisor_sistem'].includes(user?.role) && (
              <button
                onClick={() => navigate("/staff/users")}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                Kelola Pengguna
              </button>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Terbaru</h2>
          {recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.slice(0, 5).map((booking, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.customer_name || 'Customer'} - Lapangan {booking.field_name || `#${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-600">{booking.date || 'TBD'} • {booking.time_slot || 'TBD'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate("/staff/bookings")}
                className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
              >
                Lihat Semua →
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p className="text-gray-500">Belum ada booking terbaru</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Analytics for Manager and Supervisor */}
      {['manajer_futsal', 'supervisor_sistem'].includes(user?.role) && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                Rp {stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {Math.round((stats.totalBookings / 30) * 100) / 100}
              </p>
              <p className="text-sm text-gray-600">Avg Bookings/Day</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalRevenue > 0 ? Math.round(stats.totalRevenue / stats.totalBookings).toLocaleString() : 0}
              </p>
              <p className="text-sm text-gray-600">Avg Revenue/Booking</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
