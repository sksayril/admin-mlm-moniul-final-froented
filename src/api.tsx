// API service for the admin dashboard
// This file contains all the API calls to the backend

import axios from 'axios';

// API base URL
// const API_BASE_URL = 'https://api.forlifetradingindia.life/api';
const API_BASE_URL = 'http://localhost:3111/api';

// Admin API endpoints
const ADMIN_AUTH_ENDPOINT = `${API_BASE_URL}/admin/auth`;
const ADMIN_DASHBOARD_ENDPOINT = `${API_BASE_URL}/admin/dashboard`;
const ADMIN_USERS_ENDPOINT = `${API_BASE_URL}/admin/users`;
const ADMIN_PAYMENTS_ENDPOINT = `${API_BASE_URL}/admin/payments`;

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface IncomeWallet {
  balance: number;
  selfIncome: number;
  directIncome: number;
  matrixIncome: number;
  dailyTeamIncome: number;
  rankRewards: number;
  fxTradingIncome: number;
  lastUpdated: string;
}

export interface TradingPackage {
  purchased: boolean;
}

export interface Tpin {
  code: string;
  isUsed: boolean;
  purchaseDate: string;
  status: string;
  _id: string;
  activationDate?: string;
}

export interface PaymentDetail {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  screenshot: string;
  screenshotUrl: string;
  date: string;
  _id: string;
}

export interface Payment {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userIdCode: string;
  paymentId: string;
  amount: number;
  currency: string;
  purpose: string;
  status: string;
  screenshot: string;
  screenshotUrl: string;
  date: string;
  method?: string;
}

export interface PaymentsResponse {
  status: string;
  results: number;
  data: {
    payments: Payment[];
  };
}

export interface ApprovedPaymentsResponse {
  status: string;
  results: number;
  data: {
    approvedPayments: Payment[];
  };
}

export interface AdminData {
  incomeWallet: IncomeWallet;
  tradingPackage: TradingPackage;
  _id: string;
  name: string;
  userId: string;
  email: string;
  role: string;
  isActive: boolean;
  referrals: any[];
  rank: string;
  teamSize: number;
  tpins: any[];
  paymentDetails: any[];
  downline: any[];
  withdrawals: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface User {
  incomeWallet: IncomeWallet;
  tradingPackage: TradingPackage;
  _id: string;
  name: string;
  userId: string;
  email: string;
  role: string;
  isActive: boolean;
  referrer?: string;
  referrals: string[];
  rank: string;
  teamSize: number;
  tpins: Tpin[];
  paymentDetails: PaymentDetail[];
  downline: any[];
  withdrawals: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UsersResponse {
  status: string;
  results: number;
  data: {
    users: User[];
  };
}

export interface LoginResponse {
  status: string;
  token: string;
  data: {
    admin: AdminData;
  };
}

export interface WithdrawalStat {
  totalAmount: number;
  count: number;
}

export interface DashboardStatsResponse {
  status: string;
  data: {
    userStats: {
      totalUsers: number;
      newUsers: number;
      activeSubscriptions: number;
      activeTpins: number;
      pendingSubscriptions: number;
      pendingTpins: number;
    };
    financialStats: {
      totalRevenue: number;
      revenueInPeriod: number;
      transactionsInPeriod: number;
      totalWithdrawals: {
        pending: WithdrawalStat;
        approved: WithdrawalStat;
        rejected: WithdrawalStat;
      };
    };
    mlmStats: {
      activeReferrers: number;
      totalTeamSize: number;
      totalDirectIncome: number;
      totalMatrixIncome: number;
      totalSelfIncome: number;
      totalRankRewards: number;
      activeTradingPackages: number;
      rankDistribution: Array<{
        _id: string;
        count: number;
      }>;
    };
    chartData: {
      labels: string[];
      datasets: {
        newUsers: number[];
        revenue: number[];
        withdrawals: number[];
      };
    };
  };
}

export interface PendingTpinRequest {
  userId: string;
  userName: string;
  userEmail: string;
  tpin: Tpin;
}

export interface PendingTpinsResponse {
  status: string;
  results: number;
  data: {
    pendingRequests: PendingTpinRequest[];
  };
}

export interface TpinHistoryItem {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userIdCode: string;
  tpinCode: string;
  isUsed: boolean;
  status: string;
  purchaseDate: string;
  activationDate?: string;
  rejectionReason?: string;
}

export interface TpinHistoryResponse {
  status: string;
  results: number;
  data: {
    tpins: TpinHistoryItem[];
  };
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
}

export interface CryptoWallet {
  walletAddress: string;
  walletType: string;
  network: string;
}

export interface PaymentDetails {
  bankDetails?: BankDetails;
  upiId?: string;
  cryptoWallet?: CryptoWallet;
}

export interface WithdrawalItem {
  _id: string;
  userName: string;
  userId: string;
  userEmail: string;
  amount: number;
  requestDate: string;
  status: string;
  paymentMethod: string;
  paymentDetails: PaymentDetails;
  processedDate?: string;
  transactionId?: string;
}

export interface WithdrawalsResponse {
  status: string;
  results: number;
  page: number;
  limit: number;
  totalPages: number;
  data: {
    withdrawals: WithdrawalItem[];
  };
}

export interface MlmOverviewData {
  totalUsers: number;
  activeInNetwork: number;
  totalEarningsDistributed: number;
  pendingWithdrawals: number;
  totalWithdrawals: number;
  networkDepth: number;
  directCommissionsPaid: number;
  matrixCommissionsPaid: number;
  rankBonusesPaid: number;
}

export interface MlmOverviewResponse {
  status: string;
  data: MlmOverviewData;
}

export interface TopPerformer {
  rank: string;
  userId: string;
  name: string;
  email: string;
  teamSize: number;
  directReferrals: number;
  totalEarnings: number;
  isActive: boolean;
  joinDate: string;
}

export interface TopPerformersResponse {
  status: string;
  results: number;
  sortedBy: string;
  data: {
    topPerformers: TopPerformer[];
  };
}

export interface InvestmentRecharge {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  paymentId: string;
  amount: number;
  currency: string;
  screenshot: string;
  screenshotUrl: string;
  status: string;
  date: string;
}

export interface InvestmentRechargesResponse {
  status: string;
  data: {
    recharges: InvestmentRecharge[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserPasswordResponse {
  status: string;
  data: {
    user: {
      _id: string;
      name: string;
      userId: string;
      email: string;
      originalPassword: string;
      mobile: string;
      isActive: boolean;
      role: string;
      rank: string;
      teamSize: number;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface UserDeactivateRequest {
  reason: string;
}

export interface UserDeactivateResponse {
  status: string;
  message: string;
  data: {
    user: {
      _id: string;
      userId: string;
      name: string;
      email: string;
      isActive: boolean;
      deactivationReason?: string;
      deactivatedAt?: string;
    };
  };
}

// API Service Setup
const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

setupAxiosInterceptors();

// Authentication service
export const authService = {
  // Login function
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${ADMIN_AUTH_ENDPOINT}/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.data.admin));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminData');
  },

  // Get current user data
  getCurrentUser: (): AdminData | null => {
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return localStorage.getItem('authToken') !== null;
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  }
};

// Dashboard service
export const dashboardService = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await axios.get(`${ADMIN_DASHBOARD_ENDPOINT}/stats`);
      return response.data;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  }
};

// Users service
export const usersService = {
  // Get all users
  getUsers: async (): Promise<UsersResponse> => {
    try {
      const response = await axios.get(ADMIN_USERS_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Users error:', error);
      throw error;
    }
  },

  // Get user's original password
  getUserPassword: async (userId: string): Promise<UserPasswordResponse> => {
    try {
      const response = await axios.get(`${ADMIN_USERS_ENDPOINT}/${userId}/original-password`);
      return response.data;
    } catch (error) {
      console.error('User password fetch error:', error);
      throw error;
    }
  },

  // Get single user by ID
  getUserById: async (userId: string): Promise<any> => {
    try {
      const response = await axios.get(`${ADMIN_USERS_ENDPOINT}/${userId}`);
      return response.data.data.user;
    } catch (error) {
      console.error('User error:', error);
      throw error;
    }
  },

  // Deactivate user account
  deactivateUser: async (userId: string, reason: string): Promise<UserDeactivateResponse> => {
    try {
      const response = await axios.post(`${ADMIN_USERS_ENDPOINT}/${userId}/deactivate`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('User deactivation error:', error);
      throw error;
    }
  },

  // Activate user account (if needed for reactivation)
  activateUser: async (userId: string): Promise<UserDeactivateResponse> => {
    try {
      const response = await axios.post(`${ADMIN_USERS_ENDPOINT}/${userId}/activate`);
      return response.data;
    } catch (error) {
      console.error('User activation error:', error);
      throw error;
    }
  }
};

// Payments service
export const paymentsService = {
  // Get all payments
  getPayments: async (): Promise<PaymentsResponse> => {
    try {
      const response = await axios.get(ADMIN_PAYMENTS_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Payments error:', error);
      throw error;
    }
  },

  // Get approved payments
  getApprovedPayments: async (): Promise<ApprovedPaymentsResponse> => {
    try {
      const response = await axios.get(`${ADMIN_PAYMENTS_ENDPOINT}/approved`);
      return response.data;
    } catch (error) {
      console.error('Approved payments error:', error);
      throw error;
    }
  },

  // Approve payment
  approvePayment: async (userId: string, paymentId: string): Promise<any> => {
    try {
      const response = await axios.post(`${ADMIN_PAYMENTS_ENDPOINT}/approve`, {
        userId,
        paymentId
      });
      return response.data;
    } catch (error) {
      console.error('Payment approval error:', error);
      throw error;
    }
  },

  // Reject payment
  rejectPayment: async (userId: string, paymentId: string, reason: string): Promise<any> => {
    try {
      const response = await axios.post(`${ADMIN_PAYMENTS_ENDPOINT}/reject`, {
        userId,
        paymentId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Payment rejection error:', error);
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (paymentId: string, status: 'approved' | 'rejected' | 'pending'): Promise<any> => {
    try {
      const response = await axios.put(`${ADMIN_PAYMENTS_ENDPOINT}/${paymentId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Payment status update error:', error);
      throw error;
    }
  }
};

// Create an axios-based API client
export const apiClient = {
  get: async (url: string) => {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },
  
  post: async (url: string, data: any) => {
    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },
  
  put: async (url: string, data: any) => {
    try {
      const response = await axios.put(url, data);
      return response.data;
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },
  
  delete: async (url: string) => {
    try {
      const response = await axios.delete(url);
      return response.data;
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  },
};

// TPIN service
export const tpinService = {
  // Get pending TPINs
  getPendingTpins: async (): Promise<PendingTpinsResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/tpin/pending`);
      return response.data;
    } catch (error) {
      console.error('Pending TPINs error:', error);
      throw error;
    }
  },

  // Get all TPINs history
  getTpinHistory: async (): Promise<TpinHistoryResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/tpins`);
      return response.data;
    } catch (error) {
      console.error('TPIN history error:', error);
      throw error;
    }
  },

  // Approve TPIN
  approveTpin: async (userId: string, tpinId: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/tpin/approve`, {
        userId,
        tpinId
      });
      return response.data;
    } catch (error) {
      console.error('TPIN approval error:', error);
      throw error;
    }
  },

  // Reject TPIN
  rejectTpin: async (userId: string, tpinId: string, reason: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/tpin/reject`, {
        userId,
        tpinId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('TPIN rejection error:', error);
      throw error;
    }
  },

  // Generate TPIN
  generateTpin: async (userId: string, quantity: number, reason: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/tpin/generate`, {
        userId,
        quantity,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('TPIN generation error:', error);
      throw error;
    }
  }
};

// Withdrawal service
export const withdrawalService = {
  // Get all withdrawals
  getWithdrawals: async (): Promise<WithdrawalsResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/withdrawals`);
      return response.data;
    } catch (error) {
      console.error('Withdrawals error:', error);
      throw error;
    }
  },

  // Approve withdrawal
  approveWithdrawal: async (userId: string, withdrawalId: string, transactionId: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/withdrawals/approve`, {
        userId,
        withdrawalId,
        transactionId
      });
      return response.data;
    } catch (error) {
      console.error('Withdrawal approval error:', error);
      throw error;
    }
  },

  // Reject withdrawal
  rejectWithdrawal: async (withdrawalId: string, reason: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/withdrawals/reject`, {
        withdrawalId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Withdrawal rejection error:', error);
      throw error;
    }
  }
};

// MLM service
export const mlmService = {
  // Get MLM overview
  getOverview: async (): Promise<MlmOverviewResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/mlm/overview`);
      return response.data;
    } catch (error) {
      console.error('MLM overview error:', error);
      throw error;
    }
  },

  // Get top performers
  getTopPerformers: async (): Promise<TopPerformersResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/mlm/top-performers`);
      return response.data;
    } catch (error) {
      console.error('MLM top performers error:', error);
      throw error;
    }
  }
};

// Investment service
export const investmentService = {
  // Get investment statistics
  getStats: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/investment/stats`);
      return response.data;
    } catch (error) {
      console.error('Investment stats error:', error);
      throw error;
    }
  },

  // Get pending investment recharges
  getPendingRecharges: async (): Promise<InvestmentRechargesResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/investment/recharges/pending`);
      return response.data;
    } catch (error) {
      console.error('Investment pending recharges error:', error);
      throw error;
    }
  },

  // Get all investment recharges
  getAllRecharges: async (page: number = 1, limit: number = 10): Promise<InvestmentRechargesResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/investment/recharges?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Investment recharges error:', error);
      throw error;
    }
  },
  
  // Get approved investment recharges
  getApprovedRecharges: async (page: number = 1, limit: number = 10): Promise<InvestmentRechargesResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/investment/recharges/approved?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Investment approved recharges error:', error);
      throw error;
    }
  },
  
  // Get rejected investment recharges
  getRejectedRecharges: async (page: number = 1, limit: number = 10): Promise<InvestmentRechargesResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/investment/recharges/rejected?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Investment rejected recharges error:', error);
      throw error;
    }
  },

  // Approve investment recharge
  approveRecharge: async (userId: string, paymentId: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/investment/recharges/${userId}/${paymentId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Investment recharge approval error:', error);
      throw error;
    }
  },

  // Reject investment recharge
  rejectRecharge: async (userId: string, paymentId: string, reason: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/investment/recharges/${userId}/${paymentId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Investment recharge rejection error:', error);
      throw error;
    }
  }
};

export default { authService, dashboardService, usersService, paymentsService, apiClient, tpinService, withdrawalService, mlmService, investmentService }; 