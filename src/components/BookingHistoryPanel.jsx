// src/components/BookingHistoryPanel.jsx
import { useNavigate } from 'react-router-dom';

const BookingHistoryPanel = ({ bookings = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Booking</h2>
      
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {booking.field_name || `Lapangan ${booking.field_id}`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    📅 {booking.date} • ⏰ {booking.start_time} - {booking.end_time}
                  </p>
                  <p className="text-sm text-gray-600">
                    💰 Rp {booking.total_amount?.toLocaleString() || '0'}
                  </p>
                  {booking.notes && (
                    <p className="text-sm text-gray-500 mt-2">
                      📝 {booking.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    ID: {booking.id}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/customer/bookings')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
            >
              Lihat Semua Riwayat
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📅</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Riwayat Booking</h3>
          <p className="text-gray-600 mb-6">
            Anda belum memiliki riwayat booking. Mulai dengan membuat booking pertama Anda.
          </p>
          <button
            onClick={() => navigate('/customer/booking/new')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition duration-200 font-medium"
          >
            Buat Booking Pertama
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryPanel;
