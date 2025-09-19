import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminApp: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already authenticated
    const checkAdminAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      console.log('Checking admin auth:', { adminToken, adminData });
      
      if (adminToken && adminData) {
        console.log('Admin tokens found, setting logged in state');
        setIsAdminLoggedIn(true);
      } else {
        console.log('No admin tokens found');
      }
      setIsLoading(false);
    };

    checkAdminAuth();
  }, []);

  const handleAdminLogin = () => {
    console.log('handleAdminLogin called, setting isAdminLoggedIn to true');
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setIsAdminLoggedIn(false);
  };

  const handleBackToRecycler = () => {
    // Use React Router navigation instead of window.location
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    console.log('Rendering AdminLogin component');
    return (
      <AdminLogin 
        onSuccess={handleAdminLogin}
        onBackToRecycler={handleBackToRecycler}
      />
    );
  }

  console.log('Rendering AdminDashboard component');
  return (
    <AdminDashboard onLogout={handleAdminLogout} />
  );
};

export default AdminApp;
