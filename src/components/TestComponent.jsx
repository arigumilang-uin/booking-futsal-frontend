// src/components/TestComponent.jsx
const TestComponent = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 Frontend Berjalan!</h1>
        <p className="text-gray-600 mb-6">
          Aplikasi booking soccer Pekanbaru berhasil dimuat dengan npm run dev:prod
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">✅ React: Working</p>
          <p className="text-sm text-gray-500">✅ Vite: Working</p>
          <p className="text-sm text-gray-500">✅ Tailwind: Working</p>
          <p className="text-sm text-gray-500">✅ Production Mode: Active</p>
        </div>
        <div className="mt-6">
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-gray-800 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
