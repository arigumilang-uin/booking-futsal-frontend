import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../api/axiosConfig';
import { Clock, CheckCircle, AlertCircle, RefreshCw, Play } from 'lucide-react';

/**
 * Komponen untuk monitoring dan kontrol sistem auto-completion booking
 * Hanya untuk supervisor dan admin
 */
const AutoCompletionMonitor = () => {
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  // Load eligible bookings for auto-completion
  const loadEligibleBookings = async () => {
    try {
      setError(null);
      const response = await axiosInstance.get('/admin/auto-completion/eligible');
      
      if (response.data.success) {
        setEligibleBookings(response.data.data.eligible_bookings || []);
        setLastCheck(new Date(response.data.data.checked_at));
      } else {
        setError(response.data.error || 'Failed to load eligible bookings');
      }
    } catch (err) {
      console.error('Error loading eligible bookings:', err);
      setError(err.response?.data?.error || err.message || 'Network error');
    }
  };

  // Load auto-completion statistics
  const loadStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/auto-completion/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error loading auto-completion stats:', err);
    }
  };

  // Trigger manual auto-completion
  const triggerAutoCompletion = async () => {
    try {
      setTriggering(true);
      setError(null);
      
      const response = await axiosInstance.post('/admin/auto-completion/trigger');
      
      if (response.data.success) {
        const { completed_count, completed_bookings } = response.data.data;
        
        alert(`✅ Auto-completion berhasil!\n${completed_count} booking telah diselesaikan.`);
        
        // Reload data
        await loadEligibleBookings();
        await loadStats();
      } else {
        setError(response.data.error || 'Failed to trigger auto-completion');
      }
    } catch (err) {
      console.error('Error triggering auto-completion:', err);
      setError(err.response?.data?.error || err.message || 'Network error');
    } finally {
      setTriggering(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadEligibleBookings(), loadStats()]);
      setLoading(false);
    };

    loadData();

    // Auto refresh every 2 minutes
    const interval = setInterval(() => {
      loadEligibleBookings();
      loadStats();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  // Format time
  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data auto-completion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Auto-Completion Monitor</h2>
              <p className="text-gray-600">Monitoring sistem penyelesaian booking otomatis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                loadEligibleBookings();
                loadStats();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={triggerAutoCompletion}
              disabled={triggering || eligibleBookings.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{triggering ? 'Memproses...' : 'Trigger Manual'}</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error:</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Auto-Completed</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total_auto_completed || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Hari Ini</p>
                  <p className="text-2xl font-bold text-green-900">{stats.today_completed || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Menunggu</p>
                  <p className="text-2xl font-bold text-purple-900">{eligibleBookings.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Check Info */}
        {lastCheck && (
          <div className="text-sm text-gray-600 mb-4">
            <span>Terakhir dicek: {formatTime(lastCheck)}</span>
          </div>
        )}
      </div>

      {/* Eligible Bookings List */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Booking Siap Auto-Complete ({eligibleBookings.length})
        </h3>
        
        {eligibleBookings.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Semua Booking Up-to-Date</h4>
            <p className="text-gray-600">Tidak ada booking yang perlu diselesaikan saat ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eligibleBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{booking.customer_name}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {booking.booking_number}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Lapangan:</span> {booking.field_name}
                      </div>
                      <div>
                        <span className="font-medium">Tanggal:</span> {booking.booking_date}
                      </div>
                      <div>
                        <span className="font-medium">Waktu:</span> {booking.start_time} - {booking.end_time}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(booking.total_amount)}
                    </div>
                    <div className="text-sm text-red-600">
                      Terlambat {Math.round(booking.minutes_overdue)} menit
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoCompletionMonitor;
