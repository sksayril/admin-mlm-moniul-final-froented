import React, { useState, useEffect } from 'react';
import { cryptoService, CryptoRequest } from '../api';
import { Bitcoin, TrendingDown, TrendingUp, Calendar, User, Mail, DollarSign, Hash, RefreshCw, Check, X } from 'lucide-react';

const CryptoContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRequests, setPendingRequests] = useState<CryptoRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<CryptoRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<CryptoRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CryptoRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingRequests();
    } else if (activeTab === 'approved') {
      fetchApprovedRequests();
    } else if (activeTab === 'rejected') {
      fetchRejectedRequests();
    }
  }, [activeTab]);

  // Load pending requests on component mount
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cryptoService.getPendingRequests();
      setPendingRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching pending crypto requests:', error);
      setError('Failed to load pending crypto requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cryptoService.getApprovedRequests();
      setApprovedRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching approved crypto requests:', error);
      setError('Failed to load approved crypto requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchRejectedRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cryptoService.getRejectedRequests();
      setRejectedRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching rejected crypto requests:', error);
      setError('Failed to load rejected crypto requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setActionLoading(true);
    try {
      await cryptoService.approveRequest(selectedRequest.userId, selectedRequest.requestId);
      setShowApproveModal(false);
      setSelectedRequest(null);
      fetchPendingRequests();
      alert('Crypto request approved successfully!');
    } catch (error) {
      console.error('Error approving crypto request:', error);
      alert('Failed to approve crypto request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;
    
    setActionLoading(true);
    try {
      await cryptoService.rejectRequest(selectedRequest.userId, selectedRequest.requestId, rejectReason);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      fetchPendingRequests();
      alert('Crypto request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting crypto request:', error);
      alert('Failed to reject crypto request');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRequestsTable = (requests: CryptoRequest[], title: string, showActions: boolean = true, refreshFunction?: () => void) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {refreshFunction && (
          <button
            onClick={refreshFunction}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Requests Table */}
      {!loading && !error && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coin Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {showActions && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={showActions ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                      <Bitcoin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      No crypto requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.requestId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{request.userName}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">{request.userEmail}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">ID: {request.userId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 font-mono">{request.requestId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.type === 'purchase' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.type === 'purchase' ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {request.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            Value: ${request.coinValue.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Quantity: {request.quantity.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            ${request.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </td>
                      {showActions && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApproveModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );



  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Bitcoin className="h-8 w-8 mr-3 text-orange-500" />
          Crypto Coin Management
        </h1>
        <p className="mt-2 text-gray-600">Manage cryptocurrency purchase and sell requests</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'approved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Approved Requests
            {approvedRequests.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                {approvedRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rejected'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rejected Requests
            {rejectedRequests.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {rejectedRequests.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'pending' && renderRequestsTable(pendingRequests, 'Pending Crypto Requests', true, fetchPendingRequests)}
      {activeTab === 'approved' && renderRequestsTable(approvedRequests, 'Approved Crypto Requests', false, fetchApprovedRequests)}
      {activeTab === 'rejected' && renderRequestsTable(rejectedRequests, 'Rejected Crypto Requests', false, fetchRejectedRequests)}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Approve Crypto Request</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to approve this {selectedRequest.type} request for {selectedRequest.userName}?
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                  <p className="text-sm"><strong>Amount:</strong> ${selectedRequest.totalAmount.toFixed(2)}</p>
                  <p className="text-sm"><strong>Quantity:</strong> {selectedRequest.quantity.toLocaleString()}</p>
                  <p className="text-sm"><strong>Type:</strong> {selectedRequest.type}</p>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Reject Crypto Request</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Please provide a reason for rejecting this {selectedRequest.type} request.
                </p>
                <div className="mt-4 text-left">
                  <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoContent; 