// src/components/ReviewForm.jsx
import { useState, useEffect } from 'react';
import { createReview, updateReview, checkCanReview, uploadReviewImages } from '../api';

const ReviewForm = ({ 
  bookingId, 
  fieldId, 
  existingReview = null, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    review: existingReview?.review || '',
    is_anonymous: existingReview?.is_anonymous || false
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(existingReview?.images || []);
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId && !existingReview) {
      checkReviewEligibility();
    }
  }, [bookingId, existingReview]);

  const checkReviewEligibility = async () => {
    try {
      const response = await checkCanReview(bookingId);
      if (!response.success || !response.data?.can_review) {
        setCanReview(false);
        setError(response.data?.reason || 'Tidak dapat memberikan review untuk booking ini');
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanReview(false);
      setError('Gagal memeriksa kelayakan review');
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length + existingImages.length > 5) {
      setError('Maksimal 5 gambar yang dapat diunggah');
      return;
    }

    // Validate file size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024;
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} terlalu besar. Maksimal 5MB per file.`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
    setError('');
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canReview) {
      setError('Tidak dapat memberikan review untuk booking ini');
      return;
    }

    if (formData.rating === 0) {
      setError('Silakan berikan rating');
      return;
    }

    if (formData.review.trim().length < 10) {
      setError('Review minimal 10 karakter');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let imageUrls = [...existingImages];

      // Upload new images if any
      if (images.length > 0) {
        const uploadResponse = await uploadReviewImages(images);
        if (uploadResponse.success) {
          imageUrls = [...imageUrls, ...uploadResponse.data.image_urls];
        }
      }

      const reviewData = {
        field_id: fieldId,
        booking_id: bookingId,
        rating: formData.rating,
        review: formData.review.trim(),
        images: imageUrls,
        is_anonymous: formData.is_anonymous
      };

      let response;
      if (existingReview) {
        response = await updateReview(existingReview.id, reviewData);
      } else {
        response = await createReview(reviewData);
      }

      if (response.success) {
        onSuccess?.(response.data);
      } else {
        setError(response.message || 'Gagal menyimpan review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.message || 'Gagal menyimpan review');
    } finally {
      setLoading(false);
    }
  };

  if (!canReview && !existingReview) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Tidak Dapat Memberikan Review
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              className={`w-8 h-8 ${
                star <= formData.rating
                  ? 'text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-400'
              } transition-colors`}
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          ))}
        </div>
        {formData.rating > 0 && (
          <p className="mt-1 text-sm text-gray-600">
            {formData.rating === 1 && 'Sangat Buruk'}
            {formData.rating === 2 && 'Buruk'}
            {formData.rating === 3 && 'Cukup'}
            {formData.rating === 4 && 'Baik'}
            {formData.rating === 5 && 'Sangat Baik'}
          </p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
          Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review"
          rows={4}
          value={formData.review}
          onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
          placeholder="Ceritakan pengalaman Anda menggunakan lapangan ini..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          minLength={10}
        />
        <p className="mt-1 text-sm text-gray-600">
          {formData.review.length}/500 karakter (minimal 10)
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto (Opsional)
        </label>
        
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Foto yang sudah ada:</p>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, true)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        {images.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Foto baru:</p>
            <div className="flex flex-wrap gap-2">
              {images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, false)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {images.length + existingImages.length < 5 && (
          <div>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="images"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Foto
            </label>
            <p className="mt-1 text-sm text-gray-600">
              Maksimal 5 foto, ukuran maksimal 5MB per foto
            </p>
          </div>
        )}
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center">
        <input
          id="anonymous"
          type="checkbox"
          checked={formData.is_anonymous}
          onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
          Posting sebagai anonim
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading || formData.rating === 0}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Menyimpan...' : existingReview ? 'Update Review' : 'Kirim Review'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
