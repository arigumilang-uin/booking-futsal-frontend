// src/components/kasir/KasirPaymentPanel.jsx
import { useState, useEffect } from 'react';
import {
  getAllPaymentsForKasir,
  confirmPayment,
  getPaymentStatusColor,
  getPaymentMethodLabel
} from '../../api/kasirAPI';
import { formatCurrency } from '../../api/analyticsAPI';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Eye,
  DollarSign
} from 'lucide-react';

const KasirPaymentPanel = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllPaymentsForKasir();
      console.log('💳 Kasir Payment Panel - Raw Response:', response);
      if (response.success) {
        const paymentsData = response.data || [];
        console.log('💳 KASIR PAYMENT DETAILED ANALYSIS:', {
          totalPayments: paymentsData.length,
          paymentStatuses: paymentsData.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
          }, {}),
          paymentMethods: paymentsData.reduce((acc, p) => {
            acc[p.method] = (acc[p.method] || 0) + 1;
            return acc;
          }, {}),
          uniqueStatuses: [...new Set(paymentsData.map(p => p.status))],
          pendingPayments: paymentsData.filter(p => p.status === 'pending').length,
          paidPayments: paymentsData.filter(p => p.status === 'paid').length,
          failedPayments: paymentsData.filter(p => p.status === 'failed').length,
          samplePayment: paymentsData[0],
          allBookingIds: paymentsData.map(p => p.booking_id),
          dateRange: {
            earliest: paymentsData.length > 0 ? Math.min(...paymentsData.map(p => new Date(p.created_at).getTime())) : null,
            latest: paymentsData.length > 0 ? Math.max(...paymentsData.map(p => new Date(p.created_at).getTime())) : null
          }
        });

        // Check if we're missing pending payments
        if (paymentsData.filter(p => p.status === 'pending').length === 0) {
          console.log('⚠️ WARNING: No pending payments found! This might indicate:');
          console.log('   1. All payments are already processed');
          console.log('   2. Backend filtering issue');
          console.log('   3. Database data issue');
        }

        setPayments(paymentsData);
      } else {
        setError('Gagal memuat data pembayaran');
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Terjadi kesalahan saat memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };



  const handleConfirmPayment = async (paymentId) => {
    try {
      const response = await confirmPayment(paymentId, 'Payment confirmed by kasir');
      if (response.success) {
        await loadPayments(); // Reload data
        alert('Pembayaran berhasil dikonfirmasi');
      } else {
        alert('Gagal mengkonfirmasi pembayaran');
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
      alert('Terjadi kesalahan saat mengkonfirmasi pembayaran');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.booking_id?.toString().includes(searchTerm) ||
      payment.booking_number?.toString().includes(searchTerm) ||
      payment.payment_number?.toString().includes(searchTerm) ||
      payment.id?.toString().includes(searchTerm) ||
      payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.field_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900">Pusat Pembayaran Kasir</h2>
          <p className="text-gray-600">Kelola pembayaran dan konfirmasi transfer</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari payment ID, booking ID, nama customer, email, atau lapangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 appearance-none"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <button
            onClick={loadPayments}
            className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lapangan
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{payment.payment_number || payment.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{payment.booking_number || payment.booking_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.user_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{payment.user_email || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.field_name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getPaymentMethodLabel ? getPaymentMethodLabel(payment.method) : payment.method}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor ? getPaymentStatusColor(payment.status) : 'bg-gray-100 text-gray-900'}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmPayment(payment.id)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Konfirmasi Pembayaran"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pembayaran ditemukan</h3>
            <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KasirPaymentPanel;
