import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      description: 'Overview & Statistics'
    },
    {
      name: 'Pickup Management',
      path: '/pickup-management',
      icon: '🚚',
      description: 'Manage E-waste Pickups'
    },
    {
      name: 'E-waste Inspection',
      path: '/ewaste-inspection',
      icon: '🔍',
      description: 'Inspect & Evaluate Devices'
    },
    {
      name: 'Payment Management',
      path: '/payment-management',
      icon: '💰',
      description: 'Handle Payments'
    },
    {
      name: 'Document Upload',
      path: '/document-upload',
      icon: '📄',
      description: 'Upload Verification Docs'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: '👤',
      description: 'Account Settings'
    },
  ];

  const isActivePage = (path: string) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  const getRecyclerData = () => {
    try {
      const data = localStorage.getItem('recyclerData');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error parsing recycler data:', error);
      return {};
    }
  };

  const recyclerData = getRecyclerData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-600 hover:text-gray-800 mr-3"
            >
              <span className="text-2xl">☰</span>
            </button>
            <div className="text-xl font-bold text-green-600">
              ♻️ Recycle-IT
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r transform transition-transform duration-300 ease-in-out`}>
          
          {/* Logo & Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                ♻️ Recycle-IT
              </div>
              <div className="text-sm text-gray-600">
                Recycler Portal
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Recycler Info */}
          <div className="p-4 border-b bg-green-50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-700 font-bold text-lg">
                  {recyclerData.ownerName?.charAt(0) || 'R'}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {recyclerData.ownerName || 'Recycler'}
                </div>
                <div className="text-sm text-gray-600">
                  {recyclerData.companyName || 'Company'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center p-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActivePage(item.path)
                      ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }
                  `}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="mr-2">🚪</span>
              Logout
            </button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
