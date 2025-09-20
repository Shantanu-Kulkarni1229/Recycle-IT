import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || '';

// Create axios instance for payment API
const paymentAPI = axios.create({
  baseURL: `${API_BASE_URL}/payments`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
paymentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('recyclerToken') || localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreateOrderRequest {
  amount: number; // Amount in paise (INR)
  serviceType: 'pickup' | 'consultation' | 'inspection';
  deviceInfo?: string;
  pickupAddress?: string;
  notes?: Record<string, any>;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    createdAt: number;
  };
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    email?: string;
    contact?: string;
    createdAt: number;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: {
    payments: any[];
    count: number;
  };
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, any>;
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export class PaymentService {
  // Create Razorpay order
  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const response = await paymentAPI.post('/create-order', orderData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }

  // Verify payment signature
  async verifyPayment(verificationData: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      const response = await paymentAPI.post('/verify', verificationData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  }

  // Get payment history
  async getPaymentHistory(page = 1, limit = 10): Promise<PaymentHistoryResponse> {
    try {
      const response = await paymentAPI.get(`/history?count=${limit}&skip=${(page - 1) * limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }

  // Get payment details by order ID
  async getPaymentByOrderId(orderId: string) {
    try {
      const response = await paymentAPI.get(`/order/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment details');
    }
  }

  // Initiate Razorpay payment
  async initiatePayment(
    orderData: CreateOrderRequest,
    userDetails: {
      name: string;
      email: string;
      contact: string;
    },
    onSuccess: (paymentData: any) => void,
    onError: (error: any) => void
  ) {
    try {
      // Create order first
      const orderResponse = await this.createOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message);
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => this.openRazorpayCheckout(orderResponse, userDetails, onSuccess, onError);
        script.onerror = () => onError(new Error('Failed to load Razorpay SDK'));
        document.body.appendChild(script);
      } else {
        this.openRazorpayCheckout(orderResponse, userDetails, onSuccess, onError);
      }
    } catch (error) {
      onError(error);
    }
  }

  // Open Razorpay checkout
  private openRazorpayCheckout(
    orderResponse: CreateOrderResponse,
    userDetails: { name: string; email: string; contact: string },
    onSuccess: (paymentData: any) => void,
    onError: (error: any) => void
  ) {
    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: orderResponse.data.amount,
      currency: orderResponse.data.currency,
      name: 'Recycle\'IT',
      description: 'E-waste Management Service Payment',
      order_id: orderResponse.data.razorpayOrderId,
      handler: async (response: any) => {
        try {
          // Verify payment
          const verificationResponse = await this.verifyPayment({
            orderId: orderResponse.data.razorpayOrderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });

          if (verificationResponse.success) {
            onSuccess({
              ...response,
              orderData: orderResponse.data,
              verificationData: verificationResponse.data,
            });
          } else {
            onError(new Error(verificationResponse.message));
          }
        } catch (error) {
          onError(error);
        }
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.contact,
      },
      notes: {
        orderId: orderResponse.data.orderId,
      },
      theme: {
        color: '#10B981', // Green color for Recycle'IT theme
      },
      modal: {
        ondismiss: () => {
          onError(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  }

  // Convert rupees to paise
  static rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
  }

  // Convert paise to rupees
  static paiseToRupees(paise: number): number {
    return paise / 100;
  }
}

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const paymentService = new PaymentService();
export default paymentService;