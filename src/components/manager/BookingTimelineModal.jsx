// BookingTimelineModal.jsx - Modal untuk menampilkan timeline booking history
import React, { useState, useEffect } from 'react';
import { getBookingTimeline } from '../../api/bookingAPI';

const BookingTimelineModal = ({ isOpen, onClose, bookingId, bookingNumber }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      loadTimeline();
    }
  }, [isOpen, bookingId]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const response = await getBookingTimeline(bookingId);
      if (response.success) {
        setTimeline(response.data || []);
      }
    } catch (error) {
      console.error('Error loading booking timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (eventType, statusTo) => {
    if (eventType === 'payment') {
      return '💳';
    }
    
    switch (statusTo) {
      case 'confirmed': return '✅';
      case 'completed': return '🏁';
      case 'cancelled': return '❌';
      default: return '📝';
    }
  };

  const getEventColor = (eventType, statusTo) => {
    if (eventType === 'payment') {
      return 'bg-blue-50 border-blue-200';
    }
    
    switch (statusTo) {
      case 'confirmed': return 'bg-green-50 border-green-200';
      case 'completed': return 'bg-purple-50 border-purple-200';
      case 'cancelled': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">Timeline Booking</h3>
              <p className="text-blue-100 text-sm">{bookingNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Memuat timeline...</span>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p>Belum ada aktivitas pada booking ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${getEventColor(event.event_type, event.status_to)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{getEventIcon(event.event_type, event.status_to)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {event.event_type === 'payment' ? 'Payment' : 'Status Change'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {event.event_type === 'payment' 
                              ? `${event.reason} - Rp ${parseInt(event.notes || 0).toLocaleString('id-ID')}`
                              : `${event.status_from || 'pending'} → ${event.status_to}`
                            }
                          </p>
                          {event.reason && event.event_type !== 'payment' && (
                            <p className="text-xs text-gray-500 mt-1">
                              Alasan: {event.reason}
                            </p>
                          )}
                          {event.notes && event.event_type !== 'payment' && (
                            <p className="text-xs text-gray-500 mt-1">
                              Catatan: {event.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatDate(event.created_at)}</p>
                          <p className="text-xs font-medium text-gray-700">{event.actor_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTimelineModal;
