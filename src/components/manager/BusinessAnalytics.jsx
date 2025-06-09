// src/components/manager/BusinessAnalytics.jsx
import { useState, useEffect } from 'react';
import { getBusinessAnalytics, getBookingReports, getRevenueReports } from '../../api/managerAPI';
import LoadingSpinner from '../LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/testHelpers';

const BusinessAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const periods = [
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'quarter', label: 'Kuartal Ini' },
    { value: 'year', label: 'Tahun Ini' }
  ];

  const metrics = [
    { value: 'overview', label: 'Ringkasan', icon: '📊' },
    { value: 'revenue', label: 'Pendapatan', icon: '💰' },
    { value: 'bookings', label: 'Booking', icon: '📅' },
    { value: 'customers', label: 'Customer', icon: '👥' },
    { value: 'fields', label: 'Lapangan', icon: '🏟️' }
  ];

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getBusinessAnalytics({ period: selectedPeriod });
      if (response.success) {
        setAnalytics(response.data);
      } else {
        // Handle placeholder response from backend
        setAnalytics({
          revenue: { total: 0, growth: 0, by_field: [], by_payment_method: [] },
          bookings: { total: 0, confirmed: 0, pending: 0, cancelled: 0, popular_hours: [], recent: [] },
          customers: { active: 0, new: 0, growth: 0 },
          fields: { utilization: 0, active: 0 }
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics({
        revenue: { total: 0, growth: 0, by_field: [], by_payment_method: [] },
        bookings: { total: 0, confirmed: 0, pending: 0, cancelled: 0, popular_hours: [], recent: [] },
        customers: { active: 0, new: 0, growth: 0 },
        fields: { utilization: 0, active: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat analitik bisnis..." />;
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 font-semibold mb-1">Total Pendapatan</p>
            <p className="text-3xl font-bold text-green-900">
              {formatCurrency(analytics?.revenue?.total || 0)}
            </p>
            <p className="text-sm text-green-600 mt-1">
              +{analytics?.revenue?.growth || 0}% dari periode sebelumnya
            </p>
          </div>
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl text-white">💰</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 font-semibold mb-1">Total Booking</p>
            <p className="text-3xl font-bold text-blue-900">
              {analytics?.bookings?.total || 0}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {analytics?.bookings?.confirmed || 0} dikonfirmasi
            </p>
          </div>
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl text-white">📅</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 font-semibold mb-1">Customer Aktif</p>
            <p className="text-3xl font-bold text-purple-900">
              {analytics?.customers?.active || 0}
            </p>
            <p className="text-sm text-purple-600 mt-1">
              {analytics?.customers?.new || 0} customer baru
            </p>
          </div>
          <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl text-white">👥</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-600 font-semibold mb-1">Utilisasi Lapangan</p>
            <p className="text-3xl font-bold text-orange-900">
              {analytics?.fields?.utilization || 0}%
            </p>
            <p className="text-sm text-orange-600 mt-1">
              {analytics?.fields?.active || 0} lapangan aktif
            </p>
          </div>
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl text-white">🏟️</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Tren Pendapatan</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart pendapatan akan ditampilkan di sini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan per Lapangan</h3>
          <div className="space-y-3">
            {analytics?.revenue?.by_field?.map((field, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{field.name}</span>
                <span className="text-green-600 font-bold">{formatCurrency(field.revenue)}</span>
              </div>
            )) || <p className="text-gray-500">Data tidak tersedia</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
          <div className="space-y-3">
            {analytics?.revenue?.by_payment_method?.map((method, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{method.method}</span>
                <span className="text-blue-600 font-bold">{formatCurrency(method.amount)}</span>
              </div>
            )) || <p className="text-gray-500">Data tidak tersedia</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Booking</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {analytics?.bookings?.pending || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dikonfirmasi</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {analytics?.bookings?.confirmed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Selesai</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {analytics?.bookings?.completed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dibatalkan</span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {analytics?.bookings?.cancelled || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Jam Populer</h3>
          <div className="space-y-2">
            {analytics?.bookings?.popular_hours?.map((hour, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{hour.time}</span>
                <span className="font-medium">{hour.count} booking</span>
              </div>
            )) || <p className="text-gray-500">Data tidak tersedia</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Terbaru</h3>
          <div className="space-y-3">
            {analytics?.bookings?.recent?.slice(0, 5).map((booking, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{booking.customer_name}</p>
                <p className="text-xs text-gray-600">{booking.field_name} • {formatDate(booking.date)}</p>
              </div>
            )) || <p className="text-gray-500">Data tidak tersedia</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedMetric) {
      case 'revenue':
        return renderRevenue();
      case 'bookings':
        return renderBookings();
      case 'customers':
        return <div className="text-center py-12 text-gray-500">Analitik customer akan segera tersedia</div>;
      case 'fields':
        return <div className="text-center py-12 text-gray-500">Analitik lapangan akan segera tersedia</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analitik Bisnis</h2>
          <p className="text-gray-600">Pantau performa bisnis dan tren operasional</p>
        </div>

        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>

          <button
            onClick={loadAnalytics}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {metrics.map(metric => (
          <button
            key={metric.value}
            onClick={() => setSelectedMetric(metric.value)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${selectedMetric === metric.value
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200'
              }`}
          >
            <span>{metric.icon}</span>
            <span>{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default BusinessAnalytics;
