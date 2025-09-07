import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Login from './components/Login';
import RecyclerSignUp from './components/RecyclerSignUp';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PickupManagement from './pages/PickupManagement';
import EwasteInspection from './pages/EwasteInspection';
import DocumentUpload from './pages/DocumentUpload';
import PaymentManagement from './pages/PaymentManagement';

// Utils
import { isAuthenticated } from './utils/helpers';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

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
    setShowSignUp(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('recyclerToken');
    localStorage.removeItem('recyclerData');
    setIsLoggedIn(false);
  };

  const handleShowSignUp = () => {
    setShowSignUp(true);
  };

  const handleBackToLogin = () => {
    setShowSignUp(false);
  };

  const handleSignUpSuccess = () => {
    setIsLoggedIn(true);
    setShowSignUp(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Recycle-IT...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (showSignUp) {
      return (
        <RecyclerSignUp 
          onSignUp={handleSignUpSuccess} 
          onBackToLogin={handleBackToLogin}
        />
      );
    }
    
    return (
      <Login 
        onLogin={handleLogin} 
        onSignUp={handleShowSignUp}
      />
    );
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pickup-management" element={<PickupManagement />} />
          <Route path="/ewaste-inspection" element={<EwasteInspection />} />
          <Route path="/document-upload" element={<DocumentUpload />} />
          <Route path="/payment-management" element={<PaymentManagement />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
