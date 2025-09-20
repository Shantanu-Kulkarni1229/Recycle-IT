import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('recyclerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('recyclerToken');
      localStorage.removeItem('recyclerData');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/recyclers/login', { email, password });
    return response.data;
  },

  register: async (recyclerData: any) => {
    const response = await api.post('/recyclers/register', recyclerData);
    return response.data;
  },

  testCreate: async (recyclerData: any) => {
    const response = await api.post('/recyclers/test-create', recyclerData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/recyclers/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/recyclers/reset-password', { token, newPassword });
    return response.data;
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await api.post('/recyclers/verify-otp', { email, otp });
    return response.data;
  },

  resendOTP: async (email: string) => {
    const response = await api.post('/recyclers/resend-otp', { email });
    return response.data;
  },
};

// Profile APIs
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/recyclers/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/recyclers/profile', profileData);
    return response.data;
  },

  uploadDocuments: async (formData: FormData) => {
    const response = await api.post('/recyclers/upload-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/recyclers/delete');
    return response.data;
  },
};

// E-waste Management APIs
export const ewasteAPI = {
  getAssignedEwaste: async () => {
    const response = await api.get('/recyclers/assigned-ewaste');
    return response.data;
  },

  updateInspectionStatus: async (ewasteId: string, status: string, notes?: string) => {
    const response = await api.put('/recyclers/inspection-status', {
      ewasteId,
      status,
      notes,
    });
    return response.data;
  },
};

// Schedule Pickup APIs (for viewing pickups assigned to recycler)
export const pickupAPI = {
  getAllPickups: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    city?: string;
    state?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/schedule-pickup?${queryParams.toString()}`);
    return response.data;
  },

  getPickupById: async (id: string) => {
    const response = await api.get(`/schedule-pickup/${id}`);
    return response.data;
  },

  getUserPickups: async (userId: string) => {
    const response = await api.get(`/schedule-pickup/user/${userId}`);
    return response.data;
  },

  updatePickupStatus: async (id: string, status: string) => {
    const response = await api.put(`/schedule-pickup/${id}/status`, { status });
    return response.data;
  },

  trackPickup: async (id: string) => {
    const response = await api.get(`/schedule-pickup/${id}/track`);
    return response.data;
  },

  assignRecycler: async (id: string, recyclerId: string) => {
    const response = await api.put(`/schedule-pickup/${id}/assign-recycler`, { recyclerId });
    return response.data;
  },

  assignDeliveryPartner: async (id: string, deliveryPartnerId: string) => {
    const response = await api.put(`/schedule-pickup/${id}/assign-partner`, { deliveryPartnerId });
    return response.data;
  },
};

// Recycler Pickup APIs (detailed pickup management)
export const recyclerPickupAPI = {
  getRecyclerPickups: async (recyclerId: string) => {
    const response = await api.get(`/recycler-pickup/recycler/${recyclerId}`);
    return response.data;
  },

  confirmReceived: async (id: string) => {
    const response = await api.put(`/recycler-pickup/${id}/confirm-received`);
    return response.data;
  },

  inspectDevice: async (id: string, inspectionData: any) => {
    const response = await api.put(`/recycler-pickup/${id}/inspect`, inspectionData);
    return response.data;
  },

  updateInspectionStatus: async (id: string, status: string, notes?: string) => {
    const response = await api.put(`/recycler-pickup/${id}/inspection-status`, {
      status,
      notes,
    });
    return response.data;
  },

  proposePayment: async (id: string, paymentData: any) => {
    const response = await api.put(`/recycler-pickup/${id}/propose-payment`, paymentData);
    return response.data;
  },

  finalizePayment: async (id: string, paymentData: any) => {
    const response = await api.put(`/recycler-pickup/${id}/finalize-payment`, paymentData);
    return response.data;
  },

  rejectDevice: async (id: string, reason: string) => {
    const response = await api.put(`/recycler-pickup/${id}/reject`, { reason });
    return response.data;
  },

  sendInspectionReport: async (id: string) => {
    const response = await api.get(`/recycler-pickup/${id}/send-report`);
    return response.data;
  },
};

export default api;
