// src/utils/testHelpers.js
/**
 * Test helpers untuk development dan debugging
 */

export const testUsers = {
  customer: {
    email: 'ari@gmail.com',
    password: 'password123',
    role: 'penyewa'
  },
  kasir: {
    email: 'kasir1@futsalapp.com',
    password: 'password123',
    role: 'staff_kasir'
  },
  operator: {
    email: 'operator1@futsalapp.com',
    password: 'password123',
    role: 'operator_lapangan'
  },
  manager: {
    email: 'manajer1@futsalapp.com',
    password: 'password123',
    role: 'manajer_futsal'
  },
  supervisor: {
    email: 'pweb@futsalapp.com',
    password: 'password123',
    role: 'supervisor_sistem'
  }
};

export const testBookingData = {
  field_id: 1,
  date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
  time_slot: '10:00-11:00',
  duration: 1,
  notes: 'Test booking from frontend'
};

export const logTestInfo = () => {
  console.log('🧪 Test Users Available:');
  Object.entries(testUsers).forEach(([key, user]) => {
    console.log(`${key}: ${user.email} / ${user.password} (${user.role})`);
  });
  
  console.log('\n🏟️ Backend API URL:', import.meta.env.VITE_API_URL);
  console.log('🌐 Environment:', import.meta.env.MODE);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const validateBookingForm = (formData) => {
  const errors = {};
  
  if (!formData.fieldId) {
    errors.fieldId = 'Pilih lapangan terlebih dahulu';
  }
  
  if (!formData.date) {
    errors.date = 'Pilih tanggal booking';
  } else {
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.date = 'Tanggal tidak boleh di masa lalu';
    }
  }
  
  if (!formData.timeSlot) {
    errors.timeSlot = 'Pilih waktu booking';
  }
  
  if (!formData.duration || formData.duration < 1) {
    errors.duration = 'Durasi minimal 1 jam';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
