// src/components/FavoriteFields.jsx
import { useState, useEffect } from 'react';
import { 
  getFavoriteFields, 
  toggleFavorite, 
  getFavoritesWithAvailability,
  checkFieldAvailability 
} from '../api';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const FavoriteFields = ({ showAvailability = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    }
  }, [user?.id, selectedDate, showAvailability]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      let response;
      
      if (showAvailability) {
        response = await getFavoritesWithAvailability(selectedDate);
      } else {
        response = await getFavoriteFields();
      }

      if (response.success) {
        setFavorites(response.data?.favorites || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (fieldId) => {
    try {
      await toggleFavorite(fieldId);
      // Remove from favorites list
      setFavorites(prev => prev.filter(fav => fav.field_id !== fieldId));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleQuickBooking = (fieldId) => {
    navigate(`/bookings/new?field=${fieldId}&date=${selectedDate}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAvailabilityStatus = (availability) => {
    if (!availability) return null;
    
    const availableSlots = availability.filter(slot => slot.available).length;
    const totalSlots = availability.length;
    
    if (availableSlots === 0) {
      return { text: 'Penuh', color: 'text-red-600 bg-red-100' };
    } else if (availableSlots <= totalSlots * 0.3) {
      return { text: `${availableSlots} slot tersisa`, color: 'text-orange-600 bg-orange-100' };
    } else {
      return { text: `${availableSlots} slot tersedia`, color: 'text-gray-900 bg-gray-100' };
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-2 text-gray-600">Memuat lapangan favorit...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Lapangan Favorit</h3>
        <p className="text-gray-600 mb-4">
          Tambahkan lapangan ke favorit untuk akses cepat dan rekomendasi yang lebih baik.
        </p>
        <button
          onClick={() => navigate('/fields')}
          className="bg-gray-800 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-500"
        >
          Jelajahi Lapangan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Lapangan Favorit ({favorites.length})
        </h2>
        
        {showAvailability && (
          <div className="flex items-center space-x-2">
            <label htmlFor="date" className="text-sm text-gray-600">
              Tanggal:
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            />
          </div>
        )}
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Field Image */}
            <div className="relative">
              <img
                src={favorite.field_image_url || '/placeholder-field.jpg'}
                alt={favorite.field_name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              
              {/* Favorite Button */}
              <button
                onClick={() => handleToggleFavorite(favorite.field_id)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                title="Hapus dari favorit"
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              {/* Availability Status */}
              {showAvailability && favorite.availability && (
                <div className="absolute bottom-2 left-2">
                  {(() => {
                    const status = getAvailabilityStatus(favorite.availability);
                    return status ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Field Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                {favorite.field_name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-2">
                {favorite.field_location}
              </p>

              {/* Rating */}
              {favorite.field_rating && (
                <div className="flex items-center mb-2">
                  <div className="flex text-gray-900">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(favorite.field_rating) ? 'fill-current' : 'text-gray-300'
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600">
                    {favorite.field_rating.toFixed(1)} ({favorite.field_total_reviews} ulasan)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-3">
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(favorite.field_price)}
                </span>
                <span className="text-sm text-gray-600">/jam</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleQuickBooking(favorite.field_id)}
                  className="flex-1 bg-gray-800 text-gray-900 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors"
                >
                  Booking Cepat
                </button>
                
                <button
                  onClick={() => navigate(`/fields/${favorite.field_id}`)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteFields;
