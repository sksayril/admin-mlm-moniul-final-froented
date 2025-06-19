import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { AdminData, dashboardService, DashboardStatsResponse } from '../api';
import StatsChart from './StatsChart';

interface DashboardContentProps {
  adminData: AdminData | null;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ adminData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsResponse['data'] | null>(null);
  const [selectedChart, setSelectedChart] = useState<'newUsers' | 'revenue' | 'withdrawals'>('revenue');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getStats();
        setDashboardStats(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard statistics. Please try again later.');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fallback data for admin wallet if API data isn't available
  const incomeWallet = adminData?.incomeWallet || {
    balance: 0,
    selfIncome: 0,
    directIncome: 0,
    matrixIncome: 0,
    dailyTeamIncome: 0,
    rankRewards: 0,
    fxTradingIncome: 0
  };

  // Stats data with real values or fallbacks
  const userStats = dashboardStats?.userStats || {
    totalUsers: 0,
    newUsers: 0,
    activeSubscriptions: 0,
    activeTpins: 0
  };

  const financialStats = dashboardStats?.financialStats || {
    totalRevenue: 0,
    revenueInPeriod: 0,
    totalWithdrawals: {
      pending: { totalAmount: 0, count: 0 },
      approved: { totalAmount: 0, count: 0 }
    }
  };

  const mlmStats = dashboardStats?.mlmStats || {
    totalDirectIncome: 0,
    totalMatrixIncome: 0,
    totalSelfIncome: 0,
    activeReferrers: 0
  };

  // Main stats for the dashboard cards
  const stats = [
    {
      title: 'Total Users',
      value: userStats.totalUsers.toString(),
      change: `+${userStats.newUsers}`,
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Revenue',
      value: `$${financialStats.totalRevenue.toFixed(2)}`,
      change: `+$${financialStats.revenueInPeriod.toFixed(2)}`,
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Withdrawals',
      value: `$${(financialStats.totalWithdrawals.pending.totalAmount + 
        financialStats.totalWithdrawals.approved.totalAmount).toFixed(2)}`,
      change: `${financialStats.totalWithdrawals.pending.count} pending`,
      changeType: 'neutral',
      icon: CreditCard,
      color: 'bg-orange-500'
    },
    {
      title: 'Active Referrers',
      value: mlmStats.activeReferrers.toString(),
      change: `$${mlmStats.totalDirectIncome.toFixed(2)} earned`,
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  // Generate recent activities or use placeholder data if not available
  const recentActivities = dashboardStats 
    ? [
        { id: 1, action: `${userStats.newUsers} new users registered`, time: 'Today' },
        { id: 2, action: `${financialStats.totalWithdrawals.pending.count} withdrawal requests pending`, time: 'Today' },
        { id: 3, action: `$${financialStats.revenueInPeriod.toFixed(2)} revenue generated`, time: 'This period' },
        { id: 4, action: `${userStats.activeSubscriptions} active subscriptions`, time: 'Current' },
        { id: 5, action: `${userStats.activeTpins} active TPINs`, time: 'Current' }
      ]
    : [
        { id: 1, action: 'Loading activity data...', time: '' }
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Chart data tabs
  const chartTabs = [
    { id: 'revenue', label: 'Revenue' },
    { id: 'newUsers', label: 'New Users' },
    { id: 'withdrawals', label: 'Withdrawals' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome, {adminData?.name || 'Admin'}!</h2>
        <p className="text-blue-100">
          User ID: {adminData?.userId || 'N/A'} | 
          Rank: {adminData?.rank || 'N/A'} | 
          Team Size: {adminData?.teamSize || 0}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : stat.changeType === 'negative' ? (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    ) : (
                      <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      {dashboardStats?.chartData && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
            
            <div className="flex mt-3 sm:mt-0 space-x-1 bg-gray-100 p-1 rounded-lg">
              {chartTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedChart(tab.id as any)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    selectedChart === tab.id
                      ? 'bg-white shadow-sm text-blue-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-80">
            <StatsChart 
              chartData={dashboardStats.chartData} 
              dataType={selectedChart}
              height={320}
            />
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  {activity.time && <p className="text-xs text-gray-500">{activity.time}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MLM Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">MLM Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Direct Income</span>
              <span className="font-semibold">${mlmStats.totalDirectIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Matrix Income</span>
              <span className="font-semibold">${mlmStats.totalMatrixIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Self Income</span>
              <span className="font-semibold">${mlmStats.totalSelfIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Your Wallet Balance</span>
              <span className="font-semibold text-green-600">${incomeWallet.balance.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-200 my-2"></div>
            <div className="flex justify-between items-center font-medium text-blue-600">
              <span>Total Earnings</span>
              <span>
                ${(mlmStats.totalDirectIncome + mlmStats.totalMatrixIncome + mlmStats.totalSelfIncome).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Distribution */}
      {dashboardStats?.mlmStats?.rankDistribution && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rank Distribution</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rank
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Users
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Distribution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardStats.mlmStats.rankDistribution.map((rank, index) => {
                  const totalUsers = userStats.totalUsers || 1; // Prevent division by zero
                  const percentage = ((rank.count / totalUsers) * 100).toFixed(1);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{rank._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{rank.count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">{percentage}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <Users className="w-6 h-6 text-blue-500 mb-2" />
            <p className="text-sm font-medium text-gray-900">Manage Users</p>
          </button>
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
            <CreditCard className="w-6 h-6 text-green-500 mb-2" />
            <p className="text-sm font-medium text-gray-900">Withdrawals</p>
          </button>
          <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left">
            <TrendingUp className="w-6 h-6 text-orange-500 mb-2" />
            <p className="text-sm font-medium text-gray-900">View Reports</p>
          </button>
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
            <DollarSign className="w-6 h-6 text-purple-500 mb-2" />
            <p className="text-sm font-medium text-gray-900">MLM Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;