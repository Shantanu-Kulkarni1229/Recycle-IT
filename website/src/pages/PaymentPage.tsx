import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft,
  Smartphone,
  Laptop,
  Monitor,
  Printer,
  HardDrive,
  Loader2
} from 'lucide-react';

interface PaymentPageProps {}

interface PaymentData {
  serviceType: 'pickup' | 'consultation' | 'inspection';
  amount: number;
  deviceInfo?: string;
  pickupAddress?: string;
  deviceType?: string;
  description?: string;
}

const PaymentPage: React.FC<PaymentPageProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [animationStep, setAnimationStep] = useState(0);

  // Get user data
  const getUserData = () => {
    try {
      const recyclerData = localStorage.getItem('recyclerData');
      const userData = localStorage.getItem('userData');
      
      if (recyclerData) {
        const data = JSON.parse(recyclerData);
        return {
          name: data.ownerName || data.name || 'User',
          email: data.email || '',
          contact: data.phoneNumber || data.phone || '',
          userType: 'recycler'
        };
      } else if (userData) {
        const data = JSON.parse(userData);
        return {
          name: data.name || 'User',
          email: data.email || '',
          contact: data.phone || '',
          userType: 'user'
        };
      } else {
        return {
          name: 'Guest User',
          email: '',
          contact: '',
          userType: 'guest'
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {
        name: 'Guest User',
        email: '',
        contact: '',
        userType: 'guest'
      };
    }
  };

  const userData = getUserData();

  useEffect(() => {
    // Get payment data from location state or localStorage
    if (location.state?.paymentData) {
      setPaymentData(location.state.paymentData);
    } else {
      // Try to get from localStorage (in case of page refresh)
      const savedPaymentData = localStorage.getItem('pendingPaymentData');
      if (savedPaymentData) {
        setPaymentData(JSON.parse(savedPaymentData));
        localStorage.removeItem('pendingPaymentData'); // Clean up
      } else {
        // Redirect back if no payment data
        navigate('/pickup-management');
      }
    }
  }, [location, navigate]);

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type.includes('laptop') || type.includes('notebook')) return <Laptop className="w-6 h-6" />;
    if (type.includes('mobile') || type.includes('phone')) return <Smartphone className="w-6 h-6" />;
    if (type.includes('monitor') || type.includes('display')) return <Monitor className="w-6 h-6" />;
    if (type.includes('printer')) return <Printer className="w-6 h-6" />;
    if (type.includes('drive') || type.includes('storage')) return <HardDrive className="w-6 h-6" />;
    return <Monitor className="w-6 h-6" />; // Default icon
  };

  const getServiceTypeName = (serviceType: string) => {
    switch (serviceType) {
      case 'pickup': return 'E-waste Pickup Service';
      case 'consultation': return 'Consultation Service';
      case 'inspection': return 'Device Inspection Service';
      default: return 'Service';
    }
  };

  // Generate mock payment IDs
  const generateMockPaymentId = () => {
    return 'pay_' + Math.random().toString(36).substr(2, 14);
  };

  const generateMockOrderId = () => {
    return 'order_' + Math.random().toString(36).substr(2, 14);
  };

  // Bypass payment function with animation
  const handlePaymentBypass = async () => {
    if (!paymentData) return;

    setIsProcessing(true);
    setError('');

    // Animation sequence
    const animationSequence = [
      { step: 1, message: 'Connecting to Razorpay...', duration: 800 },
      { step: 2, message: 'Verifying payment details...', duration: 1000 },
      { step: 3, message: 'Processing payment...', duration: 1200 },
      { step: 4, message: 'Payment successful!', duration: 500 },
    ];

    for (let i = 0; i < animationSequence.length; i++) {
      const { step, duration } = animationSequence[i];
      setAnimationStep(step);
      
      await new Promise(resolve => setTimeout(resolve, duration));
    }

    // Generate mock payment details
    const mockPaymentDetails = {
      razorpay_payment_id: generateMockPaymentId(),
      razorpay_order_id: generateMockOrderId(),
      razorpay_signature: 'sig_' + Math.random().toString(36).substr(2, 20),
      amount: paymentData.amount,
      serviceType: paymentData.serviceType,
      timestamp: new Date().toISOString()
    };

    // Complete the payment
    setSuccess(true);
    setPaymentDetails(mockPaymentDetails);
    setIsProcessing(false);
    setAnimationStep(0);
    
    // Store payment success data
    localStorage.setItem('lastPaymentSuccess', JSON.stringify({
      ...mockPaymentDetails,
      timestamp: new Date().toISOString()
    }));
  };

  const getAnimationMessage = () => {
    switch (animationStep) {
      case 1: return 'Connecting to Razorpay...';
      case 2: return 'Verifying payment details...';
      case 3: return 'Processing payment...';
      case 4: return 'Payment successful!';
      default: return 'Processing...';
    }
  };

  const handleBackToDashboard = () => {
    if (success) {
      navigate('/pickup-management', { 
        state: { 
          message: 'Payment completed successfully!',
          paymentDetails 
        } 
      });
    } else {
      navigate('/pickup-management');
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Payment Processing Animation Overlay
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {/* Animated Razorpay Logo Placeholder */}
            <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            
            {/* Progress Animation */}
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                {animationStep >= 1 && (
                  <div className={`w-4 h-4 rounded-full mr-2 ${animationStep >= 4 ? 'bg-green-500' : 'bg-blue-500'} ${animationStep === 1 ? 'animate-pulse' : ''}`}></div>
                )}
                {animationStep >= 2 && (
                  <div className={`w-4 h-4 rounded-full mr-2 ${animationStep >= 4 ? 'bg-green-500' : 'bg-blue-500'} ${animationStep === 2 ? 'animate-pulse' : ''}`}></div>
                )}
                {animationStep >= 3 && (
                  <div className={`w-4 h-4 rounded-full mr-2 ${animationStep >= 4 ? 'bg-green-500' : 'bg-blue-500'} ${animationStep === 3 ? 'animate-pulse' : ''}`}></div>
                )}
                {animationStep >= 4 && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
              
              <p className="text-lg font-medium text-gray-900 mb-2">
                {getAnimationMessage()}
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(animationStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Amount Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Amount to be paid</p>
              <p className="text-2xl font-bold text-gray-900">₹{paymentData.amount}</p>
            </div>

            {/* Spinning loader for active steps */}
            {animationStep < 4 && (
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. You will receive a confirmation email shortly.
            </p>

            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-gray-900 mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Payment ID:</strong> {paymentDetails.razorpay_payment_id}</p>
                  <p><strong>Order ID:</strong> {paymentDetails.razorpay_order_id}</p>
                  <p><strong>Amount:</strong> ₹{paymentData.amount}</p>
                  <p><strong>Service:</strong> {getServiceTypeName(paymentData.serviceType)}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleBackToDashboard}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {paymentData.deviceType && getDeviceIcon(paymentData.deviceType)}
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        {getServiceTypeName(paymentData.serviceType)}
                      </p>
                      {paymentData.deviceInfo && (
                        <p className="text-sm text-gray-600">{paymentData.deviceInfo}</p>
                      )}
                      {paymentData.description && (
                        <p className="text-sm text-gray-600">{paymentData.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{paymentData.amount}</p>
                  </div>
                </div>

                {paymentData.pickupAddress && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Pickup Address:</p>
                    <p className="text-sm text-blue-800">{paymentData.pickupAddress}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{paymentData.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-900">Secure Payment</h3>
                  <p className="text-blue-800 text-sm mt-1">
                    Your payment is secured by Razorpay's 256-bit SSL encryption. 
                    We don't store your card details.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-red-900">Payment Error</h3>
                    <p className="text-red-800 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Action */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">₹{paymentData.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="text-gray-900">₹0</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">₹{paymentData.amount}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePaymentBypass}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-colors ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay with Razorpay
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By proceeding, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;