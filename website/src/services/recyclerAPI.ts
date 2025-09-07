import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend API URL - same as existing backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('recyclerToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Auth API calls (based on existing RecyclerController)
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/recyclers/login', { email, password }),
    
  register: (data: any) =>
    api.post('/recyclers/register', data),
    
  verifyOTP: (email: string, otp: string) =>
    api.post('/recyclers/verify-otp', { email, otp }),
    
  forgotPassword: (email: string) =>
    api.post('/recyclers/forgot-password', { email }),
    
  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post('/recyclers/reset-password', { email, otp, newPassword }),
    
  resendOTP: (email: string) =>
    api.post('/recyclers/resend-otp', { email }),
    
  getProfile: () =>
    api.get('/recyclers/profile'),
    
  updateProfile: (data: any) =>
    api.put('/recyclers/profile', data),
    
  uploadDocuments: (formData: FormData) =>
    api.post('/recyclers/upload-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Pickup API calls (based on existing backend endpoints)
export const pickupAPI = {
  getAssignedEwaste: () =>
    api.get('/recyclers/assigned-ewaste'),
    
  updateInspectionStatus: (data: any) =>
    api.put('/recyclers/inspection-status', data),
    
  getPickupById: (id: string) =>
    api.get(`/schedule-pickup/${id}`),
    
  updatePickupStatus: (pickupId: string, status: string) =>
    api.put(`/schedule-pickup/${pickupId}/status`, { status }),
    
  getRecyclerPickups: (recyclerId: string) =>
    api.get(`/recycler-pickups/recycler/${recyclerId}`),
    
  createInspectionReport: (data: any) =>
    api.post('/recycler-pickups', data),
    
  updateInspectionReport: (id: string, data: any) =>
    api.put(`/recycler-pickups/${id}`, data),
};

export default api;
