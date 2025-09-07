import React, { useState, useEffect } from 'react';
import { getRecyclerData, removeToken } from '../utils/helpers';
import { Recycler } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [recycler, setRecycler] = useState<Recycler | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const recyclerData = getRecyclerData();
    if (recyclerData) {
      setRecycler(recyclerData);
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    onLogout();
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', color: 'text-blue-600' },
    { id: 'pickups', name: 'Pickup Requests', icon: '📦', color: 'text-emerald-600' },
    { id: 'assigned', name: 'Assigned Tasks', icon: '✅', color: 'text-green-600' },
    { id: 'inspection', name: 'Inspection Reports', icon: '🔍', color: 'text-purple-600' },
    { id: 'payments', name: 'Payments', icon: '💰', color: 'text-yellow-600' },
    { id: 'analytics', name: 'Analytics', icon: '📈', color: 'text-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-600 hover:text-emerald-600 lg:hidden transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">♻️</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  Recycle-IT
                </div>
              </div>
              <span className="text-gray-500 hidden sm:block text-sm">Recycler Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="text-gray-600 hover:text-emerald-600 relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5H15l-5 5z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-emerald-600 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-sm">
                      {recycler?.ownerName?.charAt(0)?.toUpperCase() || 'R'}
                    </span>
                  </div>
                  <span className="hidden sm:block font-medium">{recycler?.ownerName || 'Recycler'}</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in z-10">
                    <a href="#" className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors duration-200">
                      <span className="mr-3">👤</span>
                      Profile
                    </a>
                    <a href="#" className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors duration-200">
                      <span className="mr-3">⚙️</span>
                      Settings
                    </a>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <span className="mr-3">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`bg-white w-64 min-h-screen shadow-lg transform transition-all duration-300 ease-in-out border-r border-gray-100 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 z-40`}>
          <div className="p-4">
            {/* Recycler Info */}
            <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold">
                    {recycler?.ownerName?.charAt(0)?.toUpperCase() || 'R'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{recycler?.companyName || 'Company'}</p>
                  <p className="text-emerald-600 text-xs">{recycler?.city || 'Location'}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    activeMenu === item.id
                      ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                  {activeMenu === item.id && (
                    <div className="ml-auto w-2 h-2 bg-emerald-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Today's Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs">Pending</span>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs">Completed</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">5</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'
        } min-h-screen bg-gray-50`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
