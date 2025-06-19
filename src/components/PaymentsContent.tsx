import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, X, AlertCircle, Eye, CreditCard, CheckCircle, FileText, Clock, XCircle } from 'lucide-react';
import { paymentsService, Payment, ApprovedPaymentsResponse, PaymentsResponse } from '../api';

interface PaymentImageModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ApprovalModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, paymentId: string) => void;
  isProcessing: boolean;
}

interface RejectionModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, paymentId: string, reason: string) => void;
  isProcessing: boolean;
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
      // Auto-hide the notification after 5 seconds
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

const PaymentImageModal: React.FC<PaymentImageModalProps> = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Payment Screenshot</h2>
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
            alt="Payment Screenshot" 
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

const ApprovalModal: React.FC<ApprovalModalProps> = ({ payment, isOpen, onClose, onConfirm, isProcessing }) => {
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Confirm Payment Approval</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Are you sure you want to approve this payment?</p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User:</span>
                <span className="text-sm font-medium">{payment.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User ID:</span>
                <span className="text-sm font-medium">{payment.userIdCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment ID:</span>
                <span className="text-sm font-medium">{payment.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="text-sm font-medium">{payment.amount} {payment.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Purpose:</span>
                <span className="text-sm font-medium">{payment.purpose.replace('_', ' ').toUpperCase()}</span>
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
              onClick={() => onConfirm(payment.userId, payment.paymentId)}
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
                  Approve Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RejectionModal: React.FC<RejectionModalProps> = ({ payment, isOpen, onClose, onConfirm, isProcessing }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (payment && reason.trim()) {
      onConfirm(payment.userId, payment.paymentId, reason.trim());
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Reject Payment</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this payment:</p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User:</span>
                <span className="text-sm font-medium">{payment.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment ID:</span>
                <span className="text-sm font-medium">{payment.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="text-sm font-medium">{payment.amount} {payment.currency}</span>
              </div>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason (e.g., Invalid payment details, Insufficient proof, etc.)"
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
                  Reject Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentsContent: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
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
    fetchPayments();
  }, [activeTab]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let paymentsData: Payment[];
      
      if (activeTab === 'approved') {
        const response: ApprovedPaymentsResponse = await paymentsService.getApprovedPayments();
        // Approved payments API returns data.approvedPayments with status "verified"
        paymentsData = response?.data?.approvedPayments || [];
        // Normalize the status from "verified" to "approved" for consistency
        paymentsData = paymentsData.map((payment: Payment) => ({
          ...payment,
          status: payment.status === 'verified' ? 'approved' : payment.status
        }));
      } else {
        const response: PaymentsResponse = await paymentsService.getPayments();
        // Regular payments API returns data.payments
        paymentsData = response?.data?.payments || [];
      }
      
      setPayments(paymentsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch payments. Please try again later.');
      console.error('Payments error:', err);
      // Set empty array on error to prevent undefined filter errors
      setPayments([]);
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

  const handleViewScreenshot = (url: string) => {
    setImageModalUrl(url);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setImageModalUrl(null);
  };

  const handleOpenApprovalModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
  };

  const handleOpenRejectionModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsRejectionModalOpen(true);
  };

  const handleCloseRejectionModal = () => {
    setIsRejectionModalOpen(false);
  };

  const handleApprovePayment = async (userId: string, paymentId: string) => {
    try {
      setProcessingPaymentId(paymentId);
      await paymentsService.approvePayment(userId, paymentId);
      
      // Update local state to reflect the change
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment._id === selectedPayment?._id 
            ? { ...payment, status: 'approved' } 
            : payment
        )
      );
      
      // Close modal and show success message
      setIsApprovalModalOpen(false);
      setSelectedPayment(null);
      
      // Show success notification instead of alert
      showNotification(
        `Payment ${paymentId} has been successfully approved!`, 
        'success'
      );
    } catch (err) {
      console.error('Failed to approve payment:', err);
      showNotification('Failed to approve payment. Please try again.', 'error');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleRejectPayment = async (userId: string, paymentId: string, reason: string) => {
    try {
      setProcessingPaymentId(paymentId);
      await paymentsService.rejectPayment(userId, paymentId, reason);
      
      // Update local state to reflect the change
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment._id === selectedPayment?._id 
            ? { ...payment, status: 'rejected' } 
            : payment
        )
      );
      
      // Close modal and show success message
      setIsRejectionModalOpen(false);
      setSelectedPayment(null);
      
      showNotification(
        `Payment ${paymentId} has been rejected successfully!`, 
        'error'
      );
    } catch (err) {
      console.error('Failed to reject payment:', err);
      showNotification('Failed to reject payment. Please try again.', 'error');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: 'rejected' | 'pending') => {
    try {
      setProcessingPaymentId(paymentId);
      await paymentsService.updatePaymentStatus(paymentId, newStatus);
      
      // Update local state to reflect the change
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment._id === paymentId 
            ? { ...payment, status: newStatus } 
            : payment
        )
      );
      
      showNotification(`Payment ${newStatus} successfully!`, newStatus === 'rejected' ? 'error' : 'info');
    } catch (err) {
      console.error('Failed to update payment status:', err);
      showNotification('Failed to update payment status. Please try again.', 'error');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const filteredPayments = (payments || []).filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.userIdCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For tab-based filtering
    if (activeTab !== 'all') {
      const matchesTab = payment.status === activeTab;
      return matchesSearch && matchesTab;
    }
    
    // For dropdown filter (only when on 'all' tab)
    const matchesFilter = selectedFilter === 'all' || payment.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    if (!payments || payments.length === 0) return 0;
    if (tab === 'all') return payments.length;
    return payments.filter(payment => payment.status === tab).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments data...</p>
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
          onClick={() => fetchPayments()}
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
            <h2 className="text-2xl font-bold text-gray-900">Payments Management</h2>
            <p className="text-gray-600 mt-1">Manage and process all payment transactions</p>
          </div>
          <button 
            onClick={() => fetchPayments()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Refresh Payments</span>
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
                  {tab === 'all' ? 'All' : tab} Payments
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
              placeholder="Search by name, email, ID..."
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

      {/* Payments Table - Mobile Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                      <div className="text-sm text-gray-500">{payment.userEmail}</div>
                      <div className="text-xs text-gray-400">{payment.userIdCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.paymentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.amount} {payment.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.purpose.replace('_', ' ').toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {payment.screenshotUrl && (
                        <button
                          onClick={() => handleViewScreenshot(payment.screenshotUrl)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="View Screenshot"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleOpenApprovalModal(payment)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="Approve Payment"
                            disabled={processingPaymentId === payment._id}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenRejectionModal(payment)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Reject Payment"
                            disabled={processingPaymentId === payment._id}
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No {activeTab === 'all' ? '' : activeTab} payments found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

                 {/* Mobile Card View */}
         <div className="lg:hidden">
           {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
             <div key={payment._id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
               <div className="flex items-start justify-between mb-3">
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center space-x-2 mb-1">
                     <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                       {payment.userName.charAt(0).toUpperCase()}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium text-gray-900 truncate">{payment.userName}</p>
                       <p className="text-xs text-gray-500 truncate">{payment.userEmail}</p>
                     </div>
                   </div>
                   <p className="text-xs text-gray-400">{payment.userIdCode}</p>
                 </div>
                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                   {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                 </span>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <div>
                   <p className="text-xs text-gray-500">Amount</p>
                   <p className="text-sm font-medium text-gray-900">{payment.amount} {payment.currency}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-500">Payment ID</p>
                   <p className="text-sm text-gray-900">{payment.paymentId}</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <div>
                   <p className="text-xs text-gray-500">Purpose</p>
                   <p className="text-sm text-gray-900">{payment.purpose.replace('_', ' ').toUpperCase()}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-500">Date</p>
                   <p className="text-sm text-gray-900">{formatDate(payment.date)}</p>
                 </div>
               </div>
               
               <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                 <div className="flex items-center space-x-2">
                   {payment.screenshotUrl && (
                     <button
                       onClick={() => handleViewScreenshot(payment.screenshotUrl)}
                       className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                       title="View Screenshot"
                     >
                       <Eye className="w-4 h-4" />
                       <span className="text-xs">View</span>
                     </button>
                   )}
                   
                   {payment.status === 'pending' && (
                     <>
                       <button
                         onClick={() => handleOpenApprovalModal(payment)}
                         className="flex items-center space-x-1 text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                         title="Approve Payment"
                         disabled={processingPaymentId === payment._id}
                       >
                         <Check className="w-4 h-4" />
                         <span className="text-xs">Approve</span>
                       </button>
                       <button
                         onClick={() => handleOpenRejectionModal(payment)}
                         className="flex items-center space-x-1 text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                         title="Reject Payment"
                         disabled={processingPaymentId === payment._id}
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
               <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <p>No {activeTab === 'all' ? '' : activeTab} payments found matching your search criteria</p>
             </div>
           )}
         </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {filteredPayments.length > 0 ? '1' : '0'} to {filteredPayments.length} of {(payments || []).length} {activeTab === 'all' ? '' : activeTab} payments
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

      {/* Image Modal */}
      <PaymentImageModal 
        imageUrl={imageModalUrl}
        isOpen={isImageModalOpen}
        onClose={handleCloseImageModal}
      />

      {/* Approval Confirmation Modal */}
      <ApprovalModal 
        payment={selectedPayment}
        isOpen={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        onConfirm={handleApprovePayment}
        isProcessing={processingPaymentId === selectedPayment?._id}
      />

      {/* Rejection Modal */}
      <RejectionModal 
        payment={selectedPayment}
        isOpen={isRejectionModalOpen}
        onClose={handleCloseRejectionModal}
        onConfirm={handleRejectPayment}
        isProcessing={processingPaymentId === selectedPayment?._id}
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

export default PaymentsContent; 