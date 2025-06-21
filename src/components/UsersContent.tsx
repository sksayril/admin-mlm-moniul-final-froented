import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Eye, UserCheck, AlertCircle, MoreHorizontal, Lock, Copy, Check, UserX, Shield, Users, UserMinus } from 'lucide-react';
import { usersService, User, UserPasswordResponse, UserDeactivateResponse, BlockedUser, BlockedUsersResponse } from '../api';

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (userId: string, reason: string) => void;
  isProcessing: boolean;
}

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
  
  if (!isVisible) return null;
  
  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-100 border-l-4 border-green-500',
          icon: <Check className="w-5 h-5 text-green-500" />,
          text: 'text-green-800'
        };
      case 'error':
        return {
          container: 'bg-red-100 border-l-4 border-red-500',
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          text: 'text-red-800'
        };
      default:
        return {
          container: 'bg-blue-100 border-l-4 border-blue-500',
          icon: <Eye className="w-5 h-5 text-blue-500" />,
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
          ×
        </button>
      </div>
    </div>
  );
};

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, userId, userName }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchPassword = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await usersService.getUserPassword(userId);
      setPassword(response.data.user.originalPassword);
    } catch (err) {
      console.error('Failed to fetch password:', err);
      setError('Failed to fetch user password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchPassword();
    } else {
      setPassword(null);
      setError(null);
      setCopied(false);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">User Password</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">User Name</p>
            <p className="font-medium text-gray-900">{userName}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">User ID</p>
            <p className="font-medium text-gray-900">{userId}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Original Password</p>
              {password && (
                <button
                  onClick={() => copyToClipboard(password)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs transition-colors ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Copy password"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>
            
            {loading && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                  <span className="text-sm text-gray-600">Loading password...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
                <button 
                  onClick={fetchPassword}
                  className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            
            {password && !loading && !error && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-gray-900 select-all">
                    {password}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click the copy button to copy the password to clipboard
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDetailModal: React.FC<UserModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            ×
          </button>
        </div>
        
        <div className="px-6 py-6">
          {/* Personal Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium">{user.userId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <p className={`inline-flex px-2 py-1 rounded-full text-sm ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rank</p>
                <p className="font-medium">{user.rank}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Team Size</p>
                <p className="font-medium">{user.teamSize}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Date</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Income Wallet */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Wallet</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-lg font-semibold text-blue-600">₹{user.incomeWallet.balance.toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Self Income</p>
                  <p className="text-lg font-semibold text-blue-600">₹{user.incomeWallet.selfIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Direct Income</p>
                  <p className="text-lg font-semibold text-blue-600">₹{user.incomeWallet.directIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Matrix Income</p>
                  <p className="text-lg font-semibold text-blue-600">₹{user.incomeWallet.matrixIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Daily Team Income</p>
                  <p className="text-lg font-semibold text-blue-600">₹{user.incomeWallet.dailyTeamIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Rank Rewards</p>
                  <p className="text-lg font-semibold text-blue-600">₹{user.incomeWallet.rankRewards.toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">FX Trading Income</p>
                  <p className="text-lg font-semibold text-blue-600">₹{user.incomeWallet.fxTradingIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">{new Date(user.incomeWallet.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* TPINs */}
          {user.tpins.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">TPINs</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activation Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.tpins.map((tpin) => (
                      <tr key={tpin._id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{tpin.code}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            tpin.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : tpin.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {tpin.status.charAt(0).toUpperCase() + tpin.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tpin.purchaseDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {tpin.activationDate ? new Date(tpin.activationDate).toLocaleDateString() : 'Not Activated'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {user.paymentDetails.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screenshot</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.paymentDetails.map((payment) => (
                      <tr key={payment._id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{payment.paymentId}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{payment.amount} {payment.currency}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : payment.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {payment.screenshotUrl && (
                            <a 
                              href={payment.screenshotUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Screenshot
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BlockModal: React.FC<BlockModalProps> = ({ isOpen, onClose, user, onConfirm, isProcessing }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (user && reason.trim()) {
      onConfirm(user._id, reason.trim());
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Block User Account</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">User Name</p>
            <p className="font-medium text-gray-900">{user.name}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">User ID</p>
            <p className="font-medium text-gray-900">{user.userId}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Current Status</p>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              !user.blocked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {!user.blocked ? 'Active' : 'Blocked'}
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Blocking *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason for blocking this user account..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be recorded and may be visible to the user.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing || !reason.trim()}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Blocking...</span>
                </div>
              ) : (
                'Block Account'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [blockedUsersLoading, setBlockedUsersLoading] = useState(false);
  const [blockedUsersPagination, setBlockedUsersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<{userId: string, userName: string} | null>(null);
  const [notification, setNotification] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    isVisible: false
  });
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedUserForBlocking, setSelectedUserForBlocking] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBlockedUsers = async (page: number = 1) => {
    try {
      setBlockedUsersLoading(true);
      const response = await usersService.getBlockedUsers(page, 10);
      setBlockedUsers(response.data.users);
      setBlockedUsersPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to fetch blocked users. Please try again later.');
      console.error('Blocked users error:', err);
    } finally {
      setBlockedUsersLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await usersService.getUsers();
        setUsers(response.data.users);
        setError(null);
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error('Users error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'blocked') {
      fetchBlockedUsers(1);
    }
  }, [activeTab]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleViewPassword = (user: User) => {
    setSelectedUserForPassword({
      userId: user.userId,
      userName: user.name
    });
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUserForPassword(null);
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

  const handleBlockUser = (user: User) => {
    setSelectedUserForBlocking(user);
    setIsBlockModalOpen(true);
  };

  const handleCloseBlockModal = () => {
    setIsBlockModalOpen(false);
    setSelectedUserForBlocking(null);
  };

  const handleConfirmBlocking = async (userId: string, reason: string) => {
    if (selectedUserForBlocking) {
      try {
        setIsProcessing(true);
        await usersService.blockUser(userId, reason);
        showNotification('User blocked successfully', 'success');
        const updatedUsers = users.map(user =>
          user._id === userId ? { ...user, blocked: true } : user
        );
        setUsers(updatedUsers);
      } catch (err) {
        console.error('Failed to block user:', err);
        showNotification('Failed to block user. Please try again later.', 'error');
      } finally {
        setIsProcessing(false);
        handleCloseBlockModal();
      }
    }
  };

  const handleUnblockUser = async (user: User | BlockedUser) => {
    try {
      setIsProcessing(true);
      await usersService.unblockUser(user._id);
      showNotification('User unblocked successfully', 'success');
      
      // Update the all users list if it's a regular user
      if ('isActive' in user) {
        const updatedUsers = users.map(u =>
          u._id === user._id ? { ...u, blocked: false } : u
        );
        setUsers(updatedUsers);
      }
      
      // Refresh blocked users list if we're on the blocked tab
      if (activeTab === 'blocked') {
        fetchBlockedUsers(blockedUsersPagination.currentPage);
      }
    } catch (err) {
      console.error('Failed to unblock user:', err);
      showNotification('Failed to unblock user. Please try again later.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && !user.blocked) ||
                         (selectedFilter === 'inactive' && user.blocked);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users data...</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
            <p className="text-gray-600 mt-1">Manage and monitor all user accounts</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>All Users</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'blocked'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserMinus className="w-4 h-4" />
                <span>Blocked Users</span>
                {blockedUsersPagination.totalUsers > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {blockedUsersPagination.totalUsers}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* All Users Tab Content */}
      {activeTab === 'all' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Blocked</option>
                </select>
              </div>
            </div>
          </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${!user.blocked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {!user.blocked ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{user.incomeWallet.balance.toFixed(2)}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleViewPassword(user)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded transition-colors"
                        title="View Password"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      {user.blocked ? (
                        <button 
                          onClick={() => handleUnblockUser(user)}
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="Unblock User"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBlockUser(user)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Block User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      {/* <button 
                        className="text-purple-600 hover:text-purple-900 p-1 rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button> */}
                      {/* <button 
                        className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors"
                        title="More Options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No users found matching your search criteria
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
                Showing {filteredUsers.length > 0 ? '1' : '0'} to {filteredUsers.length} of {users.length} users
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
        </>
      )}

      {/* Blocked Users Tab Content */}
      {activeTab === 'blocked' && (
        <>
          {blockedUsersLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading blocked users...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Blocked Users Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Blocked Users List</h3>
                  <p className="text-sm text-gray-600 mt-1">Users who have been blocked from the platform</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blocked Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blocked By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {blockedUsers.length > 0 ? blockedUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-medium">
                                {user.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.userId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.mobile}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(user.blockedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-900 truncate" title={user.blockReason}>
                                {user.blockReason}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.blockedBy.name}</div>
                            <div className="text-sm text-gray-500">{user.blockedBy.userId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleUnblockUser({ ...user, isActive: false } as any)}
                              className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                              title="Unblock User"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            No blocked users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Blocked Users Pagination */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing page {blockedUsersPagination.currentPage} of {blockedUsersPagination.totalPages} 
                    ({blockedUsersPagination.totalUsers} total blocked users)
                  </p>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => fetchBlockedUsers(blockedUsersPagination.currentPage - 1)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!blockedUsersPagination.hasPrevPage}
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 bg-red-500 text-white rounded-md text-sm">
                      {blockedUsersPagination.currentPage}
                    </span>
                    <button 
                      onClick={() => fetchBlockedUsers(blockedUsersPagination.currentPage + 1)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!blockedUsersPagination.hasNextPage}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* User Details Modal */}
      <UserDetailModal 
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Password Modal */}
      <PasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        userId={selectedUserForPassword?.userId || ''}
        userName={selectedUserForPassword?.userName || ''}
      />

      {/* Block Modal */}
      <BlockModal
        isOpen={isBlockModalOpen}
        onClose={handleCloseBlockModal}
        user={selectedUserForBlocking}
        onConfirm={handleConfirmBlocking}
        isProcessing={isProcessing}
      />

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
};

export default UsersContent;