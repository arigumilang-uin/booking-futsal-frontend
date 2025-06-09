// src/components/MinimalistKasirDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { getKasirDashboard, getAllPaymentsForKasir, getPaymentStatsForKasir } from '../api/kasirAPI';
import { formatCurrency } from '../api/analyticsAPI';
import MinimalistKasirHeader from './MinimalistKasirHeader';
import KasirPaymentPanel from './kasir/KasirPaymentPanel';
import ManualPaymentModal from './kasir/ManualPaymentModal';

// Simple placeholder components for Kasir
const PaymentManagementPanel = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Pembayaran</h2>
    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg text-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-white">💳</span>
      </div>
      <h3 className="text-lg font-semibold text-green-900 mb-2">Proses Pembayaran</h3>
      <p className="text-green-700 mb-4">Kelola transaksi dan pembayaran booking lapangan.</p>
    </div>
  </div>
);

const TransactionHistoryPanel = ({ dashboardData }) => {
  const paidTransactions = dashboardData?.confirmed_transactions || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Transaksi</h2>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Total Transaksi Sukses</h3>
          <p className="text-2xl font-bold text-green-900">{paidTransactions.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Pendapatan</h3>
          <p className="text-2xl font-bold text-blue-900">
            Rp {paidTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Rata-rata Transaksi</h3>
          <p className="text-2xl font-bold text-purple-900">
            Rp {paidTransactions.length > 0 ?
              Math.round(paidTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) / paidTransactions.length).toLocaleString('id-ID') :
              '0'
            }
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Transaksi Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paidTransactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{transaction.booking_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.user_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">{transaction.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paidTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada transaksi sukses</p>
          </div>
        )}
      </div>
    </div>
  );
};



const MinimalistKasirDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [dashboardData, setDashboardData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    console.log('🚀 KASIR DASHBOARD - Starting loadDashboardData...');
    try {
      setLoading(true);

      // TEMPORARY: Force fallback to payment API to get real data
      // Backend dashboard endpoint returns hardcoded zeros
      console.log('🔍 FORCING FALLBACK - Backend dashboard has hardcoded zeros, using payment API for real data...');

      // Load payment data for kasir payment management
      const [paymentsResponse, statsResponse] = await Promise.all([
        getAllPaymentsForKasir({ limit: 20 }).catch((error) => {
          console.error('❌ Failed to load payments:', error);
          return { success: false, data: [] };
        }),
        getPaymentStatsForKasir().catch((error) => {
          console.error('❌ Failed to load stats:', error);
          return { success: false, data: {} };
        })
      ]);

      console.log('🔍 KASIR DASHBOARD - API RESPONSES:');
      console.log('📊 Payments Response:', {
        success: paymentsResponse.success,
        dataType: typeof paymentsResponse.data,
        isArray: Array.isArray(paymentsResponse.data),
        length: paymentsResponse.data?.length,
        fullResponse: paymentsResponse
      });
      console.log('📈 Stats Response:', {
        success: statsResponse.success,
        dataType: typeof statsResponse.data,
        fullResponse: statsResponse
      });

      let paymentMetrics = {
        total_transactions: 0,
        daily_revenue: '0',
        pending_payments: 0,
        success_rate: '0%'
      };

      if (paymentsResponse.success) {
        // Handle payments data - ensure it's an array
        const payments = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];

        console.log('🔍 KASIR PAYMENTS DATA ANALYSIS:');
        console.log('📊 Raw Data:', {
          isArray: Array.isArray(paymentsResponse.data),
          length: payments.length,
          firstPayment: payments[0],
          allPayments: payments
        });

        // Analyze payment statuses
        const statusCounts = payments.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {});

        console.log('📈 Payment Status Breakdown:', statusCounts);

        // Calculate metrics from actual payment data
        const paidPayments = payments.filter(p => p.status === 'paid');
        const pendingPayments = payments.filter(p => p.status === 'pending');
        const totalTransactions = paidPayments.length;

        console.log('💰 Payment Filtering Results:', {
          totalPayments: payments.length,
          paidPayments: paidPayments.length,
          pendingPayments: pendingPayments.length,
          paidSample: paidPayments[0],
          pendingSample: pendingPayments[0]
        });

        // Calculate revenue with detailed logging
        let totalRevenue = 0;
        paidPayments.forEach((payment, index) => {
          const amount = parseFloat(payment.amount) || 0;
          totalRevenue += amount;
          if (index < 3) { // Log first 3 for debugging
            console.log(`💵 Payment ${index + 1}:`, {
              id: payment.id,
              amount: payment.amount,
              parsedAmount: amount,
              status: payment.status
            });
          }
        });

        const successRate = payments.length > 0 ? Math.round((totalTransactions / payments.length) * 100) : 0;

        console.log('🎯 FINAL CALCULATED METRICS:', {
          totalTransactions,
          totalRevenue,
          pendingCount: pendingPayments.length,
          successRate: successRate + '%',
          formattedRevenue: totalRevenue.toLocaleString('id-ID')
        });

        paymentMetrics = {
          total_transactions: totalTransactions,
          daily_revenue: totalRevenue.toLocaleString('id-ID'),
          pending_payments: pendingPayments.length,
          success_rate: successRate + '%'
        };

        // Store payment data for kasir dashboard - focused on payment management only
        setDashboardData({
          payment_metrics: paymentMetrics,
          pending_payments: payments.filter(p => p.status === 'pending'),
          confirmed_transactions: payments.filter(p => p.status === 'paid'),
          recent_transactions: payments.slice(0, 5)
        });
      } else {
        // Fallback if payments response fails
        setDashboardData({
          payment_metrics: paymentMetrics,
          pending_payments: [],
          confirmed_transactions: [],
          recent_transactions: []
        });
      }

      if (statsResponse.success && statsResponse.data?.statistics) {
        // Update metrics with stats data if available
        setDashboardData(prev => ({
          ...prev,
          payment_metrics: { ...prev.payment_metrics, ...statsResponse.data.statistics }
        }));
      }
    } catch (error) {
      console.error('Error loading kasir dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const statsData = useMemo(() => [
    {
      title: 'Total Transaksi',
      value: dashboardData.payment_metrics?.total_transactions || 0,
      icon: '💳',
      color: 'bg-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pendapatan Hari Ini',
      value: `Rp ${dashboardData.payment_metrics?.daily_revenue || '0'}`,
      icon: '💰',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pembayaran Pending',
      value: dashboardData.payment_metrics?.pending_payments || 0,
      icon: '⏳',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Success Rate',
      value: dashboardData.payment_metrics?.success_rate || '0%',
      icon: '📈',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Transaksi Sukses',
      value: dashboardData.payment_metrics?.total_transactions || 0,
      icon: '✅',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Metode Pembayaran',
      value: '3 Aktif',
      icon: '🏦',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100'
    }
  ], [dashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-600 font-medium">Loading Kasir Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <MinimalistKasirHeader />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Selamat datang, {user?.name || 'Kasir'}! 💰
              </h1>
              <p className="text-gray-600">
                Kelola pembayaran dan transaksi booking lapangan futsal
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${refreshing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700 hover:scale-105 shadow-lg'
                }`}
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <span className="text-lg">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'payments', label: 'Pembayaran', icon: '💳' },
                { id: 'transactions', label: 'Transaksi', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeView === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {activeView === 'overview' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview Kasir</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Ringkasan Pembayaran</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Transaksi Hari Ini:</span>
                      <span className="font-bold text-green-900">{dashboardData.payment_metrics?.total_transactions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Pendapatan:</span>
                      <span className="font-bold text-green-900">Rp {dashboardData.payment_metrics?.daily_revenue || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Success Rate:</span>
                      <span className="font-bold text-green-900">{dashboardData.payment_metrics?.success_rate || '0%'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Status Pembayaran</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Pending Payment:</span>
                      <span className="font-bold text-blue-900">{dashboardData.payment_metrics?.pending_payments || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Confirmed:</span>
                      <span className="font-bold text-blue-900">{dashboardData.payment_metrics?.total_transactions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Metode Aktif:</span>
                      <span className="font-bold text-blue-900">3 Metode</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'payments' && <KasirPaymentPanel />}
          {activeView === 'transactions' && <TransactionHistoryPanel dashboardData={dashboardData} />}
        </div>
      </div>
    </div>
  );
};

export default MinimalistKasirDashboard;
