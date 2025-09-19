import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Login from './components/Login';
import RecyclerSignUp from './components/RecyclerSignUp';
import Layout from './components/Layout';
import AdminApp from './components/AdminApp';

// Pages
import RecyclerDashboard from './pages/RecyclerDashboard';
import Profile from './pages/Profile';
import PickupManagement from './pages/PickupManagement';
import EwasteInspection from './pages/EwasteInspection';
import DocumentUpload from './pages/DocumentUpload';
import PaymentManagement from './pages/PaymentManagement';
import MyDeliveryPartners from './pages/MyDeliveryPartners';
import AddDeliveryPartner from './pages/AddDeliveryPartner';

// Utils
import { isAuthenticated } from './utils/helpers';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated (only for recycler routes)
    const checkAuth = () => {
      // Don't check recycler auth if we're on admin route
      if (window.location.pathname.startsWith('/admin')) {
        setIsLoading(false);
        return;
      }
      
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

  return (
    <Router>
      <Routes>
        {/* Admin Routes - completely independent, highest priority */}
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
        
        {/* Recycler Login/Signup Routes */}
        {!isLoggedIn && (
          <>
            <Route path="/signup" element={
              <RecyclerSignUp 
                onSignUp={handleSignUpSuccess} 
                onBackToLogin={handleBackToLogin}
              />
            } />
            <Route path="/*" element={
              showSignUp ? (
                <RecyclerSignUp 
                  onSignUp={handleSignUpSuccess} 
                  onBackToLogin={handleBackToLogin}
                />
              ) : (
                <Login 
                  onLogin={handleLogin} 
                  onSignUp={handleShowSignUp}
                />
              )
            } />
          </>
        )}
        
        {/* Recycler Dashboard Routes - only when logged in */}
        {isLoggedIn && (
          <Route path="/*" element={
            <Layout onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<RecyclerDashboard />} />
                <Route path="/dashboard" element={<RecyclerDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/pickup-management" element={<PickupManagement />} />
                <Route path="/ewaste-inspection" element={<EwasteInspection />} />
                <Route path="/document-upload" element={<DocumentUpload />} />
                <Route path="/payment-management" element={<PaymentManagement />} />
                <Route path="/my-delivery-partners" element={<MyDeliveryPartners />} />
                <Route path="/add-delivery-partner" element={<AddDeliveryPartner />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          } />
        )}
      </Routes>
    </Router>
  );
}

export default App;
