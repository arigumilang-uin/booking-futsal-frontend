// src/components/AdvancedPaymentGateway.jsx
import { useState, useEffect } from 'react';
import { 
  processPayment, 
  generatePaymentReceipt, 
  getPaymentMethods,
  validatePaymentData 
} from '../api/paymentAPI';
import useAuth from '../hooks/useAuth';

const AdvancedPaymentGateway = ({ booking, onPaymentSuccess, onPaymentError }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentData, setPaymentData] = useState({
    amount: booking?.total_amount || 0,
    currency: 'IDR',
    description: `Booking lapangan futsal - ${booking?.field_name}`,
    customer_email: user?.email || '',
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    payment_method: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_holder_name: '',
    bank_code: '',
    va_number: '',
    ewallet_phone: ''
  });
  const [errors, setErrors] = useState({});
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data || []);
        if (response.data?.length > 0) {
          setSelectedMethod(response.data[0].code);
          setPaymentData(prev => ({ ...prev, payment_method: response.data[0].code }));
        }
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMethodChange = (methodCode) => {
    setSelectedMethod(methodCode);
    setPaymentData(prev => ({ ...prev, payment_method: methodCode }));
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!paymentData.payment_method) {
      newErrors.payment_method = 'Pilih metode pembayaran';
    }

    if (!paymentData.customer_email) {
      newErrors.customer_email = 'Email diperlukan';
    }

    if (!paymentData.customer_name) {
      newErrors.customer_name = 'Nama diperlukan';
    }

    // Method-specific validation
    const method = paymentMethods.find(m => m.code === selectedMethod);
    if (method) {
      switch (method.type) {
        case 'credit_card':
        case 'debit_card':
          if (!paymentData.card_number) {
            newErrors.card_number = 'Nomor kartu diperlukan';
          } else if (!/^\d{16}$/.test(paymentData.card_number.replace(/\s/g, ''))) {
            newErrors.card_number = 'Nomor kartu tidak valid';
          }

          if (!paymentData.card_expiry) {
            newErrors.card_expiry = 'Tanggal kadaluarsa diperlukan';
          } else if (!/^\d{2}\/\d{2}$/.test(paymentData.card_expiry)) {
            newErrors.card_expiry = 'Format: MM/YY';
          }

          if (!paymentData.card_cvv) {
            newErrors.card_cvv = 'CVV diperlukan';
          } else if (!/^\d{3,4}$/.test(paymentData.card_cvv)) {
            newErrors.card_cvv = 'CVV tidak valid';
          }

          if (!paymentData.card_holder_name) {
            newErrors.card_holder_name = 'Nama pemegang kartu diperlukan';
          }
          break;

        case 'bank_transfer':
          if (!paymentData.bank_code) {
            newErrors.bank_code = 'Pilih bank';
          }
          break;

        case 'virtual_account':
          if (!paymentData.bank_code) {
            newErrors.bank_code = 'Pilih bank untuk VA';
          }
          break;

        case 'ewallet':
          if (!paymentData.ewallet_phone) {
            newErrors.ewallet_phone = 'Nomor telepon e-wallet diperlukan';
          } else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(paymentData.ewallet_phone)) {
            newErrors.ewallet_phone = 'Nomor telepon tidak valid';
          }
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Validate payment data with backend
      const validationResponse = await validatePaymentData({
        ...paymentData,
        booking_id: booking.id
      });

      if (!validationResponse.success) {
        setErrors(validationResponse.errors || {});
        return;
      }

      // Process payment
      const paymentResponse = await processPayment({
        ...paymentData,
        booking_id: booking.id,
        amount: booking.total_amount
      });

      if (paymentResponse.success) {
        // Generate receipt
        const receiptResponse = await generatePaymentReceipt(paymentResponse.data.payment_id);
        if (receiptResponse.success) {
          setReceipt(receiptResponse.data);
          setShowReceipt(true);
        }

        // Call success callback
        if (onPaymentSuccess) {
          onPaymentSuccess(paymentResponse.data);
        }
      } else {
        throw new Error(paymentResponse.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (onPaymentError) {
        onPaymentError(error);
      }
      setErrors({ general: error.message || 'Terjadi kesalahan saat memproses pembayaran' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getMethodIcon = (type) => {
    const icons = {
      credit_card: '💳',
      debit_card: '💳',
      bank_transfer: '🏦',
      virtual_account: '🏧',
      ewallet: '📱',
      qris: '📱'
    };
    return icons[type] || '💰';
  };

  if (showReceipt && receipt) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</h2>
          <p className="text-gray-600">Terima kasih atas pembayaran Anda</p>
        </div>

        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Receipt Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Receipt ID:</span>
              <span className="font-medium">{receipt.receipt_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-medium">{receipt.payment_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{formatCurrency(receipt.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Method:</span>
              <span className="font-medium">{receipt.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date(receipt.created_at).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">{receipt.status}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            🖨️ Print Receipt
          </button>
          <button
            onClick={() => {
              const receiptData = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(receipt, null, 2))}`;
              const link = document.createElement('a');
              link.href = receiptData;
              link.download = `receipt_${receipt.receipt_id}.json`;
              link.click();
            }}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            💾 Download
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">💳 Payment Gateway</h2>

      {/* Payment Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Payment Summary</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-blue-700">Booking:</span>
            <span className="font-medium text-blue-900">{booking?.field_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Date & Time:</span>
            <span className="font-medium text-blue-900">
              {booking?.date} - {booking?.time_slot}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Duration:</span>
            <span className="font-medium text-blue-900">{booking?.duration} hour(s)</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-blue-700">Total Amount:</span>
            <span className="text-blue-900">{formatCurrency(booking?.total_amount || 0)}</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      {/* Payment Methods */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Pilih Metode Pembayaran
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.code}
              onClick={() => handleMethodChange(method.code)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedMethod === method.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getMethodIcon(method.type)}</span>
                <div>
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.payment_method && (
          <p className="text-red-600 text-sm mt-1">{errors.payment_method}</p>
        )}
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={paymentData.customer_email}
            onChange={(e) => handleInputChange('customer_email', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customer_email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.customer_email && (
            <p className="text-red-600 text-sm mt-1">{errors.customer_email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={paymentData.customer_name}
            onChange={(e) => handleInputChange('customer_name', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customer_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.customer_name && (
            <p className="text-red-600 text-sm mt-1">{errors.customer_name}</p>
          )}
        </div>
      </div>

      {/* Method-specific fields will be added in the next part */}
      
      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `💳 Pay ${formatCurrency(booking?.total_amount || 0)}`
        )}
      </button>
    </div>
  );
};

export default AdvancedPaymentGateway;
