import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight, Mail, Recycle, Leaf, Shield } from 'lucide-react';
import LegalAgreementModal from './LegalAgreementModal';
import { authAPI } from '../services/completeAPI';

interface LoginProps {
  onLogin: () => void;
  onSignUp?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [pendingRecyclerData, setPendingRecyclerData] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response: any = await authAPI.login(formData.email, formData.password);
      
      if (response.success) {
        localStorage.setItem('recyclerToken', response.token);
        localStorage.setItem('recyclerData', JSON.stringify(response.recycler));
        onLogin();
      } else {
        // Check if the error is about terms and conditions
        if (response.message?.includes('Please agree to the terms and conditions')) {
          setPendingRecyclerData(response.recycler);
          setShowLegalModal(true);
        } else {
          setError(response.message || 'Login failed');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      
      // Check if the error is about terms and conditions
      if (errorMessage.includes('Please agree to the terms and conditions')) {
        setPendingRecyclerData(error.response?.data?.recycler);
        setShowLegalModal(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegalAccept = async () => {
    setShowLegalModal(false);
    setIsLoading(true);
    setError('');

    try {
      // Call API to update the recycler's legal acceptance
      const response: any = await authAPI.acceptTerms(pendingRecyclerData.id);
      
      if (response.success) {
        localStorage.setItem('recyclerToken', response.token);
        localStorage.setItem('recyclerData', JSON.stringify(response.recycler));
        onLogin();
      } else {
        setError(response.message || 'Failed to update legal acceptance');
      }
    } catch (error: any) {
      console.error('Legal acceptance error:', error);
      setError(error.response?.data?.message || 'Failed to update legal acceptance');
    } finally {
      setIsLoading(false);
      setPendingRecyclerData(null);
    }
  };

  const handleLegalDecline = () => {
    setShowLegalModal(false);
    setPendingRecyclerData(null);
    setError('You must accept the terms and conditions to log in.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Geometric shapes */}
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-green-100/20 to-emerald-200/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-32 right-1/4 w-24 h-24 bg-gradient-to-br from-teal-100/30 to-green-100/20 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/6 w-20 h-20 bg-gradient-to-br from-emerald-100/25 to-teal-100/25 rounded-full blur-md animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/5 w-28 h-28 bg-gradient-to-br from-green-200/20 to-emerald-100/30 rounded-full blur-lg animate-float" style={{ animationDelay: '6s' }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="h-full w-full" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(34,197,94) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating icons */}
        <div className="absolute top-16 left-8 p-3 bg-green-100/30 rounded-full animate-float-gentle">
          <Leaf className="w-6 h-6 text-green-600/40" />
        </div>
        <div className="absolute top-40 right-12 p-2 bg-emerald-100/30 rounded-full animate-float-gentle" style={{ animationDelay: '2s' }}>
          <Recycle className="w-5 h-5 text-emerald-600/40" />
        </div>
        <div className="absolute bottom-40 left-16 p-2.5 bg-teal-100/30 rounded-full animate-float-gentle" style={{ animationDelay: '4s' }}>
          <Shield className="w-5 h-5 text-teal-600/40" />
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 pt-16 pb-12 px-6 relative z-10 shadow-2xl shadow-green-900/20">
        <div className="max-w-md mx-auto text-center">
          {/* App Logo */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl shadow-green-900/20 inline-block transform transition-all duration-500 hover:scale-105 hover:rotate-2 animate-gentle-bounce">
            <div className="relative">
              <Recycle className="w-10 h-10 text-green-600 animate-spin-slow" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3 animate-fade-in-up tracking-tight">
            Recycler Dashboard
          </h1>
          <p className="text-green-100 text-center text-base opacity-90 leading-6 animate-fade-in-up font-medium" style={{ animationDelay: '0.2s' }}>
            Sustainable waste management platform
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 px-6 py-8 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Login Form Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl shadow-green-900/10 border border-green-100/50 mb-6 animate-slide-up transform transition-all duration-300 hover:shadow-3xl hover:shadow-green-900/15">
            
            {/* Email Input */}
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <label className="block text-gray-700 font-semibold mb-3 ml-1 text-sm tracking-wide">
                Email Address
              </label>
              <div className={`relative border-2 rounded-xl transition-all duration-300 transform ${
                focusedField === 'email' 
                  ? 'border-green-500 bg-green-50/50 shadow-lg shadow-green-500/20 scale-[1.01]' 
                  : 'border-gray-200 bg-gray-50/80 hover:border-green-300 hover:shadow-md'
              }`}>
                {/* Email Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Mail className={`w-5 h-5 text-gray-500 transition-all duration-300 ${
                    focusedField === 'email' ? 'text-green-600 scale-110' : ''
                  }`} />
                </div>
                
                {/* Email Input */}
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  className="w-full pl-14 pr-4 py-4 text-gray-800 text-base bg-transparent focus:outline-none placeholder-gray-400 font-medium"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <label className="block text-gray-700 font-semibold mb-3 ml-1 text-sm tracking-wide">
                Password
              </label>
              <div className={`relative border-2 rounded-xl transition-all duration-300 transform ${
                focusedField === 'password' 
                  ? 'border-green-500 bg-green-50/50 shadow-lg shadow-green-500/20 scale-[1.01]' 
                  : 'border-gray-200 bg-gray-50/80 hover:border-green-300 hover:shadow-md'
              }`}>
                {/* Password Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Lock className={`w-5 h-5 text-gray-500 transition-all duration-300 ${
                    focusedField === 'password' ? 'text-green-600 scale-110' : ''
                  }`} />
                </div>
                
                {/* Password Input */}
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full pl-14 pr-14 py-4 text-gray-800 text-base bg-transparent focus:outline-none placeholder-gray-400 font-medium"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                />

                {/* Password Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <button type="button" className="text-green-600 hover:text-green-700 text-sm font-semibold transition-all duration-200 hover:underline underline-offset-2">
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50/90 backdrop-blur-sm border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-shake">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-red-500 rounded-full mr-3 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-base shadow-xl shadow-green-600/30 hover:shadow-2xl hover:shadow-green-600/40 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up tracking-wide"
              style={{ animationDelay: '0.7s' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  <span className="animate-pulse">Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center group">
                  <Lock className="mr-3 w-5 h-5 group-hover:animate-pulse" />
                  Sign in to Dashboard
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            {/* Register Button */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-emerald-900/10 border border-emerald-100/50 text-center">
              <p className="text-gray-600 text-sm mb-4 font-medium">
                New to our platform?
              </p>
              <button
                type="button"
                onClick={onSignUp}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-500 text-emerald-700 font-bold rounded-xl hover:from-emerald-100 hover:to-green-100 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-emerald-500/20"
              >
                <div className="flex items-center justify-center group">
                  <User className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Register as New Recycler
                  <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Admin Portal Link */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-blue-900/10 border border-blue-100/50 text-center">
              <p className="text-gray-600 text-sm mb-4 font-medium">
                Administrator Access
              </p>
              <button
                type="button"
                onClick={() => window.location.href = '/admin'}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 text-blue-700 font-bold rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="flex items-center justify-center group">
                  <Shield className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Admin Portal
                  <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4">
              <p className="text-gray-500 text-sm font-medium">
                Need help? Contact our support team
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(2deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }

        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }

        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-gentle { animation: float-gentle 3s ease-in-out infinite; }
        .animate-gentle-bounce { animation: gentle-bounce 2s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .shadow-3xl { box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25); }
      `}</style>

      {/* Legal Agreement Modal */}
      <LegalAgreementModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        userType="recycler"
        onAccept={handleLegalAccept}
        onDecline={handleLegalDecline}
      />
    </div>
  );
};

export default Login;