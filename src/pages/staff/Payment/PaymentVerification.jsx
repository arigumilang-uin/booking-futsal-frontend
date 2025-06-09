// src/pages/staff/Payment/PaymentVerification.jsx
import { useState, useEffect } from 'react';
import { getAllPayments, verifyPayment, rejectPayment } from '../../../api/paymentAPI';
import { getStatusColor, formatDate, formatCurrency } from '../../../utils/testHelpers';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Notification from '../../../components/Notification';
import useAuth from '../../../hooks/useAuth';

const PaymentVerification = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'pending',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const statusOptions = [
    { value: 'semua', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu Verifikasi' },
    { value: 'verified', label: 'Terverifikasi' },
    { value: 'rejected', label: 'Ditolak' }
  ];

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await getAllPayments();
      if (response.success) {
        setPayments(response.data || []);
      } else {
        showNotification('error', 'Gagal memuat data pembayaran');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      showNotification('error', 'Terjadi kesalahan saat memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Filter by status
    if (filters.status !== 'semua') {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.customer_name?.toLowerCase().includes(searchLower) ||
        payment.booking_code?.toLowerCase().includes(searchLower) ||
        payment.payment_method?.toLowerCase().includes(searchLower) ||
        payment.id?.toString().includes(searchLower)
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(payment => 
        new Date(payment.created_at) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(payment => 
        new Date(payment.created_at) <= new Date(filters.dateTo)
      );
    }

    setFilteredPayments(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleVerifyPayment = async (paymentId) => {
    if (!window.confirm('Apakah Anda yakin ingin memverifikasi pembayaran ini?')) {
      return;
    }

    try {
      setProcessing(paymentId);
      const response = await verifyPayment(paymentId);
      
      if (response.success) {
        showNotification('success', 'Pembayaran berhasil diverifikasi');
        loadPayments();
      } else {
        showNotification('error', response.error || 'Gagal memverifikasi pembayaran');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      showNotification('error', 'Terjadi kesalahan saat memverifikasi pembayaran');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectPayment = async (paymentId, reason) => {
    try {
      setProcessing(paymentId);
      const response = await rejectPayment(paymentId, reason);
      
      if (response.success) {
        showNotification('success', 'Pembayaran berhasil ditolak');
        loadPayments();
        setRejectReason('');
      } else {
        showNotification('error', response.error || 'Gagal menolak pembayaran');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      showNotification('error', 'Terjadi kesalahan saat menolak pembayaran');
    } finally {
      setProcessing(null);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  const openDetailModal = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedPayment(null);
    setShowDetailModal(false);
    setRejectReason('');
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const canVerifyPayment = () => {
    // Only kasir, manager, and supervisor can verify payments
    return ['staff_kasir', 'manajer_futsal', 'supervisor_sistem'].includes(user?.role);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'bank_transfer':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
        );
      case 'e_wallet':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        );
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat data pembayaran..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Notification
        type={notification.type}
        message={notification.message}
        show={notification.show}
        onClose={hideNotification}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Verifikasi Pembayaran</h1>
        <p className="text-gray-600 mt-1">Kelola dan verifikasi pembayaran dari customer</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Menunggu Verifikasi</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredPayments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terverifikasi</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredPayments.filter(p => p.status === 'verified').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ditolak</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredPayments.filter(p => p.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Nilai</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter & Pencarian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Pembayaran
            </label>
            <input
              type="text"
              placeholder="Nama customer, kode booking..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({ status: 'pending', search: '', dateFrom: '', dateTo: '' })}
            className="text-gray-900 hover:text-gray-900 text-sm font-medium"
          >
            Bersihkan Filter
          </button>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-lg shadow">
        {filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pembayaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{payment.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.created_at ? formatDate(payment.created_at) : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.customer_name || 'Customer'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.customer_email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{payment.booking_code || payment.booking_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.field_name || 'Lapangan'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-gray-500 mr-2">
                          {getPaymentMethodIcon(payment.payment_method)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.payment_method === 'bank_transfer' ? 'Transfer Bank' :
                           payment.payment_method === 'e_wallet' ? 'E-Wallet' : 'Cash'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetailModal(payment)}
                        className="text-gray-900 hover:text-gray-900"
                      >
                        Detail
                      </button>
                      {canVerifyPayment() && payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerifyPayment(payment.id)}
                            disabled={processing === payment.id}
                            className="text-gray-900 hover:text-gray-900 disabled:opacity-50"
                          >
                            {processing === payment.id ? 'Proses...' : 'Verifikasi'}
                          </button>
                          <button
                            onClick={() => openDetailModal(payment)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Pembayaran</h3>
            <p className="text-gray-500">
              {filters.status !== 'semua' || filters.search || filters.dateFrom || filters.dateTo
                ? 'Tidak ada pembayaran yang sesuai dengan filter yang dipilih.'
                : 'Belum ada pembayaran yang perlu diverifikasi.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Detail Pembayaran</h2>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Pembayaran</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Pembayaran:</span>
                      <span className="font-medium">#{selectedPayment.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                        {getStatusLabel(selectedPayment.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metode:</span>
                      <span className="font-medium">
                        {selectedPayment.payment_method === 'bank_transfer' ? 'Transfer Bank' :
                         selectedPayment.payment_method === 'e_wallet' ? 'E-Wallet' : 'Cash'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(selectedPayment.amount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span className="font-medium">
                        {selectedPayment.created_at ? formatDate(selectedPayment.created_at) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Booking</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kode Booking:</span>
                      <span className="font-medium">#{selectedPayment.booking_code || selectedPayment.booking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{selectedPayment.customer_name || 'Customer'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lapangan:</span>
                      <span className="font-medium">{selectedPayment.field_name || 'Lapangan'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {selectedPayment.payment_proof && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bukti Pembayaran</h3>
                  <div className="border rounded-lg p-4">
                    <img
                      src={selectedPayment.payment_proof}
                      alt="Bukti Pembayaran"
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Reject Reason Input */}
              {canVerifyPayment() && selectedPayment.status === 'pending' && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tolak Pembayaran</h3>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Masukkan alasan penolakan..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={closeDetailModal}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Tutup
              </button>
              {canVerifyPayment() && selectedPayment.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleVerifyPayment(selectedPayment.id);
                      closeDetailModal();
                    }}
                    disabled={processing === selectedPayment.id}
                    className="px-6 py-2 bg-gray-800 text-gray-900 rounded-md hover:bg-gray-500 transition duration-200 disabled:opacity-50"
                  >
                    Verifikasi
                  </button>
                  <button
                    onClick={() => {
                      if (rejectReason.trim()) {
                        handleRejectPayment(selectedPayment.id, rejectReason);
                        closeDetailModal();
                      } else {
                        showNotification('error', 'Masukkan alasan penolakan');
                      }
                    }}
                    disabled={processing === selectedPayment.id || !rejectReason.trim()}
                    className="px-6 py-2 bg-red-600 text-gray-900 rounded-md hover:bg-red-700 transition duration-200 disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
