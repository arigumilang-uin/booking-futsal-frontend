// src/components/manager/Reports.jsx
import { useState, useEffect } from 'react';
import { 
  getBookingReports, 
  getRevenueReports, 
  getFieldUtilizationReports, 
  getStaffPerformanceReports 
} from '../../api/managerAPI';
import { formatCurrency, formatDate } from '../../utils/testHelpers';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [activeReport, setActiveReport] = useState('booking');
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    { id: 'booking', label: 'Laporan Booking', icon: '📅', color: 'blue' },
    { id: 'revenue', label: 'Laporan Pendapatan', icon: '💰', color: 'green' },
    { id: 'field', label: 'Utilisasi Lapangan', icon: '🏟️', color: 'purple' },
    { id: 'staff', label: 'Performa Staff', icon: '👥', color: 'orange' }
  ];

  useEffect(() => {
    loadReport();
  }, [activeReport, dateRange]);

  const loadReport = async () => {
    try {
      setLoading(true);
      let response;
      
      const params = {
        date_from: dateRange.from,
        date_to: dateRange.to
      };

      switch (activeReport) {
        case 'booking':
          response = await getBookingReports(params);
          break;
        case 'revenue':
          response = await getRevenueReports(params);
          break;
        case 'field':
          response = await getFieldUtilizationReports(params);
          break;
        case 'staff':
          response = await getStaffPerformanceReports(params);
          break;
        default:
          response = { success: false, error: 'Invalid report type' };
      }

      if (response.success) {
        setReportData(response.data);
      } else {
        showNotification('error', 'Gagal memuat laporan');
        setReportData(null);
      }
    } catch (error) {
      console.error('Error loading report:', error);
      showNotification('error', 'Terjadi kesalahan saat memuat laporan');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  const exportReport = () => {
    // Placeholder for export functionality
    showNotification('info', 'Fitur export akan segera tersedia');
  };

  const renderBookingReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {reportData?.total_bookings || 0}
            </div>
            <div className="text-sm font-medium text-gray-600">Total Booking</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {reportData?.confirmed_bookings || 0}
            </div>
            <div className="text-sm font-medium text-gray-600">Dikonfirmasi</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {reportData?.pending_bookings || 0}
            </div>
            <div className="text-sm font-medium text-gray-600">Pending</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {reportData?.cancelled_bookings || 0}
            </div>
            <div className="text-sm font-medium text-gray-600">Dibatalkan</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Booking per Hari</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart booking harian akan ditampilkan di sini</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Detail Booking</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lapangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData?.bookings?.slice(0, 10).map((booking, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(booking.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.field_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(booking.total_amount)}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data booking
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRevenueReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(reportData?.total_revenue || 0)}
            </div>
            <div className="text-sm font-medium text-gray-600">Total Pendapatan</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(reportData?.average_per_booking || 0)}
            </div>
            <div className="text-sm font-medium text-gray-600">Rata-rata per Booking</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {reportData?.growth_percentage || 0}%
            </div>
            <div className="text-sm font-medium text-gray-600">Pertumbuhan</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Pendapatan per Lapangan</h3>
          <div className="space-y-3">
            {reportData?.revenue_by_field?.map((field, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{field.field_name}</span>
                <span className="text-green-600 font-bold">{formatCurrency(field.revenue)}</span>
              </div>
            )) || <p className="text-gray-500">Data tidak tersedia</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Tren Pendapatan Harian</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart tren pendapatan akan ditampilkan di sini</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFieldReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {reportData?.average_utilization || 0}%
            </div>
            <div className="text-sm font-medium text-gray-600">Rata-rata Utilisasi</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {reportData?.most_popular_field?.name || 'N/A'}
            </div>
            <div className="text-sm font-medium text-gray-600">Lapangan Terpopuler</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {reportData?.peak_hours || 'N/A'}
            </div>
            <div className="text-sm font-medium text-gray-600">Jam Sibuk</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Utilisasi per Lapangan</h3>
        <div className="space-y-4">
          {reportData?.field_utilization?.map((field, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{field.field_name}</span>
                <span className="text-sm font-bold">{field.utilization_rate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${field.utilization_rate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{field.total_bookings} booking</span>
                <span>{field.total_hours} jam</span>
              </div>
            </div>
          )) || <p className="text-gray-500">Data tidak tersedia</p>}
        </div>
      </div>
    </div>
  );

  const renderStaffReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {reportData?.total_staff || 0}
            </div>
            <div className="text-sm font-medium text-gray-600">Total Staff</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {reportData?.active_staff || 0}
            </div>
            <div className="text-sm font-medium text-gray-600">Staff Aktif</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {reportData?.average_performance || 0}%
            </div>
            <div className="text-sm font-medium text-gray-600">Rata-rata Performa</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performa Staff</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Diproses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData?.staff_performance?.map((staff, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {staff.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.bookings_processed || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.rating || 'N/A'}/5
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data staff
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner text="Memuat laporan..." />;
    }

    switch (activeReport) {
      case 'booking':
        return renderBookingReport();
      case 'revenue':
        return renderRevenueReport();
      case 'field':
        return renderFieldReport();
      case 'staff':
        return renderStaffReport();
      default:
        return <div className="text-center py-12 text-gray-500">Pilih jenis laporan</div>;
    }
  };

  return (
    <div className="p-6">
      <Notification
        type={notification.type}
        message={notification.message}
        show={notification.show}
        onClose={hideNotification}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Laporan Bisnis</h2>
          <p className="text-gray-600">Analisis mendalam performa bisnis dan operasional</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={exportReport}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Export</span>
          </button>
          <button
            onClick={loadReport}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Periode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {reportTypes.map(report => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeReport === report.id
                ? `bg-${report.color}-600 text-white shadow-lg`
                : `bg-white text-gray-600 hover:bg-${report.color}-50 hover:text-${report.color}-600 border border-gray-200`
            }`}
          >
            <span>{report.icon}</span>
            <span>{report.label}</span>
          </button>
        ))}
      </div>

      {/* Report Content */}
      {renderContent()}
    </div>
  );
};

export default Reports;
