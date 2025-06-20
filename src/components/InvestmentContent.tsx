import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, PieChart, Activity, Users, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw, Clock, CheckCircle, XCircle, Eye, Check, X, AlertCircle } from 'lucide-react';
import { investmentService, InvestmentRecharge } from '../api';

interface InvestmentStats {
  totalUsers: number;
  totalInvestmentWalletBalance: number;
  totalInvested: number;
  totalReturns: number;
  activeInvestments: number;
  maturedInvestments: number;
  pendingRecharges: number;
  totalRechargeAmount: number;
}

interface ActiveInvestment {
  userId: string;
  userName: string;
  userEmail: string;
  investmentId: string;
  amount: number;
  startDate: string;
  maturityDate: string;
  daysCompleted: number;
  totalDays: number;
  status: string;
  expectedReturn: number;
}

interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyROI: number;
  duration: number;
  totalSubscribers: number;
  isActive: boolean;
}

interface RecentInvestment {
  id: string;
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
  dailyReturn: number;
}

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

interface ImageModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ApprovalModalProps {
  recharge: InvestmentRecharge | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rechargeId: string) => void;
  isProcessing: boolean;
}

interface RejectionModalProps {
  recharge: InvestmentRecharge | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rechargeId: string, reason: string) => void;
  isProcessing: boolean;
}

interface RechargesTableProps {
  recharges: InvestmentRecharge[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onViewScreenshot: (url: string) => void;
  showActions?: boolean;
  onApprove?: (recharge: InvestmentRecharge) => void;
  onReject?: (recharge: InvestmentRecharge) => void;
  emptyMessage?: string;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}

type TabType = 'overview' | 'pending' | 'approved' | 'rejected';

const Notification: React.FC<NotificationProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
  
  if (!isVisible) return null;
  
  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-100 border-l-4 border-green-500',
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          text: 'text-green-800'
        };
      case 'error':
        return {
          container: 'bg-red-100 border-l-4 border-red-500',
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          text: 'text-red-800'
        };
      default:
        return {
          container: 'bg-blue-100 border-l-4 border-blue-500',
          icon: <Eye className="w-6 h-6 text-blue-500" />,
          text: 'text-blue-800'
        };
    }
  };
  
  const styles = getNotificationStyles();
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-fadeIn">
      <div className={`${styles.container} p-4 rounded-lg shadow-lg flex items-center`}>
        <div className="flex-shrink-0 mr-3">
          {styles.icon}
        </div>
        <div className="flex-1">
          <p className={`${styles.text} font-medium`}>{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Investment Recharge Screenshot</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            ×
          </button>
        </div>
        <div className="p-4 flex justify-center">
          <img 
            src={imageUrl} 
            alt="Investment Recharge Screenshot" 
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

const ApprovalModal: React.FC<ApprovalModalProps> = ({ recharge, isOpen, onClose, onConfirm, isProcessing }) => {
  if (!isOpen || !recharge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Confirm Investment Recharge Approval</h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Are you sure you want to approve this investment recharge?</p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User:</span>
                <span className="text-sm font-medium">{recharge.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Email:</span>
                <span className="text-sm font-medium">{recharge.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment ID:</span>
                <span className="text-sm font-medium">{recharge.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="text-sm font-medium">{recharge.amount} {recharge.currency}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(recharge._id)}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Approve Recharge
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RejectionModal: React.FC<RejectionModalProps> = ({ recharge, isOpen, onClose, onConfirm, isProcessing }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (recharge && reason.trim()) {
      onConfirm(recharge._id, reason.trim());
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen || !recharge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Reject Investment Recharge</h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this investment recharge:</p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User:</span>
                <span className="text-sm font-medium">{recharge.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="text-sm font-medium">{recharge.amount} {recharge.currency}</span>
              </div>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !reason.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Reject Recharge
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RechargesTable: React.FC<RechargesTableProps> = ({ 
  recharges, 
  isLoading, 
  error, 
  onRefresh, 
  onViewScreenshot,
  showActions = false,
  onApprove,
  onReject,
  emptyMessage = "No recharges found",
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading recharges...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
        <button 
          onClick={onRefresh}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (recharges.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recharges.map((recharge) => (
              <tr key={recharge._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{recharge.userName}</div>
                    <div className="text-sm text-gray-500">{recharge.userEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {recharge.paymentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{recharge.amount} {recharge.currency}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(recharge.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    recharge.status === 'approved' ? 'bg-green-100 text-green-800' :
                    recharge.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {recharge.status.charAt(0).toUpperCase() + recharge.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {recharge.screenshotUrl && (
                      <button
                        onClick={() => onViewScreenshot(recharge.screenshotUrl)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="View Screenshot"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    
                    {showActions && onApprove && (
                      <button
                        onClick={() => onApprove(recharge)}
                        className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                        title="Approve Recharge"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    
                    {showActions && onReject && (
                      <button
                        onClick={() => onReject(recharge)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Reject Recharge"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-between items-center mt-4 px-2">
          <div className="text-sm text-gray-500">
            Showing {recharges.length} of {totalCount} recharges
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const InvestmentContent: React.FC = () => {
  const [stats, setStats] = useState<InvestmentStats>({
    totalUsers: 0,
    totalInvestmentWalletBalance: 0,
    totalInvested: 0,
    totalReturns: 0,
    activeInvestments: 0,
    maturedInvestments: 0,
    pendingRecharges: 0,
    totalRechargeAmount: 0
  });
  
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>([]);
  const [plans, setPlans] = useState<InvestmentPlan[]>([
    {
      id: '1',
      name: 'Starter Plan',
      minAmount: 1000,
      maxAmount: 5000,
      dailyROI: 1.2,
      duration: 30,
      totalSubscribers: 245,
      isActive: true
    },
    {
      id: '2',
      name: 'Growth Plan',
      minAmount: 5000,
      maxAmount: 25000,
      dailyROI: 1.8,
      duration: 45,
      totalSubscribers: 156,
      isActive: true
    },
    {
      id: '3',
      name: 'Premium Plan',
      minAmount: 25000,
      maxAmount: 100000,
      dailyROI: 2.5,
      duration: 60,
      totalSubscribers: 89,
      isActive: true
    },
    {
      id: '4',
      name: 'VIP Plan',
      minAmount: 100000,
      maxAmount: 500000,
      dailyROI: 3.2,
      duration: 90,
      totalSubscribers: 34,
      isActive: false
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  
  // Recharges state
  const [pendingRecharges, setPendingRecharges] = useState<InvestmentRecharge[]>([]);
  const [approvedRecharges, setApprovedRecharges] = useState<InvestmentRecharge[]>([]);
  const [rejectedRecharges, setRejectedRecharges] = useState<InvestmentRecharge[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [rechargesLoading, setRechargesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedRecharge, setSelectedRecharge] = useState<InvestmentRecharge | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [processingRechargeId, setProcessingRechargeId] = useState<string | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  useEffect(() => {
    fetchInvestmentData();
    
    // Fetch data based on active tab
    if (activeTab === 'pending') {
      fetchPendingRecharges();
    } else if (activeTab === 'approved') {
      fetchApprovedRecharges();
    } else if (activeTab === 'rejected') {
      fetchRejectedRecharges();
    }
  }, [activeTab]);

  const fetchInvestmentData = async () => {
    setLoading(true);
    try {
      const response = await investmentService.getStats();
      if (response.status === 'success' && response.data) {
        setStats(response.data.summary);
        setActiveInvestments(response.data.activeInvestmentDetails || []);
      }
    } catch (error) {
      console.error('Failed to fetch investment data:', error);
      showNotification('Failed to load investment statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRecharges = async () => {
    setRechargesLoading(true);
    setError(null);
    try {
      const response = await investmentService.getPendingRecharges();
      setPendingRecharges(response.data.recharges);
    } catch (error) {
      console.error('Failed to fetch pending recharges:', error);
      setError('Failed to load pending recharges. Please try again.');
    } finally {
      setRechargesLoading(false);
    }
  };
  
  const fetchApprovedRecharges = async (page: number = 1) => {
    setRechargesLoading(true);
    setError(null);
    try {
      const response = await investmentService.getApprovedRecharges(page);
      setApprovedRecharges(response.data.recharges);
      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch approved recharges:', error);
      setError('Failed to load approved recharges. Please try again.');
    } finally {
      setRechargesLoading(false);
    }
  };
  
  const fetchRejectedRecharges = async (page: number = 1) => {
    setRechargesLoading(true);
    setError(null);
    try {
      const response = await investmentService.getRejectedRecharges(page);
      setRejectedRecharges(response.data.recharges);
      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch rejected recharges:', error);
      setError('Failed to load rejected recharges. Please try again.');
    } finally {
      setRechargesLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleViewScreenshot = (url: string) => {
    setImageModalUrl(url);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setImageModalUrl(null);
  };

  const handleOpenApprovalModal = (recharge: InvestmentRecharge) => {
    setSelectedRecharge(recharge);
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedRecharge(null);
  };

  const handleOpenRejectionModal = (recharge: InvestmentRecharge) => {
    setSelectedRecharge(recharge);
    setIsRejectionModalOpen(true);
  };

  const handleCloseRejectionModal = () => {
    setIsRejectionModalOpen(false);
    setSelectedRecharge(null);
  };

  const handleApproveRecharge = async (rechargeId: string) => {
    try {
      if (!selectedRecharge) return;
      
      setProcessingRechargeId(rechargeId);
      const response = await investmentService.approveRecharge(selectedRecharge.userId, selectedRecharge.paymentId);
      
      // Remove from pending list
      setPendingRecharges(prev => prev.filter(recharge => recharge._id !== rechargeId));
      
      // Close modal and show success message
      setIsApprovalModalOpen(false);
      setSelectedRecharge(null);
      
      // Use the message from the API response
      showNotification(response.message || 'Investment recharge approved successfully!', 'success');
    } catch (error) {
      console.error('Failed to approve recharge:', error);
      showNotification('Failed to approve investment recharge. Please try again.', 'error');
    } finally {
      setProcessingRechargeId(null);
    }
  };

  const handleRejectRecharge = async (rechargeId: string, reason: string) => {
    try {
      if (!selectedRecharge) return;
      
      setProcessingRechargeId(rechargeId);
      const response = await investmentService.rejectRecharge(
        selectedRecharge.userId, 
        selectedRecharge.paymentId,
        reason
      );
      
      // Remove from pending list
      setPendingRecharges(prev => prev.filter(recharge => recharge._id !== rechargeId));
      
      // Close modal and show success message
      setIsRejectionModalOpen(false);
      setSelectedRecharge(null);
      
      // Use the message from the API response
      showNotification(response.message || 'Investment recharge rejected successfully!', 'error');
    } catch (error) {
      console.error('Failed to reject recharge:', error);
      showNotification('Failed to reject investment recharge. Please try again.', 'error');
    } finally {
      setProcessingRechargeId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function no longer needed as it's handled in the RechargesTable component

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      // case 'overview': return <PieChart className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <PieChart className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading investment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Investment Management</h2>
            <p className="text-gray-600 mt-1">Monitor and manage investment plans and recharges</p>
          </div>
          <button 
            onClick={() => {
              fetchInvestmentData();
              if (activeTab === 'pending') {
                fetchPendingRecharges();
              } else if (activeTab === 'approved') {
                fetchApprovedRecharges();
              } else if (activeTab === 'rejected') {
                fetchRejectedRecharges();
              }
            }} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Only show on overview tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalInvested)}</p>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1" />
                  {stats.totalUsers} investors
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Investments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeInvestments}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  {formatCurrency(stats.totalReturns)} returns
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Recharges</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRecharges}</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatCurrency(stats.totalRechargeAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
            {(['overview', 'pending', 'approved', 'rejected'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-sm flex items-center space-x-1 sm:space-x-2 transition-colors min-w-max`}
              >
                {getTabIcon(tab)}
                <span className="capitalize">{tab}</span>
                {tab === 'pending' && (
                  <span className={`${
                    activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  } ml-1 sm:ml-2 py-0.5 px-1.5 sm:px-2 rounded-full text-xs`}>
                    {activeTab === 'overview' ? stats.pendingRecharges : pendingRecharges.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Investment Overview</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Portfolio Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Investments</span>
                      <span className="text-sm font-medium">{stats.activeInvestments}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${stats.activeInvestments / (stats.activeInvestments + stats.maturedInvestments + stats.pendingRecharges) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Matured Investments</span>
                      <span className="text-sm font-medium">{stats.maturedInvestments}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${stats.maturedInvestments / (stats.activeInvestments + stats.maturedInvestments + stats.pendingRecharges) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Recharges</span>
                      <span className="text-sm font-medium">{stats.pendingRecharges}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${stats.pendingRecharges / (stats.activeInvestments + stats.maturedInvestments + stats.pendingRecharges) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Returns Generated</span>
                      <span className="text-sm font-medium text-green-600">{formatCurrency(stats.totalReturns)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Wallet Balance</span>
                      <span className="text-sm font-medium">{formatCurrency(stats.totalInvestmentWalletBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Investors</span>
                      <span className="text-sm font-medium">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Investment</span>
                      <span className="text-sm font-medium">
                        {stats.totalInvested && stats.totalUsers 
                          ? formatCurrency(stats.totalInvested / stats.totalUsers) 
                          : '₹0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Active Investments Table */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Investments</h3>
                {activeInvestments.length > 0 ? (
                  <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maturity Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Return</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeInvestments.map((investment) => (
                          <tr key={investment.investmentId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-sm font-medium text-gray-900">{investment.userName}</div>
                                <div className="text-xs text-gray-500">{investment.userEmail}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {investment.investmentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(investment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(investment.startDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(investment.maturityDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="mr-2 text-xs">{investment.daysCompleted}/{investment.totalDays}</div>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${(investment.daysCompleted / investment.totalDays) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatCurrency(investment.expectedReturn)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500">No active investments found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Pending Investment Recharges</h3>
                <button 
                  onClick={fetchPendingRecharges}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
              
              <RechargesTable 
                recharges={pendingRecharges}
                isLoading={rechargesLoading}
                error={error}
                onRefresh={fetchPendingRecharges}
                onViewScreenshot={handleViewScreenshot}
                showActions={true}
                onApprove={handleOpenApprovalModal}
                onReject={handleOpenRejectionModal}
                emptyMessage="No pending investment recharges found"
              />
            </div>
          )}

          {activeTab === 'approved' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Approved Investment Recharges</h3>
                <button 
                  onClick={() => fetchApprovedRecharges(currentPage)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
              
              <RechargesTable 
                recharges={approvedRecharges}
                isLoading={rechargesLoading}
                error={error}
                onRefresh={() => fetchApprovedRecharges(currentPage)}
                onViewScreenshot={handleViewScreenshot}
                emptyMessage="No approved investment recharges found"
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={(page) => fetchApprovedRecharges(page)}
              />
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Rejected Investment Recharges</h3>
                <button 
                  onClick={() => fetchRejectedRecharges(currentPage)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
              
              <RechargesTable 
                recharges={rejectedRecharges}
                isLoading={rechargesLoading}
                error={error}
                onRefresh={() => fetchRejectedRecharges(currentPage)}
                onViewScreenshot={handleViewScreenshot}
                emptyMessage="No rejected investment recharges found"
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={(page) => fetchRejectedRecharges(page)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal 
        imageUrl={imageModalUrl}
        isOpen={isImageModalOpen}
        onClose={handleCloseImageModal}
      />

      {/* Approval Modal */}
      <ApprovalModal 
        recharge={selectedRecharge}
        isOpen={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        onConfirm={handleApproveRecharge}
        isProcessing={processingRechargeId === selectedRecharge?._id}
      />

      {/* Rejection Modal */}
      <RejectionModal 
        recharge={selectedRecharge}
        isOpen={isRejectionModalOpen}
        onClose={handleCloseRejectionModal}
        onConfirm={handleRejectRecharge}
        isProcessing={processingRechargeId === selectedRecharge?._id}
      />

      {/* Success/Error Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
};

export default InvestmentContent; 