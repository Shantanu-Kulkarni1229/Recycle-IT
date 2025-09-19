import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
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
        setError(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-gradient flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-8 text-4xl animate-bounce-gentle">🍃</div>
        <div className="absolute top-32 right-12 text-3xl animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>🌿</div>
        <div className="absolute bottom-32 left-16 text-2xl animate-bounce-gentle" style={{ animationDelay: '1s' }}>♻️</div>
        <div className="absolute bottom-20 right-20 text-3xl animate-bounce-gentle" style={{ animationDelay: '1.5s' }}>🌱</div>
      </div>

      {/* Header Section */}
      <div className="bg-emerald-600 pt-16 pb-12 px-6 rounded-b-3xl relative z-10">
        <div className="max-w-md mx-auto text-center">
          {/* App Logo */}
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-lg inline-block">
            <span className="text-4xl">🌍</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">
            Recycler Dashboard
          </h1>
          <p className="text-emerald-100 text-center text-base opacity-90 leading-6">
            Continue your journey to make{'\n'}our planet greener
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 px-6 py-8 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Login Form Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6 animate-fade-in">
            
            {/* Email Input */}
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2 ml-1">
                Email Address
              </label>
              <div className={`relative border rounded-xl transition-all duration-200 ${
                focusedField === 'email' 
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                {/* Email Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <span className="text-lg opacity-70">📧</span>
                </div>
                
                {/* Email Input */}
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  className="w-full pl-14 pr-4 py-4 text-gray-800 text-base bg-transparent focus:outline-none"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 ml-1">
                Password
              </label>
              <div className={`relative border rounded-xl transition-all duration-200 ${
                focusedField === 'password' 
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                {/* Password Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <span className="text-lg opacity-70">🔐</span>
                </div>
                
                {/* Password Input */}
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full pl-14 pr-4 py-4 text-gray-800 text-base bg-transparent focus:outline-none"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-6">
              <button type="button" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-fade-in">
                <div className="flex items-center">
                  <span className="text-lg mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-base shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Sign in to Dashboard
                </div>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center space-y-3">
            <p className="text-gray-600 text-sm">
              Need help? Contact our support team
            </p>
            
            {onSignUp && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-3">
                  Don't have a recycler account?
                </p>
                <button
                  type="button"
                  onClick={onSignUp}
                  className="w-full py-3 px-4 border-2 border-green-600 text-green-600 font-medium rounded-xl hover:bg-green-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-center">
                    <span className="mr-2">✨</span>
                    Create Recycler Account
                  </div>
                </button>
              </div>
            )}

            {/* Admin Portal Link */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm mb-3">
                Administrator Access
              </p>
              <button
                type="button"
                onClick={() => window.location.href = '/admin'}
                className="w-full py-3 px-4 border-2 border-blue-600 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all duration-200"
              >
                <div className="flex items-center justify-center">
                  <span className="mr-2">🔐</span>
                  Admin Portal
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
