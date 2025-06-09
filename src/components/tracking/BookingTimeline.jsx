import React, { useState, useEffect } from 'react';
import { Clock, User, CreditCard, CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';
import { trackingApi } from '../../services/trackingApi';

const BookingTimeline = ({ bookingId, isOpen, onClose }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchTimeline();
    }
  }, [isOpen, bookingId]);

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await trackingApi.getBookingTimeline(bookingId);
      if (response.success) {
        setTimeline(response.data || []);
      } else {
        setError('Gagal memuat timeline booking');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat timeline');
      console.error('Timeline fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType, action) => {
    switch (eventType) {
      case 'payment':
        return <CreditCard className="w-5 h-5 text-gray-900" />;
      case 'status_change':
        if (action?.includes('CONFIRMED')) return <CheckCircle className="w-5 h-5 text-gray-900" />;
        if (action?.includes('CANCELLED')) return <XCircle className="w-5 h-5 text-red-600" />;
        if (action?.includes('COMPLETED')) return <CheckCircle className="w-5 h-5 text-gray-900" />;
        return <Activity className="w-5 h-5 text-gray-900" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEventColor = (eventType, action) => {
    switch (eventType) {
      case 'payment':
        return 'border-gray-200 bg-gray-50';
      case 'status_change':
        if (action?.includes('CONFIRMED')) return 'border-gray-200 bg-blue-50';
        if (action?.includes('CANCELLED')) return 'border-red-200 bg-red-50';
        if (action?.includes('COMPLETED')) return 'border-gray-200 bg-gray-50';
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatEventTitle = (eventType, action, statusFrom, statusTo) => {
    if (eventType === 'payment') {
      return 'Pembayaran Dibuat';
    }
    if (eventType === 'status_change') {
      return `Status: ${statusFrom} → ${statusTo}`;
    }
    return action || 'Event';
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
        minute: '2-digit'
      })
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-800 text-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6" />
              <h2 className="text-xl font-bold">Timeline Booking</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-900 hover:text-gray-200 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-100 mt-2">Riwayat lengkap aktivitas booking #{bookingId}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
              <span className="ml-3 text-gray-600">Memuat timeline...</span>
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

          {!loading && !error && timeline.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Belum ada aktivitas pada booking ini</p>
            </div>
          )}

          {!loading && !error && timeline.length > 0 && (
            <div className="space-y-4">
              {timeline.map((event, index) => {
                const { date, time } = formatDateTime(event.created_at);
                return (
                  <div
                    key={`${event.event_type}-${event.event_id}-${index}`}
                    className={`border-l-4 pl-4 pb-4 ${index === timeline.length - 1 ? '' : 'border-l-gray-200'
                      }`}
                  >
                    <div className={`rounded-xl border-2 p-4 ${getEventColor(event.event_type, event.action)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getEventIcon(event.event_type, event.action)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {formatEventTitle(event.event_type, event.action, event.status_from, event.status_to)}
                            </h4>
                            {event.notes && (
                              <p className="text-gray-700 text-sm mb-2">{event.notes}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                <span>{event.actor_name || 'System'}</span>
                                {event.actor_role && (
                                  <span className="ml-1 text-xs bg-gray-200 px-2 py-1 rounded">
                                    {event.actor_role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div className="font-medium">{time}</div>
                          <div>{date}</div>
                        </div>
                      </div>
                    </div>
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
              {timeline.length} aktivitas ditemukan
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

export default BookingTimeline;
