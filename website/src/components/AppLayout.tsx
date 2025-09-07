import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Truck, 
  Clipboard, 
  Upload, 
  CreditCard, 
  LogOut 
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('recyclerToken');
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/';
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/pickup-management', icon: Truck, label: 'Pickup Management' },
    { path: '/ewaste-inspection', icon: Clipboard, label: 'E-waste Inspection' },
    { path: '/document-upload', icon: Upload, label: 'Documents' },
    { path: '/payment-management', icon: CreditCard, label: 'Payments' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-green-600">Recycle-IT</h1>
          <p className="text-gray-600 text-sm">Recycler Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Recycler Portal'}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, Recycler
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
