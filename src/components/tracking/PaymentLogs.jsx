import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, AlertCircle, CheckCircle, XCircle, Database } from 'lucide-react';
import { trackingApi } from '../../services/trackingApi';

const PaymentLogs = ({ paymentId, isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchPaymentLogs();
    }
  }, [isOpen, paymentId]);

  const fetchPaymentLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await trackingApi.getPaymentLogs(paymentId);
      if (response.success) {
        setLogs(response.data || []);
      } else {
        setError('Gagal memuat log payment');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat log payment');
      console.error('Payment logs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'created':
      case 'payment_created':
        return <CreditCard className="w-5 h-5 text-gray-900" />;
      case 'processed':
      case 'payment_processed':
        return <CheckCircle className="w-5 h-5 text-gray-900" />;
      case 'failed':
      case 'payment_failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'created':
      case 'payment_created':
        return 'border-gray-200 bg-blue-50';
      case 'processed':
      case 'payment_processed':
        return 'border-gray-200 bg-gray-50';
      case 'failed':
      case 'payment_failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatAction = (action) => {
    const actionMap = {
      'created': 'Payment Dibuat',
      'payment_created': 'Payment Dibuat',
      'processed': 'Payment Diproses',
      'payment_processed': 'Payment Diproses',
      'failed': 'Payment Gagal',
      'payment_failed': 'Payment Gagal',
      'updated': 'Payment Diperbarui',
      'cancelled': 'Payment Dibatalkan'
    };
    return actionMap[action?.toLowerCase()] || action || 'Unknown Action';
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const formatJsonData = (jsonData) => {
    if (!jsonData) return null;
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonData.toString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-800 text-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6" />
              <h2 className="text-xl font-bold">Log Payment</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-900 hover:text-gray-200 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-100 mt-2">Riwayat aktivitas payment #{paymentId}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
              <span className="ml-3 text-gray-600">Memuat log payment...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Belum ada log untuk payment ini</p>
            </div>
          )}

          {!loading && !error && logs.length > 0 && (
            <div className="space-y-4">
              {logs.map((log, index) => {
                const { date, time } = formatDateTime(log.created_at);
                return (
                  <div
                    key={`${log.id}-${index}`}
                    className={`rounded-xl border-2 p-4 ${getActionColor(log.action)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {formatAction(log.action)}
                          </h4>
                          {log.status_code && (
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm text-gray-600">Status Code:</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${log.status_code >= 200 && log.status_code < 300
                                ? 'bg-gray-100 text-gray-900'
                                : log.status_code >= 400
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-900'
                                }`}>
                                {log.status_code}
                              </span>
                            </div>
                          )}
                          {log.error_message && (
                            <div className="bg-red-100 border border-red-200 rounded-lg p-2 mb-2">
                              <span className="text-sm text-red-800 font-medium">Error:</span>
                              <p className="text-sm text-red-700 mt-1">{log.error_message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="font-medium">{time}</div>
                        <div>{date}</div>
                      </div>
                    </div>

                    {/* Request Data */}
                    {log.request_data && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Request Data:</h5>
                        <div className="bg-gray-100 rounded-lg p-3 overflow-x-auto">
                          <pre className="text-xs text-gray-900 whitespace-pre-wrap">
                            {formatJsonData(log.request_data)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Response Data */}
                    {log.response_data && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Response Data:</h5>
                        <div className="bg-gray-100 rounded-lg p-3 overflow-x-auto">
                          <pre className="text-xs text-gray-900 whitespace-pre-wrap">
                            {formatJsonData(log.response_data)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {logs.length} log ditemukan
            </span>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-gray-900 px-4 py-2 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentLogs;
