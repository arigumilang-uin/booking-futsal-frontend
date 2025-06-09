// src/components/MinimalistCustomerDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { getCustomerBookings } from '../api/bookingAPI';
import MinimalistCustomerHeader from './MinimalistCustomerHeader';

// Simple placeholder components instead of lazy loading
const BookingHistoryPanel = ({ bookings = [] }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Booking</h2>
    {bookings.length > 0 ? (
      <div className="space-y-4">
        {bookings.slice(0, 5).map((booking, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{booking.field_name || `Lapangan ${booking.field_id}`}</h3>
                <p className="text-sm text-gray-600">📅 {booking.date} • ⏰ {booking.start_time} - {booking.end_time}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {booking.status}
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Riwayat Booking</h3>
        <p className="text-gray-600 mb-6">Mulai dengan membuat booking pertama Anda.</p>
      </div>
    )}
  </div>
);

const FieldAvailabilityPanel = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Ketersediaan Lapangan</h2>
    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg text-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-white">🏟️</span>
      </div>
      <h3 className="text-lg font-semibold text-green-900 mb-2">Cek Ketersediaan Lapangan</h3>
      <p className="text-green-700 mb-4">Lihat jadwal ketersediaan semua lapangan futsal.</p>
    </div>
  </div>
);

const NewBookingPanel = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Baru</h2>
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-white">➕</span>
      </div>
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Buat Booking Lapangan</h3>
      <p className="text-blue-700 mb-4">Pilih lapangan, tanggal, dan waktu yang Anda inginkan.</p>
    </div>
  </div>
);

const CustomerProfilePanel = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profil Saya</h2>
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg text-center">
      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-white">👤</span>
      </div>
      <h3 className="text-lg font-semibold text-orange-900 mb-2">Kelola Profil Anda</h3>
      <p className="text-orange-700 mb-4">Update informasi pribadi dan pengaturan akun.</p>
    </div>
  </div>
);

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
          membership_level: 'Regular',
          loyalty_points: 150
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
      membership_level: dashboardData?.membership_level || 'Regular',
      loyalty_points: dashboardData?.loyalty_points || 0
    };
  }, [customerBookings, dashboardData]);

  // Navigation items for customer
  const navigationItems = [
    { id: 'overview', label: 'Ringkasan', icon: '📊', color: 'emerald' },
    { id: 'booking', label: 'Booking Baru', icon: '➕', color: 'blue' },
    { id: 'history', label: 'Riwayat Booking', icon: '📅', color: 'purple' },
    { id: 'fields', label: 'Ketersediaan', icon: '🏟️', color: 'green' },
    { id: 'profile', label: 'Profil Saya', icon: '👤', color: 'orange' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-8 shadow-xl"></div>
            <div className="absolute inset-0 rounded-full bg-emerald-100 opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-emerald-800">Loading Customer Portal</h2>
            <p className="text-emerald-600 font-medium">Preparing your personalized dashboard...</p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 relative overflow-hidden" style={{
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(5, 150, 105, 0.06) 0%, transparent 50%),
        linear-gradient(90deg, rgba(16, 185, 129, 0.04) 1px, transparent 1px),
        linear-gradient(rgba(16, 185, 129, 0.04) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px'
    }}>
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-emerald-300 rounded-full opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-emerald-400 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      {/* Customer Header */}
      <MinimalistCustomerHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Refresh Button - Customer Style */}
        <div className="flex justify-end">
          <button
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>🔄</span>
            <span className="font-medium">Muat Ulang Dashboard</span>
          </button>
        </div>

      {/* Customer Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900 mb-1">{overview?.total_bookings || 0}</div>
              <div className="text-sm font-semibold text-emerald-600 mb-1">Total Booking</div>
              <div className="text-xs text-gray-500">Sepanjang waktu</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900 mb-1">{overview?.confirmed_bookings || 0}</div>
              <div className="text-sm font-semibold text-blue-600 mb-1">Terkonfirmasi</div>
              <div className="text-xs text-gray-500">Booking aktif</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-yellow-100 hover:shadow-2xl hover:border-yellow-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900 mb-1">{overview?.pending_bookings || 0}</div>
              <div className="text-sm font-semibold text-yellow-600 mb-1">Menunggu</div>
              <div className="text-xs text-gray-500">Konfirmasi</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900 mb-1">{overview?.completed_bookings || 0}</div>
              <div className="text-sm font-semibold text-green-600 mb-1">Selesai</div>
              <div className="text-xs text-gray-500">Permainan</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900 mb-1">Rp {overview?.total_spent || '0'}</div>
              <div className="text-sm font-semibold text-purple-600 mb-1">Total Belanja</div>
              <div className="text-xs text-gray-500">Sepanjang waktu</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-orange-100 hover:shadow-2xl hover:border-orange-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900 mb-1">{overview?.loyalty_points || 0}</div>
              <div className="text-sm font-semibold text-orange-600 mb-1">Poin Loyalitas</div>
              <div className="text-xs text-gray-500">Dapat ditukar</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap gap-3">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`group flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
                activeView === item.id
                  ? `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white shadow-2xl transform scale-105`
                  : `text-${item.color}-600 hover:bg-gradient-to-r hover:from-${item.color}-50 hover:to-${item.color}-100 hover:text-${item.color}-700 hover:shadow-lg hover:-translate-y-0.5`
              }`}
            >
              {activeView === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
              )}
              <span className="text-xl relative z-10 group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
              <span className="hidden sm:inline relative z-10 font-medium">{item.label}</span>
              {activeView === item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Panels */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm">
        {activeView === 'overview' && (
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">📊</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Ringkasan Customer</h2>
                <p className="text-gray-600">Overview aktivitas dan informasi akun Anda</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Bookings */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl shadow-lg border border-emerald-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl text-white">📅</span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900">Booking Terbaru</h3>
                </div>
                <div className="space-y-4">
                  {customerBookings?.slice(0, 5).map((booking, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl shadow-md border border-emerald-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">🏟️</span>
                            <p className="font-bold text-gray-900 text-lg">{booking.field_name || `Lapangan ${booking.field_id}`}</p>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <span>📅</span>
                              <span>{booking.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>⏰</span>
                              <span>{booking.start_time} - {booking.end_time}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-2 rounded-xl text-sm font-semibold shadow-sm ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-200' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📅</span>
                      </div>
                      <p className="text-gray-500 text-lg font-medium">Belum ada booking</p>
                      <p className="text-gray-400 text-sm mt-1">Mulai dengan membuat booking pertama Anda</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg border border-blue-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl text-white">👤</span>
                  </div>
                  <h3 className="text-xl font-bold text-blue-900">Info Customer</h3>
                </div>
                <div className="space-y-5">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Nama Lengkap</p>
                        <p className="text-lg font-bold text-gray-900">{user?.name || 'Customer'}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Level Membership</p>
                        <p className="text-lg font-bold text-gray-900">{overview?.membership_level || 'Regular'}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🏅</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Lapangan Favorit</p>
                        <p className="text-lg font-bold text-gray-900">{overview?.favorite_field || 'Lapangan A'}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🏟️</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'booking' && <NewBookingPanel />}
        {activeView === 'history' && <BookingHistoryPanel bookings={customerBookings} />}
        {activeView === 'fields' && <FieldAvailabilityPanel />}
        {activeView === 'profile' && <CustomerProfilePanel />}
      </div>
      </div>
    </div>
  );
};

export default MinimalistCustomerDashboard;
