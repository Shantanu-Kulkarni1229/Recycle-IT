import React, { useState, useEffect } from 'react';
import { getRecyclerData, removeToken } from '../utils/helpers';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const RecyclerLayout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [recycler, setRecycler] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');

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
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'assigned', name: 'Assigned E-waste', icon: '📦' },
    { id: 'inspection', name: 'Inspection Reports', icon: '🔍' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'documents', name: 'Documents', icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-600 hover:text-green-600 lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="text-2xl font-bold text-green-600">
                ♻️ Recycle-IT
              </div>
              <span className="text-gray-500 hidden sm:block">Recycler Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="text-gray-600 hover:text-green-600 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">
                      {recycler?.companyName?.charAt(0)?.toUpperCase() || 'R'}
                    </span>
                  </div>
                  <span className="hidden sm:block">{recycler?.companyName || 'Recycler'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    👤 Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    ⚙️ Settings
                  </a>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`bg-white w-64 min-h-screen shadow-lg transform transition-transform duration-300 ease-in-out border-r border-gray-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 z-40`}>
          <div className="p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition duration-200 ${
                    activeMenu === item.id
                      ? 'bg-green-50 text-green-600 border-r-4 border-green-600'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Recycler Info in Sidebar */}
          {recycler && (
            <div className="p-4 border-t border-gray-200 mt-auto">
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-800 text-sm">{recycler.companyName}</h4>
                <p className="text-green-600 text-xs">{recycler.email}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                  recycler.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {recycler.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'
        }`}>
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default RecyclerLayout;
