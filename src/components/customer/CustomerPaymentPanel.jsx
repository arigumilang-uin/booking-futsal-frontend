// src/components/customer/CustomerPaymentPanel.jsx
import { useState, useEffect } from 'react';
import {
  createPayment,
  getCustomerPayments,
  uploadPaymentProof,
  getPaymentById
} from '../../api/paymentAPI';
import { formatCurrency } from '../../api/analyticsAPI';
import {
  CreditCard,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  DollarSign,
  FileText,
  Camera
} from 'lucide-react';

const CustomerPaymentPanel = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await getCustomerPayments();
      console.log('💳 Customer Payments Response:', response);
      if (response.success) {
        setPayments(response.data || []);
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

  const handleCreatePayment = async (bookingId, paymentData) => {
    try {
      const response = await createPayment(bookingId, paymentData);
      if (response.success) {
        await loadPayments();
        setShowPaymentModal(false);
        alert('Pembayaran berhasil dibuat! Silakan upload bukti pembayaran.');
      } else {
        alert('Gagal membuat pembayaran');
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      alert('Terjadi kesalahan saat membuat pembayaran');
    }
  };

  const handleUploadProof = async (paymentId, file) => {
    try {
      setUploadingProof(true);
      const formData = new FormData();
      formData.append('proof', file);

      const response = await uploadPaymentProof(paymentId, formData);
      if (response.success) {
        await loadPayments();
        setShowProofModal(false);
        alert('Bukti pembayaran berhasil diupload! Menunggu verifikasi kasir.');
      } else {
        alert('Gagal mengupload bukti pembayaran');
      }
    } catch (err) {
      console.error('Error uploading proof:', err);
      alert('Terjadi kesalahan saat mengupload bukti pembayaran');
    } finally {
      setUploadingProof(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'bank_transfer': 'Transfer Bank',
      'credit_card': 'Kartu Kredit',
      'debit_card': 'Kartu Debit',
      'e_wallet': 'E-Wallet',
      'cash': 'Tunai',
      'qris': 'QRIS'
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Memuat data pembayaran...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CreditCard className="w-8 h-8 text-blue-500 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pembayaran Saya</h2>
            <p className="text-gray-600">Kelola pembayaran booking lapangan futsal</p>
          </div>
        </div>
        <button
          onClick={loadPayments}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Total Pembayaran</h3>
              <p className="text-2xl font-bold text-blue-900">{payments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-800">Berhasil</h3>
              <p className="text-2xl font-bold text-green-900">
                {payments.filter(p => p.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
              <p className="text-2xl font-bold text-yellow-900">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-purple-800">Total Nilai</h3>
              <p className="text-lg font-bold text-purple-900">
                {formatCurrency(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Riwayat Pembayaran</h3>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Pembayaran</h3>
            <p className="text-gray-500">Pembayaran Anda akan muncul di sini setelah melakukan booking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lapangan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{payment.payment_number || payment.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      #{payment.booking_number || payment.booking_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.field_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getPaymentMethodLabel(payment.method)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(payment.status)}`}>
                        {getPaymentStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowProofModal(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Upload Bukti Pembayaran"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Proof Upload Modal */}
      {showProofModal && selectedPayment && (
        <PaymentProofModal
          payment={selectedPayment}
          onClose={() => {
            setShowProofModal(false);
            setSelectedPayment(null);
          }}
          onUpload={(file) => handleUploadProof(selectedPayment.id, file)}
          uploading={uploadingProof}
        />
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && !showProofModal && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};

// Payment Proof Upload Modal Component
const PaymentProofModal = ({ payment, onClose, onUpload, uploading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Bukti Pembayaran</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Payment ID: #{payment.payment_number || payment.id}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Jumlah: {formatCurrency(payment.amount)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih File Bukti Pembayaran
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {preview && (
          <div className="mb-4">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment Detail Modal Component
const PaymentDetailModal = ({ payment, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Detail Pembayaran</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment ID</label>
              <p className="text-sm text-gray-900">#{payment.payment_number || payment.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Booking ID</label>
              <p className="text-sm text-gray-900">#{payment.booking_number || payment.booking_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah</label>
              <p className="text-sm text-gray-900 font-semibold">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Metode</label>
              <p className="text-sm text-gray-900">{payment.method}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
              }`}>
              {payment.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal Dibuat</label>
            <p className="text-sm text-gray-900">
              {new Date(payment.created_at).toLocaleString('id-ID')}
            </p>
          </div>

          {payment.paid_at && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Dibayar</label>
              <p className="text-sm text-gray-900">
                {new Date(payment.paid_at).toLocaleString('id-ID')}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentPanel;
