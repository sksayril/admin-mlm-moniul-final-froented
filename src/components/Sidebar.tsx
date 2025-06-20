import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Lock, 
  CreditCard, 
  Network, 
  LogOut,
  Shield,
  Wallet,
  TrendingUp,
  Bitcoin
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/')[2] || '';
  
  const menuItems = [
    { id: '', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'users', name: 'Users', icon: Users, path: '/dashboard/users' },
    { id: 'tpin', name: 'TPIN', icon: Lock, path: '/dashboard/tpin' },
    { id: 'payments', name: 'Payments', icon: Wallet, path: '/dashboard/payments' },
    { id: 'withdrawal', name: 'Withdrawal', icon: CreditCard, path: '/dashboard/withdrawal' },
    { id: 'investment', name: 'Investment', icon: TrendingUp, path: '/dashboard/investment' },
    { id: 'crypto', name: 'Crypto Coin', icon: Bitcoin, path: '/dashboard/crypto' },
    { id: 'mlm', name: 'MLM', icon: Network, path: '/dashboard/mlm' },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center justify-center p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin</h2>
            <p className="text-xs text-slate-400">Dashboard</p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;