import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, X, AlertCircle, Eye, CheckCircle, FileText, Clock, XCircle, DollarSign, CreditCard, Building } from 'lucide-react';
import { withdrawalService, WithdrawalItem } from '../api';

interface ApprovalModalProps {
  withdrawal: WithdrawalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, withdrawalId: string, transactionId: string) => void;
  isProcessing: boolean;
}

interface RejectionModalProps {
  withdrawal: WithdrawalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (withdrawalId: string, reason: string) => void;
  isProcessing: boolean;
}

interface PaymentDetailsModalProps {
  withdrawal: WithdrawalItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

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

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ withdrawal, isOpen, onClose }) => {
  if (!isOpen || !withdrawal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">User:</span>
              <span className="text-sm font-medium">{withdrawal.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">User ID:</span>
              <span className="text-sm font-medium">{withdrawal.userId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Amount:</span>
              <span className="text-sm font-medium">₹{withdrawal.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payment Method:</span>
              <span className="text-sm font-medium capitalize">{withdrawal.paymentMethod}</span>
            </div>
            
            <hr className="my-4" />
            
            {withdrawal.paymentMethod === 'bank' && withdrawal.paymentDetails.bankDetails && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Bank Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Account Holder:</span>
                    <span className="text-sm font-medium">{withdrawal.paymentDetails.bankDetails.accountHolderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Bank Name:</span>
                    <span className="text-sm font-medium">{withdrawal.paymentDetails.bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Account Number:</span>
                    <span className="text-sm font-medium">{withdrawal.paymentDetails.bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">IFSC Code:</span>
                    <span className="text-sm font-medium">{withdrawal.paymentDetails.bankDetails.ifscCode}</span>
                  </div>
                </div>
              </div>
            )}
            
            {withdrawal.paymentMethod === 'upi' && withdrawal.paymentDetails.upiId && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">UPI Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">UPI ID:</span>
                    <span className="text-sm font-medium">{withdrawal.paymentDetails.upiId}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ApprovalModal: React.FC<ApprovalModalProps> = ({ withdrawal, isOpen, onClose, onConfirm, isProcessing }) => {
  const [transactionId, setTransactionId] = useState('');

  const handleSubmit = () => {
    if (withdrawal && transactionId.trim()) {
      onConfirm(withdrawal.userId, withdrawal._id, transactionId.trim());
    }
  };

  const handleClose = () => {
    setTransactionId('');
    onClose();
  };

  if (!isOpen || !withdrawal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Approve Withdrawal</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Please provide transaction details to approve this withdrawal:</p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User:</span>
                <span className="text-sm font-medium">{withdrawal.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User ID:</span>
                <span className="text-sm font-medium">{withdrawal.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="text-sm font-medium">₹{withdrawal.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment Method:</span>
                <span className="text-sm font-medium capitalize">{withdrawal.paymentMethod}</span>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID (e.g., TXN123456789)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isProcessing}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the transaction ID from your payment gateway or bank
              </p>
            </div>
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
              disabled={isProcessing || !transactionId.trim()}
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
                  Approve Withdrawal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RejectionModal: React.FC<RejectionModalProps> = ({ withdrawal, isOpen, onClose, onConfirm, isProcessing }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (withdrawal && reason.trim()) {
      onConfirm(withdrawal._id, reason.trim());
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen || !withdrawal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Reject Withdrawal</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this withdrawal:</p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User:</span>
                <span className="text-sm font-medium">{withdrawal.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="text-sm font-medium">₹{withdrawal.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment Method:</span>
                <span className="text-sm font-medium capitalize">{withdrawal.paymentMethod}</span>
              </div>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason (e.g., Insufficient funds, Invalid bank details, etc.)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              disabled={isProcessing}
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
                  Reject Withdrawal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WithdrawalContent: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalItem | null>(null);
  const [isPaymentDetailsModalOpen, setIsPaymentDetailsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState<string | null>(null);
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
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await withdrawalService.getWithdrawals();
      setWithdrawals(response.data.withdrawals);
      setError(null);
    } catch (err) {
      setError('Failed to fetch withdrawals. Please try again later.');
      console.error('Withdrawals error:', err);
      setWithdrawals([]);
    } finally {
      setLoading(false);
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

  const handleViewPaymentDetails = (withdrawal: WithdrawalItem) => {
    setSelectedWithdrawal(withdrawal);
    setIsPaymentDetailsModalOpen(true);
  };

  const handleClosePaymentDetailsModal = () => {
    setIsPaymentDetailsModalOpen(false);
    setSelectedWithdrawal(null);
  };

  const handleOpenApprovalModal = (withdrawal: WithdrawalItem) => {
    setSelectedWithdrawal(withdrawal);
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedWithdrawal(null);
  };

  const handleOpenRejectionModal = (withdrawal: WithdrawalItem) => {
    setSelectedWithdrawal(withdrawal);
    setIsRejectionModalOpen(true);
  };

  const handleCloseRejectionModal = () => {
    setIsRejectionModalOpen(false);
    setSelectedWithdrawal(null);
  };

  const handleApproveWithdrawal = async (userId: string, withdrawalId: string, transactionId: string) => {
    try {
      setProcessingWithdrawalId(withdrawalId);
      await withdrawalService.approveWithdrawal(userId, withdrawalId, transactionId);
      
      setWithdrawals(prevWithdrawals => 
        prevWithdrawals.map(withdrawal => 
          withdrawal._id === withdrawalId 
            ? { ...withdrawal, status: 'approved' } 
            : withdrawal
        )
      );
      
      setIsApprovalModalOpen(false);
      setSelectedWithdrawal(null);
      
      showNotification(
        'Withdrawal has been successfully approved!', 
        'success'
      );
    } catch (err) {
      console.error('Failed to approve withdrawal:', err);
      showNotification('Failed to approve withdrawal. Please try again.', 'error');
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string, reason: string) => {
    try {
      setProcessingWithdrawalId(withdrawalId);
      await withdrawalService.rejectWithdrawal(withdrawalId, reason);
      
      setWithdrawals(prevWithdrawals => 
        prevWithdrawals.map(withdrawal => 
          withdrawal._id === withdrawalId 
            ? { ...withdrawal, status: 'rejected' } 
            : withdrawal
        )
      );
      
      setIsRejectionModalOpen(false);
      setSelectedWithdrawal(null);
      
      showNotification(
        'Withdrawal has been rejected successfully!', 
        'error'
      );
    } catch (err) {
      console.error('Failed to reject withdrawal:', err);
      showNotification('Failed to reject withdrawal. Please try again.', 'error');
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  const filteredWithdrawals = (withdrawals || []).filter(withdrawal => {
    const matchesSearch = withdrawal.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        withdrawal.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        withdrawal.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        withdrawal.amount.toString().includes(searchTerm);
    
    const matchesFilter = activeTab === 'all' || withdrawal.status === activeTab;
    const matchesDropdownFilter = selectedFilter === 'all' || withdrawal.status === selectedFilter;
    
    return matchesSearch && matchesFilter && matchesDropdownFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'all': return <FileText className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTabCount = (tab: TabType) => {
    if (!withdrawals || withdrawals.length === 0) return 0;
    if (tab === 'all') return withdrawals.length;
    return withdrawals.filter(withdrawal => withdrawal.status === tab).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank': return <Building className="w-4 h-4" />;
      case 'upi': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading withdrawals data...</p>
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
          onClick={() => fetchWithdrawals()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Withdrawal Management</h2>
            <p className="text-gray-600 mt-1">Manage and process withdrawal requests</p>
          </div>
          <button 
            onClick={() => fetchWithdrawals()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span>Refresh Withdrawals</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
            {(['all', 'pending', 'approved', 'rejected'] as TabType[]).map((tab) => (
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
                <span className="capitalize">
                  {tab === 'all' ? 'All' : tab} Withdrawals
                </span>
                <span className={`${
                  activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                } ml-1 sm:ml-2 py-0.5 px-1.5 sm:px-2 rounded-full text-xs`}>
                  {getTabCount(tab)}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by name, email, ID or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {activeTab === 'all' && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawals Table - Mobile Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{withdrawal.userName}</div>
                      <div className="text-sm text-gray-500">{withdrawal.userEmail}</div>
                      <div className="text-xs text-gray-400">{withdrawal.userId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{withdrawal.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(withdrawal.paymentMethod)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{withdrawal.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(withdrawal.requestDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewPaymentDetails(withdrawal)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="View Payment Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {withdrawal.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleOpenApprovalModal(withdrawal)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="Approve Withdrawal"
                            disabled={processingWithdrawalId === withdrawal._id}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenRejectionModal(withdrawal)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Reject Withdrawal"
                            disabled={processingWithdrawalId === withdrawal._id}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No {activeTab === 'all' ? '' : activeTab} withdrawals found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((withdrawal) => (
            <div key={withdrawal._id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {withdrawal.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{withdrawal.userName}</p>
                      <p className="text-xs text-gray-500 truncate">{withdrawal.userEmail}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{withdrawal.userId}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                  {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-sm font-medium text-gray-900">₹{withdrawal.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <div className="flex items-center">
                    {getPaymentMethodIcon(withdrawal.paymentMethod)}
                    <span className="ml-1 text-sm text-gray-900 capitalize">{withdrawal.paymentMethod}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-xs text-gray-500">Request Date</p>
                <p className="text-sm text-gray-900">{formatDate(withdrawal.requestDate)}</p>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewPaymentDetails(withdrawal)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="View Payment Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">Details</span>
                  </button>
                  
                  {withdrawal.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleOpenApprovalModal(withdrawal)}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Approve Withdrawal"
                        disabled={processingWithdrawalId === withdrawal._id}
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-xs">Approve</span>
                      </button>
                      <button
                        onClick={() => handleOpenRejectionModal(withdrawal)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Reject Withdrawal"
                        disabled={processingWithdrawalId === withdrawal._id}
                      >
                        <X className="w-4 h-4" />
                        <span className="text-xs">Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-gray-500">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>No {activeTab === 'all' ? '' : activeTab} withdrawals found matching your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {filteredWithdrawals.length > 0 ? '1' : '0'} to {filteredWithdrawals.length} of {(withdrawals || []).length} {activeTab === 'all' ? '' : activeTab} withdrawals
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors" disabled={true}>
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors" disabled={true}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      <PaymentDetailsModal 
        withdrawal={selectedWithdrawal}
        isOpen={isPaymentDetailsModalOpen}
        onClose={handleClosePaymentDetailsModal}
      />

      {/* Approval Confirmation Modal */}
      <ApprovalModal 
        withdrawal={selectedWithdrawal}
        isOpen={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        onConfirm={handleApproveWithdrawal}
        isProcessing={processingWithdrawalId === selectedWithdrawal?._id}
      />

      {/* Rejection Modal */}
      <RejectionModal 
        withdrawal={selectedWithdrawal}
        isOpen={isRejectionModalOpen}
        onClose={handleCloseRejectionModal}
        onConfirm={handleRejectWithdrawal}
        isProcessing={processingWithdrawalId === selectedWithdrawal?._id}
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

export default WithdrawalContent;