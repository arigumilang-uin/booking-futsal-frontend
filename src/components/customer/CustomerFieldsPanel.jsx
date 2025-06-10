import React, { useState, useEffect } from 'react';
import { getPublicFields, checkFieldAvailability } from '../../api/fieldAPI';
import { MapPin, Clock, Users, Calendar, Search, Filter } from 'lucide-react';

const CustomerFieldsPanel = () => {
  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Filter waktu dan ketersediaan
  const [timeFilters, setTimeFilters] = useState({
    date: '',
    startTime: '',
    endTime: '',
    priceRange: ''
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  const priceRanges = [
    { value: '', label: 'Semua Harga' },
    { value: '0-50000', label: 'Di bawah Rp 50.000' },
    { value: '50000-100000', label: 'Rp 50.000 - Rp 100.000' },
    { value: '100000-200000', label: 'Rp 100.000 - Rp 200.000' },
    { value: '200000-999999', label: 'Di atas Rp 200.000' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [fields, searchTerm, filterType, timeFilters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const fieldsResponse = await getPublicFields();

      console.log('Fields response:', fieldsResponse);

      if (fieldsResponse.success) {
        setFields(fieldsResponse.data || []);
        console.log('Fields loaded:', fieldsResponse.data?.length || 0);
      } else {
        setError(`Gagal memuat data lapangan: ${fieldsResponse.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      setError(`Gagal memuat data lapangan: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };



  // Apply all filters including availability check
  const applyFilters = async () => {
    let filtered = [...fields];

    // Filter by search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(field =>
        field.name?.toLowerCase().includes(searchLower) ||
        field.location?.toLowerCase().includes(searchLower) ||
        field.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by field type
    if (filterType !== 'all') {
      filtered = filtered.filter(field => field.type === filterType);
    }

    // Filter by price range
    if (timeFilters.priceRange) {
      const [minPrice, maxPrice] = timeFilters.priceRange.split('-').map(Number);
      filtered = filtered.filter(field => {
        const price = field.price || 0;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Check availability if date and time are selected
    if (timeFilters.date && timeFilters.startTime && timeFilters.endTime) {
      setCheckingAvailability(true);
      try {
        console.log(`🔍 Checking availability for ${filtered.length} fields on ${timeFilters.date} from ${timeFilters.startTime} to ${timeFilters.endTime}`);

        const availabilityPromises = filtered.map(async (field) => {
          try {
            console.log(`🔍 Checking availability for field ${field.id} (${field.name}) on ${timeFilters.date}`);
            const availability = await checkFieldAvailability(field.id, timeFilters.date);
            console.log(`📊 Availability response for field ${field.id}:`, availability);

            if (availability.success && availability.data?.availability) {
              // Check if the requested time slot is available
              const availableSlots = availability.data.availability;

              // Convert time to minutes for easier comparison
              const timeToMinutes = (timeStr) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
              };

              const requestStartMinutes = timeToMinutes(timeFilters.startTime);
              const requestEndMinutes = timeToMinutes(timeFilters.endTime);

              console.log(`⏰ Request time range: ${timeFilters.startTime} (${requestStartMinutes}min) to ${timeFilters.endTime} (${requestEndMinutes}min)`);

              // Check if there are consecutive available slots that can accommodate the requested time range
              const requestDurationMinutes = requestEndMinutes - requestStartMinutes;
              console.log(`📏 Request duration: ${requestDurationMinutes} minutes (${requestDurationMinutes / 60} hours)`);

              // Find consecutive available slots that cover the entire requested time range
              let isAvailable = false;

              // Sort slots by start time
              const sortedSlots = availableSlots
                .filter(slot => slot.available)
                .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

              console.log(`🔍 Available slots for field ${field.id}:`, sortedSlots.map(s => `${s.start_time}-${s.end_time}`));

              if (sortedSlots.length === 0) {
                console.log(`❌ Field ${field.id}: No available slots found`);
                isAvailable = false;
              } else {

                // Check if we can find consecutive slots that cover the request
                for (let i = 0; i < sortedSlots.length; i++) {
                  const startSlot = sortedSlots[i];
                  const startSlotMinutes = timeToMinutes(startSlot.start_time);
                  const startSlotEndMinutes = timeToMinutes(startSlot.end_time);

                  // Check if this slot can be the starting point
                  if (startSlotMinutes <= requestStartMinutes && startSlotEndMinutes > requestStartMinutes) {
                    let currentEndMinutes = startSlotEndMinutes;
                    let canAccommodate = true;

                    // Check if we need more slots to cover the entire duration
                    while (currentEndMinutes < requestEndMinutes) {
                      // Find the next consecutive slot
                      const nextSlot = sortedSlots.find(slot =>
                        timeToMinutes(slot.start_time) === currentEndMinutes
                      );

                      if (!nextSlot) {
                        canAccommodate = false;
                        break;
                      }

                      currentEndMinutes = timeToMinutes(nextSlot.end_time);
                    }

                    if (canAccommodate && currentEndMinutes >= requestEndMinutes) {
                      isAvailable = true;
                      console.log(`✅ Field ${field.id} available: consecutive slots can accommodate ${timeFilters.startTime}-${timeFilters.endTime}`);
                      break;
                    }
                  }
                }
              }

              console.log(`🎯 Field ${field.id} final availability:`, isAvailable);
              return { ...field, isAvailable, availabilityData: availability.data };
            }

            console.log(`❌ Field ${field.id} no availability data`);
            return { ...field, isAvailable: false };
          } catch (error) {
            console.error(`❌ Error checking availability for field ${field.id}:`, error);
            return { ...field, isAvailable: false };
          }
        });

        const fieldsWithAvailability = await Promise.all(availabilityPromises);
        console.log(`📊 Availability check results:`, fieldsWithAvailability.map(f => ({ id: f.id, name: f.name, available: f.isAvailable })));

        // Only show available fields if time filter is applied
        filtered = fieldsWithAvailability.filter(field => field.isAvailable);
        console.log(`✅ Final filtered fields: ${filtered.length} available out of ${fieldsWithAvailability.length} total`);

      } catch (error) {
        console.error('Error checking field availability:', error);
      } finally {
        setCheckingAvailability(false);
      }
    } else {
      console.log(`ℹ️ No time filter applied, showing all ${filtered.length} fields`);
    }

    setFilteredFields(filtered);
  };

  const handleTimeFilterChange = (key, value) => {
    setTimeFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setTimeFilters({
      date: '',
      startTime: '',
      endTime: '',
      priceRange: ''
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

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
      'futsal': 'Futsal'
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
            <p className="text-gray-600">Lihat informasi dan ketersediaan lapangan</p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="bg-gray-800 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Enhanced Search and Filter */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Filter Ketersediaan</h3>
              <p className="text-gray-600">Cari lapangan berdasarkan waktu dan preferensi</p>
            </div>
          </div>

          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
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

          {/* Field Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
          >
            <option value="all">Semua Jenis Lapangan</option>
            <option value="soccer">Soccer</option>
            <option value="mini_soccer">Mini Soccer</option>
            <option value="futsal">Futsal</option>
          </select>

          {/* Price Range */}
          <select
            value={timeFilters.priceRange}
            onChange={(e) => handleTimeFilterChange('priceRange', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
          >
            {priceRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {/* Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={timeFilters.date}
              onChange={(e) => handleTimeFilterChange('date', e.target.value)}
              min={getMinDate()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
            />
          </div>

          {/* Start Time */}
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={timeFilters.startTime}
              onChange={(e) => handleTimeFilterChange('startTime', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
            >
              <option value="">Pilih waktu mulai</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          {/* End Time */}
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={timeFilters.endTime}
              onChange={(e) => handleTimeFilterChange('endTime', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
            >
              <option value="">Pilih waktu selesai</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Info */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {checkingAvailability ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Mengecek ketersediaan...</span>
              </span>
            ) : (
              <span>
                Menampilkan {filteredFields.length} dari {fields.length} lapangan
              </span>
            )}
          </div>

          {timeFilters.date && timeFilters.startTime && timeFilters.endTime && (
            <div className="text-blue-600 font-medium">
              Filter aktif: {timeFilters.date} • {timeFilters.startTime} - {timeFilters.endTime}
            </div>
          )}
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
              {/* Field Type Badge */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {getFieldTypeLabel(field.type)}
                </span>
                {/* Availability Badge */}
                {timeFilters.date && timeFilters.startTime && timeFilters.endTime && field.isAvailable && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium ml-2">
                    ✅ Tersedia
                  </span>
                )}
              </div>

              {/* Field Info */}
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{field.name}</h3>
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
