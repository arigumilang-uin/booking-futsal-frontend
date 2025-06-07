// src/components/SystemSettingsManager.jsx
import { useState, useEffect } from 'react';
import { 
  getAllSystemSettings,
  getSystemSetting,
  updateSystemSetting,
  createSystemSetting,
  deleteSystemSetting,
  resetSettingToDefault
} from '../api';

const SystemSettingsManager = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    description: '',
    is_public: false
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getAllSystemSettings();
      if (response.success) {
        setSettings(response.data?.settings || []);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key, value, description, isPublic) => {
    try {
      const response = await updateSystemSetting(key, value, description, isPublic);
      if (response.success) {
        await loadSettings();
        setEditingSetting(null);
        alert('Pengaturan berhasil diperbarui');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Gagal memperbarui pengaturan');
    }
  };

  const handleCreateSetting = async () => {
    try {
      if (!newSetting.key || newSetting.value === '') {
        alert('Key dan value harus diisi');
        return;
      }

      const response = await createSystemSetting(
        newSetting.key,
        newSetting.value,
        newSetting.description,
        newSetting.is_public
      );
      
      if (response.success) {
        await loadSettings();
        setNewSetting({ key: '', value: '', description: '', is_public: false });
        setShowCreateForm(false);
        alert('Pengaturan berhasil dibuat');
      }
    } catch (error) {
      console.error('Error creating setting:', error);
      alert('Gagal membuat pengaturan');
    }
  };

  const handleDeleteSetting = async (key) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengaturan "${key}"?`)) {
      return;
    }

    try {
      const response = await deleteSystemSetting(key);
      if (response.success) {
        await loadSettings();
        alert('Pengaturan berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting setting:', error);
      alert('Gagal menghapus pengaturan');
    }
  };

  const handleResetToDefault = async (key) => {
    if (!confirm(`Apakah Anda yakin ingin mereset "${key}" ke nilai default?`)) {
      return;
    }

    try {
      const response = await resetSettingToDefault(key);
      if (response.success) {
        await loadSettings();
        alert('Pengaturan berhasil direset ke default');
      }
    } catch (error) {
      console.error('Error resetting setting:', error);
      alert('Gagal mereset pengaturan');
    }
  };

  const filteredSettings = settings.filter(setting =>
    setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (setting.description && setting.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const parseValue = (value, originalType) => {
    if (originalType === 'boolean') {
      return value === 'true';
    }
    if (originalType === 'number') {
      return Number(value);
    }
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            ⚙️ System Settings Management
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Tambah Setting
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari pengaturan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{settings.length}</p>
            <p className="text-sm text-blue-800">Total Settings</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {settings.filter(s => s.is_public).length}
            </p>
            <p className="text-sm text-green-800">Public Settings</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {settings.filter(s => !s.is_public).length}
            </p>
            <p className="text-sm text-purple-800">Private Settings</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Setting Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newSetting.key}
                onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="setting_key"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newSetting.value}
                onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="setting_value"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newSetting.description}
                onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="2"
                placeholder="Deskripsi pengaturan..."
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newSetting.is_public}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Public Setting (dapat diakses tanpa autentikasi)</span>
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleCreateSetting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Simpan
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewSetting({ key: '', value: '', description: '', is_public: false });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Settings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Daftar Pengaturan ({filteredSettings.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat pengaturan...</p>
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Tidak ada pengaturan ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSettings.map((setting) => (
              <div key={setting.key} className="p-6">
                {editingSetting === setting.key ? (
                  <EditSettingForm
                    setting={setting}
                    onSave={handleUpdateSetting}
                    onCancel={() => setEditingSetting(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{setting.key}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          setting.is_public 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {setting.is_public ? 'Public' : 'Private'}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">Value: </span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {formatValue(setting.value)}
                        </code>
                      </div>
                      
                      {setting.description && (
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-2">
                        Diperbarui: {new Date(setting.updated_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setEditingSetting(setting.key)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleResetToDefault(setting.key)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => handleDeleteSetting(setting.key)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Edit Setting Form Component
const EditSettingForm = ({ setting, onSave, onCancel }) => {
  const [value, setValue] = useState(formatValue(setting.value));
  const [description, setDescription] = useState(setting.description || '');
  const [isPublic, setIsPublic] = useState(setting.is_public);

  const formatValue = (val) => {
    if (typeof val === 'object') {
      return JSON.stringify(val, null, 2);
    }
    return String(val);
  };

  const handleSave = () => {
    const originalType = typeof setting.value;
    let parsedValue;
    
    try {
      if (originalType === 'boolean') {
        parsedValue = value === 'true';
      } else if (originalType === 'number') {
        parsedValue = Number(value);
      } else if (originalType === 'object') {
        parsedValue = JSON.parse(value);
      } else {
        parsedValue = value;
      }
    } catch (error) {
      alert('Format value tidak valid');
      return;
    }

    onSave(setting.key, parsedValue, description, isPublic);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Value
        </label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          rows="3"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>
      
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Public Setting</span>
        </label>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Simpan
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Batal
        </button>
      </div>
    </div>
  );
};

export default SystemSettingsManager;
