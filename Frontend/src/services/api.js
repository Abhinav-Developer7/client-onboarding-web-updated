import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://onboarding-backend.tsuite.in/api';

/**
 * Pre-configured Axios instance
 * Enforces withCredentials for HTTP-only JWT cookie sharing with backend
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization Bearer token as fallback for environments blocking cross-site cookies
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('tortillon_auth_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Standardize response data and error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (axios.isCancel?.(error) || error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
      const canceled = new Error('Request canceled');
      canceled.isCanceled = true;
      return Promise.reject(canceled);
    }

    const status = error.response ? error.response.status : null;
    const data = error.response ? error.response.data : null;

    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('tortillon_auth_token');
    }

    const formattedError = new Error(
      (data && data.message) || error.message || 'An unexpected network error occurred'
    );
    formattedError.status = status;
    formattedError.errors = (data && data.errors) || [];
    formattedError.isNetworkError = !error.response;

    return Promise.reject(formattedError);
  }
);

export const apiService = {
  // Service health check
  checkHealth: () => apiClient.get('/health'),

  // Public Onboarding Submission
  submitOnboarding: (payload) => apiClient.post('/public/onboarding', payload),

  // Staff Authentication
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),

  // Dashboard Aggregated Metrics (Counts, 5 Recent, Monthly Chart)
  getDashboardStats: () => apiClient.get('/dashboard/stats'),

  // Staff Clients Management with Server-side Pagination & Filtering
  getClients: (params = {}, config = {}) =>
    apiClient.get('/clients', { params, ...config }),
  getClientDetails: (id) => apiClient.get(`/clients/${id}`),
  updateClientStatus: (id, payload) => apiClient.patch(`/clients/${id}/status`, payload),

  // Backward-compatible aliases
  getSubmissions: (params = {}) => apiClient.get('/onboarding', { params }),
  getSubmissionById: (id) => apiClient.get(`/onboarding/${id}`),
  updateSubmissionStatus: (id, payload) => apiClient.patch(`/onboarding/${id}/status`, payload)
};

export default apiService;
