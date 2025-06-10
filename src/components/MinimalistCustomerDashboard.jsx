// src/components/MinimalistCustomerDashboard.jsx
// MODERN CUSTOMER DASHBOARD - TEMA GRAY/WHITE
import { useState, useEffect, useCallback, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { getCustomerBookings } from '../api/bookingAPI';
import { getPublicFields } from '../api/fieldAPI';
import { formatDateSimple } from '../utils/testHelpers';
// import { getCustomerDashboard, getFavoriteFields, getAvailablePromotions } from '../api/customerAPI';
import MinimalistCustomerHeader from './MinimalistCustomerHeader';
import CustomerBookingPanel from './customer/CustomerBookingPanel';
import CustomerFieldsPanel from './customer/CustomerFieldsPanel';
import CustomerProfilePanel from './customer/CustomerProfilePanel';
import CustomerPaymentPanel from './customer/CustomerPaymentPanel';

// Simple placeholder components instead of lazy loading
const BookingHistoryPanel = ({ bookings = [] }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Booking</h2>
    {bookings.length > 0 ? (
      <div className="space-y-4">
        {bookings.slice(0, 5).map((booking, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{booking.field_name || `Lapangan ${booking.field_id}`}</h3>
                <p className="text-sm text-gray-600">📅 {formatDateSimple(booking.date)} • ⏰ {booking.start_time} - {booking.end_time}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                }`}>
                {booking.status === 'confirmed' ? 'Dikonfirmasi' :
                  booking.status === 'pending' ? 'Menunggu' :
                    booking.status === 'completed' ? 'Selesai' :
                      booking.status === 'cancelled' ? 'Dibatalkan' :
                        booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-gray-400">📅</span>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Belum Ada Riwayat Booking</h3>
        <p className="text-gray-600 mb-6">Mulai dengan membuat booking pertama Anda.</p>
      </div>
    )}
  </div>
);

// Placeholder panels sudah diganti dengan komponen yang berfungsi

const MinimalistCustomerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [activeView, setActiveView] = useState('overview');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Load customer bookings
      const bookingsResponse = await getCustomerBookings();
      if (bookingsResponse.success) {
        console.log('📅 Customer Bookings Data Loaded:', bookingsResponse.data);
        setCustomerBookings(bookingsResponse.data || []);

        // Mock dashboard data structure
        setDashboardData({
          favorite_field: 'Lapangan A',
          membership_level: 'Regular'
        });
      }
    } catch (error) {
      console.error('Error loading customer dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Memoized overview data
  const overview = useMemo(() => {
    if (!customerBookings.length) return {};

    const totalBookings = customerBookings.length;
    const confirmedBookings = customerBookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = customerBookings.filter(b => b.status === 'pending').length;
    const completedBookings = customerBookings.filter(b => b.status === 'completed').length;
    const totalSpent = customerBookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

    return {
      total_bookings: totalBookings,
      confirmed_bookings: confirmedBookings,
      pending_bookings: pendingBookings,
      completed_bookings: completedBookings,
      total_spent: totalSpent.toLocaleString('id-ID'),
      favorite_field: dashboardData?.favorite_field || 'Lapangan A',
      membership_level: dashboardData?.membership_level || 'Regular'
    };
  }, [customerBookings, dashboardData]);

  // Navigation items for customer
  const navigationItems = [
    { id: 'overview', label: 'Ringkasan', icon: '📊', color: 'gray' },
    { id: 'booking', label: 'Booking Baru', icon: '➕', color: 'blue' },
    { id: 'history', label: 'Riwayat Booking', icon: '📅', color: 'purple' },
    { id: 'payment', label: 'Pembayaran', icon: '💳', color: 'indigo' },
    { id: 'fields', label: 'Ketersediaan', icon: '🏟️', color: 'yellow' },
    { id: 'profile', label: 'Profil Saya', icon: '👤', color: 'orange' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-gray-800 mx-auto mb-8 shadow-xl"></div>
            <div className="absolute inset-0 rounded-full bg-gray-100 opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">Loading Customer Portal</h2>
            <p className="text-gray-600 font-medium">Preparing your personalized dashboard...</p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 relative overflow-hidden" style={{
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(126, 34, 206, 0.06) 0%, transparent 50%),
        linear-gradient(90deg, rgba(147, 51, 234, 0.04) 1px, transparent 1px),
        linear-gradient(rgba(147, 51, 234, 0.04) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px'
    }}>
      <MinimalistCustomerHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Refresh Button - Soccer Style */}
        <div className="flex justify-end">
          <button
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Muat Ulang Dashboard</span>
          </button>
        </div>

        {/* Soccer Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{overview?.total_bookings || 0}</div>
                <div className="text-sm font-medium text-gray-800 mt-1">Total Booking</div>
                <div className="text-xs text-gray-500 mt-1">Sepanjang waktu</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-2xl text-white">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{overview?.confirmed_bookings || 0}</div>
                <div className="text-sm font-medium text-gray-800 mt-1">Terkonfirmasi</div>
                <div className="text-xs text-gray-500 mt-1">Booking aktif</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-2xl text-white">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{overview?.pending_bookings || 0}</div>
                <div className="text-sm font-medium text-gray-800 mt-1">Menunggu</div>
                <div className="text-xs text-gray-500 mt-1">Konfirmasi</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-2xl text-white">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{overview?.completed_bookings || 0}</div>
                <div className="text-sm font-medium text-gray-800 mt-1">Selesai</div>
                <div className="text-xs text-gray-500 mt-1">Permainan</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-2xl text-white">🏆</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">Rp {overview?.total_spent || '0'}</div>
                <div className="text-sm font-medium text-gray-800 mt-1">Total Belanja</div>
                <div className="text-xs text-gray-500 mt-1">Sepanjang waktu</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-2xl text-white">💰</span>
              </div>
            </div>
          </div>


        </div>

        {/* Soccer Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <nav className="flex space-x-1">
            {[
              {
                id: 'overview',
                label: 'Ringkasan',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                id: 'booking',
                label: 'Booking Baru',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )
              },
              {
                id: 'history',
                label: 'Riwayat Booking',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )
              },
              {
                id: 'payment',
                label: 'Pembayaran',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )
              },
              {
                id: 'fields',
                label: 'Ketersediaan',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              },
              {
                id: 'profile',
                label: 'Profil Saya',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeView === tab.id
                  ? 'bg-gray-800 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Panels */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm">
          {activeView === 'overview' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">📊</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Ringkasan Customer</h2>
                  <p className="text-gray-600">Overview aktivitas dan informasi akun Anda</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl text-white">📅</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Booking Terbaru</h3>
                  </div>
                  <div className="space-y-4">
                    {customerBookings?.slice(0, 5).map((booking, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">🏟️</span>
                              <p className="font-bold text-gray-800 text-lg">{booking.field_name || `Lapangan ${booking.field_id}`}</p>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <span>📅</span>
                                <span>{formatDateSimple(booking.date)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>⏰</span>
                                <span>{booking.start_time} - {booking.end_time}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-2 rounded-xl text-sm font-semibold shadow-sm ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              booking.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                                  'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                            {booking.status === 'confirmed' ? 'Dikonfirmasi' :
                              booking.status === 'pending' ? 'Menunggu' :
                                booking.status === 'completed' ? 'Selesai' :
                                  booking.status === 'cancelled' ? 'Dibatalkan' :
                                    booking.status}
                          </span>
                        </div>
                      </div>
                    )) || (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📅</span>
                          </div>
                          <p className="text-gray-500 text-lg font-medium">Belum ada booking</p>
                          <p className="text-gray-400 text-sm mt-1">Mulai dengan membuat booking pertama Anda</p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gradient-to-br from-blue-50 to-gray-100 p-8 rounded-2xl shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl text-white">👤</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Info Customer</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Nama Lengkap</p>
                          <p className="text-lg font-bold text-gray-800">{user?.name || 'Customer'}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Level Membership</p>
                          <p className="text-lg font-bold text-gray-800">{overview?.membership_level || 'Regular'}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🏅</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Lapangan Favorit</p>
                          <p className="text-lg font-bold text-gray-800">{overview?.favorite_field || 'Lapangan A'}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🏟️</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'booking' && <CustomerBookingPanel />}
          {activeView === 'history' && <BookingHistoryPanel bookings={customerBookings} />}
          {activeView === 'payment' && <CustomerPaymentPanel />}
          {activeView === 'fields' && <CustomerFieldsPanel />}
          {activeView === 'profile' && <CustomerProfilePanel />}
        </div>
      </div>
    </div>
  );
};

export default MinimalistCustomerDashboard;
