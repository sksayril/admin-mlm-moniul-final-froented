import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, X, AlertCircle, Eye, CheckCircle, FileText, Clock, XCircle, Key, Calendar, Plus } from 'lucide-react';
import { tpinService, PendingTpinRequest, TpinHistoryItem } from '../api';

interface ApprovalModalProps {
  tpinRequest: PendingTpinRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, tpinId: string) => void;
  isProcessing: boolean;
}

interface RejectionModalProps {
  tpinRequest: PendingTpinRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, tpinId: string, reason: string) => void;
  isProcessing: boolean;
}

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

interface GenerateTpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, quantity: number, reason: string) => void;
  isProcessing: boolean;
}

type TabType = 'pending' | 'history' | 'approved' | 'rejected' | 'used';

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

const ApprovalModal: React.FC<ApprovalModalProps> = ({ tpinRequest, isOpen, onClose, onConfirm, isProcessing }) => {
  if (!isOpen || !tpinRequest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Confirm TPIN Approval</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Are you sure you want to approve this TPIN?</p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User:</span>
                <span className="text-sm font-medium">{tpinRequest.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User ID:</span>
                <span className="text-sm font-medium">{tpinRequest.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">TPIN Code:</span>
                <span className="text-sm font-medium">{tpinRequest.tpin.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Purchase Date:</span>
                <span className="text-sm font-medium">{new Date(tpinRequest.tpin.purchaseDate).toLocaleDateString()}</span>
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
              onClick={() => onConfirm(tpinRequest.userId, tpinRequest.tpin._id)}
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
                  Approve TPIN
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RejectionModal: React.FC<RejectionModalProps> = ({ tpinRequest, isOpen, onClose, onConfirm, isProcessing }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (tpinRequest && reason.trim()) {
      onConfirm(tpinRequest.userId, tpinRequest.tpin._id, reason.trim());
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen || !tpinRequest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Reject TPIN</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this TPIN:</p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User:</span>
                <span className="text-sm font-medium">{tpinRequest.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">TPIN Code:</span>
                <span className="text-sm font-medium">{tpinRequest.tpin.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Purchase Date:</span>
                <span className="text-sm font-medium">{new Date(tpinRequest.tpin.purchaseDate).toLocaleDateString()}</span>
              </div>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason (e.g., Invalid payment, Duplicate request, etc.)"
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
                  Reject TPIN
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GenerateTpinModal: React.FC<GenerateTpinModalProps> = ({ isOpen, onClose, onConfirm, isProcessing }) => {
  const [userId, setUserId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (userId.trim() && quantity > 0 && reason.trim()) {
      onConfirm(userId.trim(), quantity, reason.trim());
    }
  };

  const handleClose = () => {
    setUserId('');
    setQuantity(1);
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Generate TPIN</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6 space-y-4">
            <p className="text-gray-600">Generate new TPINs for a user:</p>
            
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID (e.g., LIFE10001)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for generating TPINs..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
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
              disabled={isProcessing || !userId.trim() || quantity < 1 || !reason.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Transfer TPINs
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TpinContent: React.FC = () => {
  const [tpinRequests, setTpinRequests] = useState<PendingTpinRequest[]>([]);
  const [tpinHistory, setTpinHistory] = useState<TpinHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedTpinRequest, setSelectedTpinRequest] = useState<PendingTpinRequest | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [processingTpinId, setProcessingTpinId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'pending') {
        const response = await tpinService.getPendingTpins();
        const pendingRequests = response?.data?.pendingRequests || [];
        setTpinRequests(pendingRequests);
      } else {
        const response = await tpinService.getTpinHistory();
        const historyData = response?.data?.tpins || [];
        setTpinHistory(historyData);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch TPIN data. Please try again later.');
      console.error('TPIN data error:', err);
      setTpinRequests([]);
      setTpinHistory([]);
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

  const handleOpenApprovalModal = (tpinRequest: PendingTpinRequest) => {
    setSelectedTpinRequest(tpinRequest);
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
  };

  const handleOpenRejectionModal = (tpinRequest: PendingTpinRequest) => {
    setSelectedTpinRequest(tpinRequest);
    setIsRejectionModalOpen(true);
  };

  const handleCloseRejectionModal = () => {
    setIsRejectionModalOpen(false);
  };

  const handleOpenGenerateModal = () => {
    setIsGenerateModalOpen(true);
  };

  const handleCloseGenerateModal = () => {
    setIsGenerateModalOpen(false);
  };

  const handleApproveTpin = async (userId: string, tpinId: string) => {
    try {
      setProcessingTpinId(tpinId);
      await tpinService.approveTpin(userId, tpinId);
      
      // Update local state to reflect the change
      setTpinRequests(prevRequests => 
        prevRequests.filter(request => request.tpin._id !== tpinId)
      );
      
      // Close modal and show success message
      setIsApprovalModalOpen(false);
      setSelectedTpinRequest(null);
      
      showNotification(
        `TPIN has been successfully approved!`, 
        'success'
      );
    } catch (err) {
      console.error('Failed to approve TPIN:', err);
      showNotification('Failed to approve TPIN. Please try again.', 'error');
    } finally {
      setProcessingTpinId(null);
    }
  };

  const handleRejectTpin = async (userId: string, tpinId: string, reason: string) => {
    try {
      setProcessingTpinId(tpinId);
      await tpinService.rejectTpin(userId, tpinId, reason);
      
      // Update local state to reflect the change
      setTpinRequests(prevRequests => 
        prevRequests.filter(request => request.tpin._id !== tpinId)
      );
      
      // Close modal and show success message
      setIsRejectionModalOpen(false);
      setSelectedTpinRequest(null);
      
      showNotification(
        `TPIN has been rejected successfully!`, 
        'error'
      );
    } catch (err) {
      console.error('Failed to reject TPIN:', err);
      showNotification('Failed to reject TPIN. Please try again.', 'error');
    } finally {
      setProcessingTpinId(null);
    }
  };

  const handleGenerateTpin = async (userId: string, quantity: number, reason: string) => {
    try {
      setIsGenerating(true);
      const response = await tpinService.generateTpin(userId, quantity, reason);
      
      // Close modal and show success message
      setIsGenerateModalOpen(false);
      
      showNotification(
        `${quantity} TPIN(s) generated successfully for user ${userId}!`, 
        'success'
      );

      // Refresh data to show the new TPINs
      await fetchData();
    } catch (err) {
      console.error('Failed to generate TPIN:', err);
      showNotification('Failed to generate TPIN. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFilteredData = () => {
    if (activeTab === 'pending') {
      return (tpinRequests || []).filter(request => {
        const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.tpin.code.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    } else {
      return (tpinHistory || []).filter(tpin => {
        const matchesSearch = tpin.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tpin.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tpin.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tpin.tpinCode.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by tab type
        if (activeTab === 'history') return matchesSearch;
        if (activeTab === 'approved') return matchesSearch && tpin.status === 'approved';
        if (activeTab === 'rejected') return matchesSearch && tpin.status === 'rejected';
        if (activeTab === 'used') return matchesSearch && tpin.isUsed === true;
        
        return matchesSearch;
      });
    }
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'history': return <Calendar className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'used': return <Key className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTabCount = (tab: TabType) => {
    if (tab === 'pending') {
      return (tpinRequests || []).length;
    } else {
      const history = tpinHistory || [];
      if (tab === 'history') return history.length;
      if (tab === 'approved') return history.filter(tpin => tpin.status === 'approved').length;
      if (tab === 'rejected') return history.filter(tpin => tpin.status === 'rejected').length;
      if (tab === 'used') return history.filter(tpin => tpin.isUsed === true).length;
    }
    return 0;
  };

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

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading TPIN data...</p>
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
          onClick={() => fetchData()}
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
            <h2 className="text-2xl font-bold text-gray-900">TPIN Management</h2>
            <p className="text-gray-600 mt-1">Manage and process TPIN requests and history</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={handleOpenGenerateModal} 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Transfer TPIN</span>
            </button>
            <button 
              onClick={() => fetchData()} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Key className="w-4 h-4" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
          </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
            {(['pending', 'history', 'approved', 'rejected', 'used'] as TabType[]).map((tab) => (
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
                <span className="capitalize">{tab} TPINs</span>
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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, ID or TPIN code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* TPIN Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TPIN Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                {activeTab !== 'pending' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activation Date</th>
                )}
                {activeTab === 'rejected' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejection Reason</th>
                )}
                {activeTab === 'pending' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? filteredData.map((item) => {
                const isHistoryItem = 'tpinCode' in item;
                const tpinCode = isHistoryItem ? (item as TpinHistoryItem).tpinCode : (item as PendingTpinRequest).tpin.code;
                const status = isHistoryItem ? (item as TpinHistoryItem).status : 'pending';
                const isUsed = isHistoryItem ? (item as TpinHistoryItem).isUsed : false;
                const purchaseDate = isHistoryItem ? (item as TpinHistoryItem).purchaseDate : (item as PendingTpinRequest).tpin.purchaseDate;
                const activationDate = isHistoryItem ? (item as TpinHistoryItem).activationDate : undefined;
                const rejectionReason = isHistoryItem ? (item as TpinHistoryItem).rejectionReason : undefined;
                const itemId = isHistoryItem ? (item as TpinHistoryItem)._id : (item as PendingTpinRequest).tpin._id;

                return (
                  <tr key={itemId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{item.userName}</div>
                        <div className="text-sm text-gray-500">{item.userEmail}</div>
                        <div className="text-xs text-gray-400">
                          {isHistoryItem ? (item as TpinHistoryItem).userIdCode : item.userId}
                      </div>
                    </div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tpinCode}</div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isUsed ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isUsed ? 'Used' : 'Unused'}
                    </span>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(purchaseDate)}
                    </td>
                    {activeTab !== 'pending' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activationDate ? formatDate(activationDate) : '-'}
                      </td>
                    )}
                    {activeTab === 'rejected' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rejectionReason || '-'}
                      </td>
                    )}
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleOpenApprovalModal(item as PendingTpinRequest)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="Approve TPIN"
                            disabled={processingTpinId === itemId}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenRejectionModal(item as PendingTpinRequest)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Reject TPIN"
                            disabled={processingTpinId === itemId}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={activeTab === 'pending' ? 5 : activeTab === 'rejected' ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                    No {activeTab} TPINs found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {filteredData.length > 0 ? '1' : '0'} to {filteredData.length} of {filteredData.length} {activeTab} TPINs
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

      {/* Approval Confirmation Modal */}
      <ApprovalModal 
        tpinRequest={selectedTpinRequest}
        isOpen={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        onConfirm={handleApproveTpin}
        isProcessing={processingTpinId === selectedTpinRequest?.tpin._id}
      />

      {/* Rejection Modal */}
      <RejectionModal 
        tpinRequest={selectedTpinRequest}
        isOpen={isRejectionModalOpen}
        onClose={handleCloseRejectionModal}
        onConfirm={handleRejectTpin}
        isProcessing={processingTpinId === selectedTpinRequest?.tpin._id}
      />

      {/* Generate TPIN Modal */}
      <GenerateTpinModal 
        isOpen={isGenerateModalOpen}
        onClose={handleCloseGenerateModal}
        onConfirm={handleGenerateTpin}
        isProcessing={isGenerating}
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

export default TpinContent;