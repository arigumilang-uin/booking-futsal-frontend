// src/components/operator/OperatorFieldPanel.jsx
import { useState, useEffect } from 'react';
import {
  getAssignedFields,
  updateFieldStatus,
  getFieldBookings,
  getFieldStatusColor
} from '../../api/operatorAPI';

const OperatorFieldPanel = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState(null);
  const [fieldBookings, setFieldBookings] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      const response = await getAssignedFields();
      if (response.success) {
        setFields(response.data);
      }
    } catch (error) {
      console.error('Error loading fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFieldBookings = async (fieldId) => {
    try {
      const response = await getFieldBookings(fieldId);
      if (response.success) {
        setFieldBookings(response.data);
      }
    } catch (error) {
      console.error('Error loading field bookings:', error);
    }
  };

  const handleFieldSelect = (field) => {
    setSelectedField(field);
    loadFieldBookings(field.id);
  };

  const handleStatusUpdate = async (fieldId, newStatus, notes) => {
    try {
      setUpdating(true);
      const response = await updateFieldStatus(fieldId, { status: newStatus, notes });
      if (response.success) {
        await loadFields();
        alert('Status lapangan berhasil diperbarui');
      } else {
        alert('Gagal memperbarui status: ' + response.error);
      }
    } catch (error) {
      console.error('Error updating field status:', error);
      alert('Terjadi kesalahan saat memperbarui status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat data lapangan...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-2xl text-gray-900">🏟️</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manajemen Lapangan</h2>
          <p className="text-gray-600">Kelola lapangan yang ditugaskan kepada Anda</p>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Lapangan Ditugaskan</h3>
          <p className="text-gray-500">Anda belum ditugaskan untuk mengelola lapangan manapun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fields List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Lapangan Ditugaskan ({fields.length})</h3>
            {fields.map((field) => (
              <div
                key={field.id}
                className={`bg-white rounded-2xl shadow-lg border p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${selectedField?.id === field.id ? 'ring-2 ring-gray-800 border-gray-200' : 'border-gray-200'
                  }`}
                onClick={() => handleFieldSelect(field)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🏟️</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{field.name}</h4>
                      <p className="text-sm text-gray-600">{field.type || 'Soccer'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFieldStatusColor(field.status)}`}>
                    {field.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Harga:</span>
                    <p className="font-medium">Rp {field.price?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Kapasitas:</span>
                    <p className="font-medium">{field.capacity || 22} orang</p>
                  </div>
                </div>

                {field.description && (
                  <p className="text-sm text-gray-600 mt-3">{field.description}</p>
                )}

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(field.id, 'active', 'Lapangan siap digunakan');
                    }}
                    disabled={updating || field.status === 'active'}
                    className="flex-1 bg-gray-800 text-gray-900 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Aktifkan
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(field.id, 'maintenance', 'Lapangan dalam maintenance');
                    }}
                    disabled={updating || field.status === 'maintenance'}
                    className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Maintenance
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(field.id, 'inactive', 'Lapangan tidak aktif');
                    }}
                    disabled={updating || field.status === 'inactive'}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Nonaktifkan
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Field Details */}
          <div>
            {selectedField ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Detail Lapangan</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedField.name}</h4>
                    <p className="text-sm text-gray-600">{selectedField.description || 'Tidak ada deskripsi'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium">{selectedField.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Rating:</span>
                      <p className="font-medium">{selectedField.rating || 0}/5</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Booking Hari Ini</h5>
                    {fieldBookings.length > 0 ? (
                      <div className="space-y-2">
                        {fieldBookings.slice(0, 5).map((booking) => (
                          <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{booking.customer_name}</p>
                              <p className="text-xs text-gray-600">{booking.time_slot}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-gray-100 text-gray-900' :
                              booking.status === 'pending' ? 'bg-gray-100 text-gray-900' :
                                'bg-gray-100 text-gray-900'
                              }`}>
                              {booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Tidak ada booking hari ini</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏟️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pilih Lapangan</h3>
                <p className="text-gray-600">Klik pada lapangan di sebelah kiri untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorFieldPanel;
