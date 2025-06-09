// src/components/BookingDebugger.jsx
import { useState, useEffect } from 'react';
import { getCustomerBookings, createBooking } from '../api/bookingAPI';
import { getPublicFields } from '../api/fieldAPI';
import useAuth from '../hooks/useAuth';

const BookingDebugger = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      addLog('Loading customer bookings and fields...', 'info');
      
      const [bookingsResponse, fieldsResponse] = await Promise.all([
        getCustomerBookings(),
        getPublicFields()
      ]);

      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data || []);
        addLog(`Loaded ${bookingsResponse.data?.length || 0} existing bookings`, 'success');
      } else {
        addLog('Failed to load bookings: ' + bookingsResponse.error, 'error');
      }

      if (fieldsResponse.success) {
        setFields(fieldsResponse.data || []);
        addLog(`Loaded ${fieldsResponse.data?.length || 0} fields`, 'success');
      } else {
        addLog('Failed to load fields: ' + fieldsResponse.error, 'error');
      }
    } catch (error) {
      addLog('Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const createTestBooking = async () => {
    if (fields.length === 0) {
      addLog('No fields available for booking', 'error');
      return;
    }

    try {
      setCreating(true);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const testBooking = {
        field_id: fields[0].id,
        date: dateStr,
        start_time: '10:00',
        end_time: '11:00',
        name: user?.name || 'Test Customer',
        phone: user?.phone || '081234567890',
        email: user?.email || 'test@example.com',
        notes: `Test booking #${bookings.length + 1} - ${new Date().toLocaleString()}`
      };

      addLog(`Creating test booking #${bookings.length + 1}...`, 'info');
      addLog(`Booking data: ${JSON.stringify(testBooking, null, 2)}`, 'info');

      const response = await createBooking(testBooking);

      if (response.success) {
        addLog(`✅ Booking #${bookings.length + 1} created successfully!`, 'success');
        addLog(`Response: ${JSON.stringify(response.data, null, 2)}`, 'success');
        
        // Reload bookings to see the new one
        await loadData();
      } else {
        addLog(`❌ Failed to create booking: ${response.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error creating booking: ${error.message}`, 'error');
      console.error('Booking creation error:', error);
    } finally {
      setCreating(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🔧 Booking System Debugger</h2>
        <p className="text-gray-600">Test multiple booking creation for customer: {user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">Current Bookings</h3>
          <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900">Available Fields</h3>
          <p className="text-2xl font-bold text-green-600">{fields.length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900">Test Status</h3>
          <p className="text-2xl font-bold text-purple-600">
            {creating ? 'Creating...' : 'Ready'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={createTestBooking}
          disabled={creating || loading || fields.length === 0}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating Booking...' : `Create Test Booking #${bookings.length + 1}`}
        </button>
        <button
          onClick={loadData}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
        <button
          onClick={clearLogs}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Clear Logs
        </button>
      </div>

      {/* Current Bookings */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Bookings ({bookings.length})</h3>
        <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
          {bookings.length > 0 ? (
            <div className="space-y-2">
              {bookings.map((booking, index) => (
                <div key={booking.id} className="text-sm">
                  <span className="font-medium">#{index + 1}</span> - 
                  Field: {booking.field_name} | 
                  Date: {booking.date} | 
                  Time: {booking.time_slot} | 
                  Status: <span className={`font-medium ${
                    booking.status === 'confirmed' ? 'text-green-600' : 
                    booking.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{booking.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No bookings found</p>
          )}
        </div>
      </div>

      {/* Debug Logs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Debug Logs ({logs.length})</h3>
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className={`mb-1 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'success' ? 'text-green-400' : 'text-blue-400'
              }`}>
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No logs yet...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDebugger;
