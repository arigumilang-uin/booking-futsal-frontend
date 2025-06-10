import React, { useState, useEffect } from 'react';
import { getPublicFields, checkFieldAvailability } from '../../api/fieldAPI';
import { Calendar, Clock, MapPin, Search, Filter } from 'lucide-react';

/**
 * Komponen untuk filter ketersediaan lapangan berdasarkan tanggal dan waktu
 */
const FieldAvailabilityFilter = ({ onFieldSelect }) => {
  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const [filters, setFilters] = useState({
    date: '',
    startTime: '',
    endTime: '',
    fieldType: '',
    priceRange: '',
    search: ''
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  const fieldTypes = [
    { value: '', label: 'Semua Jenis' },
    { value: 'futsal', label: 'Futsal' },
    { value: 'soccer', label: 'Soccer' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'badminton', label: 'Badminton' }
  ];

  const priceRanges = [
    { value: '', label: 'Semua Harga' },
    { value: '0-50000', label: 'Di bawah Rp 50.000' },
    { value: '50000-100000', label: 'Rp 50.000 - Rp 100.000' },
    { value: '100000-200000', label: 'Rp 100.000 - Rp 200.000' },
    { value: '200000-999999', label: 'Di atas Rp 200.000' }
  ];

  // Load all fields
  useEffect(() => {
    loadFields();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [fields, filters]);

  const loadFields = async () => {
    try {
      setLoading(true);
      const response = await getPublicFields();
      if (response.success) {
        setFields(response.data || []);
      }
    } catch (error) {
      console.error('Error loading fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = [...fields];

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(field =>
        field.name?.toLowerCase().includes(searchLower) ||
        field.location?.toLowerCase().includes(searchLower) ||
        field.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by field type
    if (filters.fieldType) {
      filtered = filtered.filter(field => field.type === filters.fieldType);
    }

    // Filter by price range
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(field => {
        const price = field.price_per_hour || 0;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Check availability if date and time are selected
    if (filters.date && filters.startTime && filters.endTime) {
      setCheckingAvailability(true);
      try {
        const availabilityPromises = filtered.map(async (field) => {
          try {
            const availability = await checkFieldAvailability(field.id, filters.date);
            
            if (availability.success && availability.data?.availability) {
              // Check if the requested time slot is available
              const isAvailable = availability.data.availability.some(slot => {
                const slotStart = slot.start_time;
                const slotEnd = slot.end_time;
                return slot.available && 
                       slotStart <= filters.startTime && 
                       slotEnd >= filters.endTime;
              });
              
              return { ...field, isAvailable, availabilityData: availability.data };
            }
            
            return { ...field, isAvailable: false };
          } catch (error) {
            console.error(`Error checking availability for field ${field.id}:`, error);
            return { ...field, isAvailable: false };
          }
        });

        const fieldsWithAvailability = await Promise.all(availabilityPromises);
        
        // Only show available fields if time filter is applied
        filtered = fieldsWithAvailability.filter(field => field.isAvailable);
        
      } catch (error) {
        console.error('Error checking field availability:', error);
      } finally {
        setCheckingAvailability(false);
      }
    }

    setFilteredFields(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      startTime: '',
      endTime: '',
      fieldType: '',
      priceRange: '',
      search: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat data lapangan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
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
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Lapangan
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Nama lapangan, lokasi..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                min={getMinDate()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Mulai
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.startTime}
                onChange={(e) => handleFilterChange('startTime', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih waktu mulai</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Selesai
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.endTime}
                onChange={(e) => handleFilterChange('endTime', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih waktu selesai</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Field Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Lapangan
            </label>
            <select
              value={filters.fieldType}
              onChange={(e) => handleFilterChange('fieldType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fieldTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rentang Harga
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
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
          
          {filters.date && filters.startTime && filters.endTime && (
            <div className="text-blue-600 font-medium">
              Filter aktif: {filters.date} • {filters.startTime} - {filters.endTime}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
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
                  <MapPin className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Availability Badge */}
              {filters.date && filters.startTime && filters.endTime && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ✅ Tersedia
                  </span>
                </div>
              )}
            </div>

            {/* Field Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{field.name}</h3>
                  <p className="text-gray-600 text-sm">{field.location}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium">
                  {field.type?.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Harga per jam:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(field.price_per_hour)}</span>
                </div>
                
                {field.price_weekend && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Weekend:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(field.price_weekend)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onFieldSelect && onFieldSelect(field)}
                className="w-full bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-900 transition-colors font-medium"
              >
                Pilih Lapangan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredFields.length === 0 && !checkingAvailability && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Lapangan Tersedia</h3>
          <p className="text-gray-600 mb-4">
            Coba ubah filter atau pilih waktu yang berbeda
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default FieldAvailabilityFilter;
