// src/components/PromotionList.jsx
import { useState, useEffect } from 'react';
import { 
  getAvailablePromotions, 
  validatePromotion, 
  getPromotionDetail,
  formatPromotionPeriod,
  getPromotionStatusText,
  isPromotionValid,
  calculateDiscount
} from '../api';

const PromotionList = ({ onSelectPromotion, selectedPromotion, bookingData = null }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validatingPromotion, setValidatingPromotion] = useState(null);
  const [expandedPromotion, setExpandedPromotion] = useState(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await getAvailablePromotions();
      if (response.success) {
        setPromotions(response.data?.promotions || []);
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPromotion = async (promotion) => {
    if (!bookingData) {
      onSelectPromotion?.(promotion);
      return;
    }

    try {
      setValidatingPromotion(promotion.id);
      
      const validationResponse = await validatePromotion({
        promotion_code: promotion.code,
        ...bookingData
      });

      if (validationResponse.success) {
        onSelectPromotion?.(promotion, validationResponse.data);
      } else {
        alert(validationResponse.message || 'Promosi tidak dapat digunakan');
      }
    } catch (error) {
      console.error('Error validating promotion:', error);
      alert('Gagal memvalidasi promosi');
    } finally {
      setValidatingPromotion(null);
    }
  };

  const handleToggleDetails = async (promotionId) => {
    if (expandedPromotion === promotionId) {
      setExpandedPromotion(null);
      return;
    }

    try {
      const response = await getPromotionDetail(promotionId);
      if (response.success) {
        setExpandedPromotion(promotionId);
      }
    } catch (error) {
      console.error('Error loading promotion detail:', error);
    }
  };

  const formatDiscountText = (promotion) => {
    switch (promotion.discount_type) {
      case 'percentage':
        return `${promotion.discount_value}% OFF`;
      case 'fixed':
        return `Diskon ${formatCurrency(promotion.discount_value)}`;
      case 'buy_x_get_y':
        return `Beli ${promotion.buy_quantity} Gratis ${promotion.get_quantity}`;
      default:
        return 'Diskon Spesial';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPromotionTypeIcon = (type) => {
    switch (type) {
      case 'percentage':
        return '🎯';
      case 'fixed':
        return '💰';
      case 'buy_x_get_y':
        return '🎁';
      default:
        return '🎉';
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-2 text-gray-600">Memuat promosi...</p>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Promosi Tersedia</h3>
        <p className="text-gray-600">
          Saat ini tidak ada promosi yang tersedia. Periksa kembali nanti untuk penawaran menarik!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Promosi Tersedia ({promotions.length})
      </h2>

      <div className="space-y-3">
        {promotions.map((promotion) => {
          const isSelected = selectedPromotion?.id === promotion.id;
          const isValidating = validatingPromotion === promotion.id;
          const isExpanded = expandedPromotion === promotion.id;
          const statusText = getPromotionStatusText(promotion);
          const isValid = isPromotionValid(promotion);

          return (
            <div
              key={promotion.id}
              className={`border rounded-lg p-4 transition-all ${
                isSelected
                  ? 'border-gray-800 bg-blue-50'
                  : isValid
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Promotion Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">
                      {getPromotionTypeIcon(promotion.discount_type)}
                    </span>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {promotion.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-gray-900">
                          {formatDiscountText(promotion)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isValid 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {statusText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Promotion Description */}
                  <p className="text-gray-600 text-sm mb-3">
                    {promotion.description}
                  </p>

                  {/* Promotion Details */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                    <span>📅 {formatPromotionPeriod(promotion.start_date, promotion.end_date)}</span>
                    
                    {promotion.min_order && (
                      <span>💳 Min. pembelian {formatCurrency(promotion.min_order)}</span>
                    )}
                    
                    {promotion.max_discount && (
                      <span>🎯 Maks. diskon {formatCurrency(promotion.max_discount)}</span>
                    )}
                    
                    {promotion.usage_limit && (
                      <span>
                        👥 Tersisa {promotion.usage_limit - promotion.used_count} dari {promotion.usage_limit}
                      </span>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                      <h4 className="font-medium text-gray-900 mb-2">Detail Promosi</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>
                          <strong>Kode Promosi:</strong> {promotion.code}
                        </div>
                        <div>
                          <strong>Syarat & Ketentuan:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {promotion.terms_conditions?.map((term, index) => (
                              <li key={index}>{term}</li>
                            )) || [
                              'Berlaku untuk semua jenis lapangan',
                              'Tidak dapat digabung dengan promosi lain',
                              'Berlaku selama periode promosi'
                            ]}
                          </ul>
                        </div>
                        {bookingData && (
                          <div>
                            <strong>Estimasi Diskon:</strong>{' '}
                            {formatCurrency(calculateDiscount(bookingData.total_price || 0, promotion))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {isValid && (
                    <button
                      onClick={() => handleSelectPromotion(promotion)}
                      disabled={isValidating}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-gray-800 text-gray-900'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isValidating ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          <span>Validasi...</span>
                        </div>
                      ) : isSelected ? (
                        'Terpilih'
                      ) : (
                        'Pilih'
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleToggleDetails(promotion.id)}
                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {isExpanded ? 'Tutup' : 'Detail'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Promotion Summary */}
      {selectedPromotion && (
        <div className="bg-blue-50 border border-gray-200 rounded-lg p-4 mt-4">
          <h3 className="font-medium text-gray-900 mb-2">Promosi Terpilih</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">{selectedPromotion.title}</p>
              <p className="text-sm text-gray-900">
                {formatDiscountText(selectedPromotion)}
              </p>
            </div>
            <button
              onClick={() => onSelectPromotion?.(null)}
              className="text-gray-900 hover:text-gray-900 text-sm"
            >
              Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionList;
