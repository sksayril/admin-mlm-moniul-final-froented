import React, { useState, useEffect } from 'react';
import { Network, Users, TrendingUp, DollarSign, Award, Settings, AlertCircle, RefreshCw, Crown, Star, Calendar, Mail, UserCheck, UserX } from 'lucide-react';
import { mlmService, MlmOverviewData, TopPerformer } from '../api';

type TabType = 'overview' | 'performers';

const MlmContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mlmData, setMlmData] = useState<MlmOverviewData | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchMlmOverview();
    } else {
      fetchTopPerformers();
    }
  }, [activeTab]);

  const fetchMlmOverview = async () => {
    try {
      setLoading(true);
      const response = await mlmService.getOverview();
      setMlmData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch MLM overview data. Please try again later.');
      console.error('MLM overview error:', err);
      setMlmData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      setLoading(true);
      const response = await mlmService.getTopPerformers();
      setTopPerformers(response.data.topPerformers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch top performers data. Please try again later.');
      console.error('Top performers error:', err);
      setTopPerformers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'overview') {
      fetchMlmOverview();
    } else {
      fetchTopPerformers();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'diamond': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'newcomer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'overview': return <Network className="w-4 h-4" />;
      case 'performers': return <Crown className="w-4 h-4" />;
      default: return <Network className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MLM data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">MLM Management</h2>
              <p className="text-gray-600 mt-1">Manage multi-level marketing structure and commissions</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
          <button 
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center space-x-2"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">MLM Management</h2>
              <p className="text-gray-600 mt-1">Manage multi-level marketing structure and commissions</p>
            </div>
          </div>
          <button 
            onClick={handleRefresh} 
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
            {(['overview', 'performers'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-sm flex items-center space-x-1 sm:space-x-2 transition-colors min-w-max`}
              >
                {getTabIcon(tab)}
                <span className="capitalize">
                  {tab === 'overview' ? 'MLM Overview' : 'Top Performers'}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && mlmData && (
        <div className="space-y-6">
          {/* Overview Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{mlmData.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active in Network</p>
                  <p className="text-2xl font-bold text-gray-900">{mlmData.activeInNetwork}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Network className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earnings Distributed</p>
                  <p className="text-2xl font-bold text-gray-900">₹{mlmData.totalEarningsDistributed}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Network Depth</p>
                  <p className="text-2xl font-bold text-gray-900">{mlmData.networkDepth} Levels</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commission Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Direct Commissions</p>
                    <p className="text-sm text-gray-600">Paid from direct referrals</p>
                  </div>
                  <span className="text-xl font-bold text-blue-600">₹{mlmData.directCommissionsPaid}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Matrix Commissions</p>
                    <p className="text-sm text-gray-600">Paid from matrix bonuses</p>
                  </div>
                  <span className="text-xl font-bold text-green-600">₹{mlmData.matrixCommissionsPaid}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Rank Bonuses</p>
                    <p className="text-sm text-gray-600">Paid from rank achievements</p>
                  </div>
                  <span className="text-xl font-bold text-purple-600">₹{mlmData.rankBonusesPaid}</span>
                </div>
              </div>
            </div>

            {/* Withdrawal Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Pending Withdrawals</p>
                    <p className="text-sm text-gray-600">Amount pending approval</p>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">₹{mlmData.pendingWithdrawals}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Total Withdrawals</p>
                    <p className="text-sm text-gray-600">Successfully processed</p>
                  </div>
                  <span className="text-xl font-bold text-green-600">₹{mlmData.totalWithdrawals}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Available Balance</p>
                    <p className="text-sm text-gray-600">Ready for withdrawal</p>
                  </div>
                  <span className="text-xl font-bold text-gray-600">
                    ₹{mlmData.totalEarningsDistributed - mlmData.totalWithdrawals - mlmData.pendingWithdrawals}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers Tab */}
      {activeTab === 'performers' && (
        <div className="space-y-6">
          {/* Top Performers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Performers Leaderboard</h3>
              <p className="text-gray-600 text-sm mt-1">
                Showing {topPerformers.length} performers sorted by total earnings
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direct Referrals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topPerformers.length > 0 ? topPerformers.map((performer, index) => (
                    <tr key={performer.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && (
                            <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                          )}
                          {index === 1 && (
                            <Star className="w-5 h-5 text-gray-400 mr-2" />
                          )}
                          {index === 2 && (
                            <Award className="w-5 h-5 text-orange-500 mr-2" />
                          )}
                          <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {performer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                            <div className="text-sm text-gray-500">{performer.email}</div>
                            <div className="text-xs text-gray-400">{performer.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRankColor(performer.rank)}`}>
                          {performer.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{performer.teamSize}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{performer.directReferrals}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₹{performer.totalEarnings}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {performer.isActive ? (
                            <>
                              <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                              <span className="text-sm text-green-600">Active</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-4 h-4 text-red-500 mr-1" />
                              <span className="text-sm text-red-600">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(performer.joinDate)}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No top performers data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 3 Performers Cards */}
          {topPerformers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPerformers.slice(0, 3).map((performer, index) => (
                <div key={performer.userId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {index === 0 && <Crown className="w-6 h-6 text-yellow-500" />}
                      {index === 1 && <Star className="w-6 h-6 text-gray-400" />}
                      {index === 2 && <Award className="w-6 h-6 text-orange-500" />}
                      <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRankColor(performer.rank)}`}>
                      {performer.rank}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                      {performer.name.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{performer.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{performer.userId}</p>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-sm text-gray-500">Team Size</p>
                        <p className="text-lg font-bold text-gray-900">{performer.teamSize}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Earnings</p>
                        <p className="text-lg font-bold text-green-600">₹{performer.totalEarnings}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MlmContent;