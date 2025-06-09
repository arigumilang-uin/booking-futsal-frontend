import React, { useState, useEffect } from 'react';
import { getPublicFields } from '../../api/fieldAPI';
import { getFavoriteFields, toggleFieldFavorite } from '../../api/customerAPI';
import { MapPin, Clock, Users, Star, Heart, Calendar, Search } from 'lucide-react';

const CustomerFieldsPanel = () => {
  const [fields, setFields] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const [fieldsResponse, favoritesResponse] = await Promise.all([
        getPublicFields(),
        getFavoriteFields().catch(() => ({ success: false, data: [] }))
      ]);

      console.log('Fields response:', fieldsResponse);
      console.log('Favorites response:', favoritesResponse);

      if (fieldsResponse.success) {
        setFields(fieldsResponse.data || []);
        console.log('Fields loaded:', fieldsResponse.data?.length || 0);
      } else {
        setError(`Gagal memuat data lapangan: ${fieldsResponse.error || 'Unknown error'}`);
      }

      if (favoritesResponse.success) {
        // Backend returns: { data: { favorites: [...] } }
        const favoritesArray = favoritesResponse.data?.favorites || [];
        setFavorites(favoritesArray.map(f => f.field_id) || []);
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      setError(`Gagal memuat data lapangan: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (fieldId) => {
    try {
      const response = await toggleFieldFavorite(fieldId);
      if (response.success) {
        setFavorites(prev =>
          prev.includes(fieldId)
            ? prev.filter(id => id !== fieldId)
            : [...prev, fieldId]
        );
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || field.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getFieldTypeLabel = (type) => {
    const types = {
      'soccer': 'Soccer',
      'mini_soccer': 'Mini Soccer',
      'basketball': 'Basket',
      'badminton': 'Badminton'
    };
    return types[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Ketersediaan Lapangan</h2>
            <p className="text-gray-600">Pilih lapangan favorit Anda</p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="bg-gray-800 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari lapangan atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
          >
            <option value="all">Semua Jenis Lapangan</option>
            <option value="soccer">Soccer</option>
            <option value="mini_soccer">Mini Soccer</option>
            <option value="basketball">Basket</option>
            <option value="badminton">Badminton</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-5 h-5 text-red-600 mr-2">❌</div>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat data lapangan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => (
            <div
              key={field.id}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Field Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                {field.image_url ? (
                  <img
                    src={field.image_url}
                    alt={field.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-800 mx-auto mb-2" />
                      <p className="text-gray-900 font-medium">Foto Lapangan</p>
                    </div>
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={() => handleToggleFavorite(field.id)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${favorites.includes(field.id)
                    ? 'bg-red-500 text-gray-900 shadow-lg'
                    : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                >
                  <Heart className={`w-5 h-5 ${favorites.includes(field.id) ? 'fill-current' : ''}`} />
                </button>

                {/* Field Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-gray-800 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                    {getFieldTypeLabel(field.type)}
                  </span>
                </div>
              </div>

              {/* Field Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">{field.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-gray-900 fill-current" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {field.location && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-800" />
                      <span className="text-sm">{field.location}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4 text-gray-800" />
                    <span className="text-sm">Kapasitas: {field.capacity || 22} orang</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-800" />
                    <span className="text-sm">
                      {field.operating_hours?.start || '09:00'} - {field.operating_hours?.end || '24:00'}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatPrice(field.price)}
                      </p>
                      <p className="text-sm text-gray-500">per jam</p>
                    </div>

                    <button className="bg-gradient-to-r from-gray-800 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Booking</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Facilities */}
                {field.facilities && field.facilities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Fasilitas:</p>
                    <div className="flex flex-wrap gap-1">
                      {field.facilities.slice(0, 3).map((facility, index) => (
                        <span
                          key={index}
                          className="bg-gray-50 text-gray-900 px-2 py-1 rounded-md text-xs"
                        >
                          {facility}
                        </span>
                      ))}
                      {field.facilities.length > 3 && (
                        <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-md text-xs">
                          +{field.facilities.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredFields.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Tidak ada lapangan ditemukan</h3>
          <p className="text-gray-600">Coba ubah kata kunci pencarian atau filter</p>
        </div>
      )}
    </div>
  );
};

export default CustomerFieldsPanel;
