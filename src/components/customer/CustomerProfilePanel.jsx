import React, { useState, useEffect } from 'react';
import { getCustomerProfile, updateCustomerProfile } from '../../api/customerAPI';
import useAuth from '../../hooks/useAuth';
import { User, Mail, Phone, Calendar, Edit3, Save, X, Shield } from 'lucide-react';

const CustomerProfilePanel = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await getCustomerProfile();
      if (response.success) {
        const profileData = response.data;
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || ''
        });
      }
    } catch (err) {
      // Fallback to user data from auth context
      if (user) {
        setProfile(user);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        });
      } else {
        setError('Gagal memuat profil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateCustomerProfile(formData);
      if (response.success) {
        setProfile(response.data);
        setSuccess('Profil berhasil diperbarui!');
        setEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || ''
    });
    setEditing(false);
    setError(null);
    setSuccess(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak tersedia';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Profil Saya</h2>
            <p className="text-gray-600">Kelola informasi akun Anda</p>
          </div>
        </div>
        
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profil</span>
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-5 h-5 text-green-600 mr-2">✅</div>
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-5 h-5 text-red-600 mr-2">❌</div>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-emerald-600 font-bold text-3xl">
                {(profile?.name || user?.name || 'C').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-2xl">
                {profile?.name || user?.name || 'Customer'}
              </h3>
              <p className="text-emerald-100 text-lg">
                {profile?.email || user?.email || 'customer@example.com'}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Shield className="w-4 h-4 text-emerald-200" />
                <span className="text-emerald-200 text-sm">Customer Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Informasi Pribadi</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Nama Lengkap</span>
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Masukkan nama lengkap"
                    />
                  ) : (
                    <div className="bg-gray-50 px-4 py-3 rounded-xl">
                      <p className="text-gray-900">{profile?.name || user?.name || 'Belum diisi'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Email</span>
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="email@example.com"
                    />
                  ) : (
                    <div className="bg-gray-50 px-4 py-3 rounded-xl">
                      <p className="text-gray-900">{profile?.email || user?.email || 'Belum diisi'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Nomor Telepon</span>
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="08xxxxxxxxxx"
                    />
                  ) : (
                    <div className="bg-gray-50 px-4 py-3 rounded-xl">
                      <p className="text-gray-900">{profile?.phone || user?.phone || 'Belum diisi'}</p>
                    </div>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Batal</span>
                  </button>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Informasi Akun</h4>
              
              <div className="space-y-4">
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <h5 className="font-semibold text-emerald-900">Member Sejak</h5>
                  </div>
                  <p className="text-emerald-700">
                    {formatDate(profile?.created_at || user?.created_at)}
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h5 className="font-semibold text-blue-900">Status Akun</h5>
                  </div>
                  <p className="text-blue-700">Customer Aktif</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <h5 className="font-semibold text-purple-900">Role</h5>
                  </div>
                  <p className="text-purple-700">
                    {profile?.role || user?.role || 'penyewa'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePanel;
