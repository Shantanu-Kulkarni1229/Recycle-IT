import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance for admin API calls
const adminAPI = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include admin token
adminAPI.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Admin token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

export const adminApiService = {
  // Get dashboard statistics
  getDashboardStats: () => adminAPI.get('/stats'),

  // Get all recyclers
  getAllRecyclers: () => adminAPI.get('/recyclers'),

  // Get recycler by ID
  getRecyclerById: (id: string) => adminAPI.get(`/recyclers/${id}`),

  // Update recycler verification status
  updateRecyclerVerification: (id: string, isVerified: boolean) =>
    adminAPI.put(`/recyclers/${id}/verify`, { isVerified }),

  // Get all transactions
  getAllTransactions: () => adminAPI.get('/transactions'),
};

export default adminApiService;
