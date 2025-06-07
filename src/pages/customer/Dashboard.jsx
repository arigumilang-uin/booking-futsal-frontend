import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getCustomerBookings } from "../../api/bookingAPI";
import { getPublicFields } from "../../api/fieldAPI";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    unreadNotifications: 0,
    favoriteFields: 0,
    availablePromotions: 0
  });
  const [promotions, setPromotions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load dashboard stats from backend
      const dashboardStatsResponse = await getDashboardStats('penyewa');
      if (dashboardStatsResponse.success) {
        setStats(prev => ({
          ...prev,
          ...dashboardStatsResponse.data
        }));
      }

      // Load recent bookings
      const bookingsResponse = await getCustomerBookings({ limit: 5 });
      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data);

        // Calculate additional stats if not from backend
        if (!dashboardStatsResponse.success) {
          const total = bookingsResponse.data.length;
          const active = bookingsResponse.data.filter(b => ['pending', 'confirmed'].includes(b.status)).length;
          const completed = bookingsResponse.data.filter(b => b.status === 'completed').length;
          setStats(prev => ({ ...prev, totalBookings: total, activeBookings: active, completedBookings: completed }));
        }
      }

      // Load available fields
      const fieldsResponse = await getPublicFields({ limit: 4 });
      if (fieldsResponse.success) {
        setFields(fieldsResponse.data);
      }

      // Load promotions
      const promotionsResponse = await getAvailablePromotions({ limit: 3 });
      if (promotionsResponse.success) {
        setPromotions(promotionsResponse.data?.promotions || []);
        setStats(prev => ({ ...prev, availablePromotions: promotionsResponse.data?.promotions?.length || 0 }));
      }

      // Load favorite fields
      const favoritesResponse = await getFavoriteFields({ limit: 3 });
      if (favoritesResponse.success) {
        setFavorites(favoritesResponse.data?.favorites || []);
        setStats(prev => ({ ...prev, favoriteFields: favoritesResponse.data?.favorites?.length || 0 }));
      }

      // Load recommendations
      const recommendationsResponse = await getRecommendations({ limit: 4 });
      if (recommendationsResponse.success) {
        setRecommendations(recommendationsResponse.data?.recommendations || []);
      }

      // Load unread notifications count
      const notificationsResponse = await getUnreadNotificationCount();
      if (notificationsResponse.success) {
        setStats(prev => ({ ...prev, unreadNotifications: notificationsResponse.data?.count || 0 }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler removed - handled by AuthProvider

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang, {user?.name || "Customer"}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Booking</p>
              <p className="text-xl font-semibold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Booking Aktif</p>
              <p className="text-xl font-semibold text-gray-900">{stats.activeBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Selesai</p>
              <p className="text-xl font-semibold text-gray-900">{stats.completedBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Notifikasi</p>
              <p className="text-xl font-semibold text-gray-900">{stats.unreadNotifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Favorit</p>
              <p className="text-xl font-semibold text-gray-900">{stats.favoriteFields}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Promosi</p>
              <p className="text-xl font-semibold text-gray-900">{stats.availablePromotions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'favorites', label: 'Favorit', icon: '❤️' },
              { id: 'promotions', label: 'Promosi', icon: '🎉' },
              { id: 'recommendations', label: 'Rekomendasi', icon: '⭐' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/bookings/new")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Booking Lapangan Baru
            </button>
            <button
              onClick={() => navigate("/bookings")}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Lihat Semua Booking
            </button>
            <button
              onClick={() => navigate("/fields")}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Daftar Lapangan
            </button>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Terbaru</h2>
          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.slice(0, 3).map((booking, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Lapangan {booking.field_name || `#${index + 1}`}</p>
                      <p className="text-sm text-gray-600">{booking.date || 'TBD'} • {booking.time_slot || 'TBD'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate("/bookings")}
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
              <p className="text-gray-500 mb-4">Belum ada booking</p>
              <button
                onClick={() => navigate("/bookings/new")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Buat booking pertama →
              </button>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="bg-white rounded-lg shadow p-6">
          <FavoriteFields showAvailability={true} />
        </div>
      )}

      {/* Promotions Tab */}
      {activeTab === 'promotions' && (
        <div className="bg-white rounded-lg shadow p-6">
          <PromotionList />
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Rekomendasi Lapangan ({recommendations.length})
          </h2>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((field, index) => (
                <div key={field.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{field.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Rekomendasi
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{field.location}</p>
                  {field.rating && (
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(field.rating) ? 'fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600">
                        {field.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <p className="text-lg font-semibold text-blue-600 mb-3">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(field.price)}/jam
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate("/bookings/new", { state: { selectedField: field } })}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition duration-200 text-sm"
                    >
                      Booking
                    </button>
                    <button
                      onClick={() => navigate(`/fields/${field.id}`)}
                      className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Rekomendasi</h3>
              <p className="text-gray-600 mb-4">
                Lakukan beberapa booking untuk mendapatkan rekomendasi lapangan yang sesuai dengan preferensi Anda.
              </p>
              <button
                onClick={() => navigate('/fields')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Jelajahi Lapangan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Available Fields - Only show in overview tab */}
      {activeTab === 'overview' && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lapangan Tersedia</h2>
        {fields.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fields.map((field, index) => (
              <div key={field.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                <h3 className="font-medium text-gray-900 mb-2">{field.name || `Lapangan ${index + 1}`}</h3>
                <p className="text-sm text-gray-600 mb-2">{field.type || 'Futsal'}</p>
                <p className="text-lg font-semibold text-blue-600 mb-3">
                  Rp {field.price_per_hour?.toLocaleString() || '100,000'}/jam
                </p>
                <button
                  onClick={() => navigate("/bookings/new", { state: { selectedField: field } })}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition duration-200 text-sm"
                >
                  Booking Sekarang
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Memuat data lapangan...</p>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
