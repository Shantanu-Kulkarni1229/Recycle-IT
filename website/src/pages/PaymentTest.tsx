import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';

const PaymentTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testPayment = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Test order creation
      const orderData = {
        amount: 10000, // ₹100 in paise
        serviceType: 'pickup' as const,
        deviceInfo: 'Test smartphone',
        pickupAddress: 'Test address',
        notes: { test: true }
      };

      console.log('Creating test order...');

      const userDetails = {
        name: 'Test User',
        email: 'test@example.com',
        contact: '9999999999'
      };

      // Initiate Razorpay checkout
      await paymentService.initiatePayment(
        orderData,
        userDetails,
        (paymentData) => {
          console.log('Payment successful:', paymentData);
          setMessage('Payment successful! Check console for details.');
        },
        (error) => {
          console.error('Payment failed:', error);
          setMessage('Payment failed. Check console for details.');
        }
      );

    } catch (error) {
      console.error('Test failed:', error);
      setMessage('Test failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment Integration Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Test Razorpay Integration</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Test Details:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Amount: ₹100.00</li>
              <li>• Service: Pickup</li>
              <li>• Device: Test smartphone</li>
            </ul>
          </div>

          <button
            onClick={testPayment}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {loading ? 'Processing...' : 'Test Payment Integration'}
          </button>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('successful') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Environment Check:</h3>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">API Base URL:</span>{' '}
              <span className="text-gray-600">
                {process.env.REACT_APP_API_BASE_URL || 'Not configured'}
              </span>
            </p>
            <p>
              <span className="font-medium">Razorpay Key:</span>{' '}
              <span className="text-gray-600">
                {process.env.REACT_APP_RAZORPAY_KEY_ID ? 'Configured' : 'Not configured'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;