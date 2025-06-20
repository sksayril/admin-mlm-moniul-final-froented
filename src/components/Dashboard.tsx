import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';
import UsersContent from './UsersContent';
import TpinContent from './TpinContent';
import WithdrawalContent from './WithdrawalContent';
import MlmContent from './MlmContent';
import PaymentsContent from './PaymentsContent';
import InvestmentContent from './InvestmentContent';
import { Menu, X } from 'lucide-react';
import { authService, AdminData } from '../api';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const location = useLocation();
  const currentPath = location.pathname.split('/')[2] || '';

  useEffect(() => {
    // Get current admin data
    const admin = authService.getCurrentUser();
    setAdminData(admin);
  }, []);

  // Get the page title based on the current path
  const getPageTitle = () => {
    switch (currentPath) {
      case '':
        return 'Dashboard Overview';
      default:
        return currentPath.charAt(0).toUpperCase() + currentPath.slice(1);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          onLogout={onLogout}
          closeSidebar={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-semibold text-gray-900 capitalize lg:block hidden">
              {getPageTitle()}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="text-sm text-gray-600">
                  Welcome, {adminData?.name || 'Admin'} <span className="text-gray-400">({adminData?.userId || ''})</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<DashboardContent adminData={adminData} />} />
            <Route path="/users" element={<UsersContent />} />
            <Route path="/tpin" element={<TpinContent />} />
            <Route path="/payments" element={<PaymentsContent />} />
            <Route path="/withdrawal" element={<WithdrawalContent />} />
            <Route path="/investment" element={<InvestmentContent />} />
            <Route path="/mlm" element={<MlmContent />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;