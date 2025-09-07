import React, { useState, useEffect } from 'react';
import RecyclerLogin from './components/RecyclerLogin';
import RecyclerLayout from './components/RecyclerLayout';
import RecyclerDashboard from './pages/RecyclerDashboard';
import { isAuthenticated } from './utils/helpers';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <RecyclerLogin onLogin={handleLogin} />;
  }

  return (
    <RecyclerLayout onLogout={handleLogout}>
      <RecyclerDashboard />
    </RecyclerLayout>
  );
}

export default App;
