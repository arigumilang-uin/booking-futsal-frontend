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
    <div className="bg-gradient-to-br from-green-50 to-gray-100 p-6 rounded-lg text-center">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-white">💳</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Proses Pembayaran</h3>
      <p className="text-gray-500 mb-4">Kelola transaksi dan pembayaran booking lapangan.</p>
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
          <h3 className="text-sm font-medium text-gray-800">Total Transaksi Sukses</h3>
          <p className="text-2xl font-bold text-gray-800">{paidTransactions.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800">Total Pendapatan</h3>
          <p className="text-2xl font-bold text-gray-800">
            Rp {paidTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800">Rata-rata Transaksi</h3>
          <p className="text-2xl font-bold text-gray-800">
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
          <h3 className="text-lg font-medium text-gray-800">Transaksi Terbaru</h3>
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
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">#{transaction.booking_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{transaction.user_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{formatCurrency(transaction.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 capitalize">{transaction.method}</td>
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
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Pendapatan Hari Ini',
      value: `Rp ${dashboardData.payment_metrics?.daily_revenue || '0'}`,
      icon: '💰',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Pembayaran Pending',
      value: dashboardData.payment_metrics?.pending_payments || 0,
      icon: '⏳',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Success Rate',
      value: dashboardData.payment_metrics?.success_rate || '0%',
      icon: '📈',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Transaksi Sukses',
      value: dashboardData.payment_metrics?.total_transactions || 0,
      icon: '✅',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Metode Pembayaran',
      value: '3 Aktif',
      icon: '🏦',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    }
  ], [dashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium">Loading Kasir Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 relative overflow-hidden" style={{
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(126, 34, 206, 0.06) 0%, transparent 50%),
        linear-gradient(90deg, rgba(147, 51, 234, 0.04) 1px, transparent 1px),
        linear-gradient(rgba(147, 51, 234, 0.04) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px'
    }}>
      <MinimalistKasirHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Refresh Button - Soccer Style */}
        <div className="flex justify-end">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Memuat Dashboard...' : 'Muat Ulang Dashboard'}</span>
          </button>
        </div>

        {/* Soccer Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-800 mt-1">{stat.title}</div>
                  <div className="text-xs text-gray-500 mt-1">Kasir aktif</div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl text-white">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Soccer Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <nav className="flex space-x-1">
            {[
              {
                id: 'overview',
                label: 'Ringkasan',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                id: 'payments',
                label: 'Pembayaran',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )
              },
              {
                id: 'transactions',
                label: 'Transaksi',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeView === tab.id
                  ? 'bg-gray-800 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm">
          {activeView === 'overview' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">💰</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-800">Ringkasan Kasir</h2>
                  <p className="text-gray-600">Overview pembayaran dan transaksi hari ini</p>
                </div>
              </div>

              {/* Key Business Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm">Total Transaksi</p>
                      <p className="text-3xl font-bold text-white">{dashboardData.payment_metrics?.total_transactions || 0}</p>
                      <p className="text-gray-100 text-xs mt-1">Hari ini</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl text-white">💳</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm">Pendapatan</p>
                      <p className="text-3xl font-bold text-white">Rp {dashboardData.payment_metrics?.daily_revenue || '0'}</p>
                      <p className="text-gray-100 text-xs mt-1">Hari ini</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl text-white">💰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm">Pending Payment</p>
                      <p className="text-3xl font-bold text-white">{dashboardData.payment_metrics?.pending_payments || 0}</p>
                      <p className="text-gray-100 text-xs mt-1">Menunggu konfirmasi</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl text-white">⏳</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm">Success Rate</p>
                      <p className="text-3xl font-bold text-white">{dashboardData.payment_metrics?.success_rate || '0%'}</p>
                      <p className="text-gray-100 text-xs mt-1">Tingkat keberhasilan</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl text-white">✅</span>
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
