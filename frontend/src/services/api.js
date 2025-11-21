import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/token/', { username, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/users/register/', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },
  refreshToken: async (refresh) => {
    const response = await api.post('/token/refresh/', { refresh });
    return response.data;
  },
};

// Restaurant API
export const restaurantAPI = {
  getRestaurants: async (params = {}) => {
    const response = await api.get('/restaurants/', { params });
    // Handle paginated response
    return response.data.results || response.data;
  },
  getRestaurant: async (id) => {
    const response = await api.get(`/restaurants/${id}/`);
    return response.data;
  },
  getRestaurantMenu: async (restaurantId) => {
    const response = await api.get(`/restaurants/${restaurantId}/menu/`);
    return response.data;
  },
};

// Menu API
export const menuAPI = {
  getMenuItems: async (params = {}) => {
    const response = await api.get('/menu-items/', { params });
    return response.data;
  },
  getMenuItem: async (id) => {
    const response = await api.get(`/menu-items/${id}/`);
    return response.data;
  },
  getCategories: async (params = {}) => {
    const response = await api.get('/categories/', { params });
    return response.data;
  },
};

// Order API
export const orderAPI = {
  getOrders: async (params = {}) => {
    // Get ALL orders (for admin use)
    const response = await api.get('/orders/', { params });
    return response.data;
  },
  getMyOrders: async () => {
    // Get only current user's orders
    const response = await api.get('/orders/my_orders/');
    return response.data;
  },
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  },
  createOrder: async (orderData) => {
    const response = await api.post('/orders/', orderData);
    return response.data;
  },
  cancelOrder: async (id) => {
    const response = await api.post(`/orders/${id}/cancel/`);
    return response.data;
  },
};

// Payment API
export const paymentAPI = {
  getPaymentMethods: async () => {
    const response = await api.get('/payment-methods/my_payment_methods/');
    return response.data;
  },
  createPaymentMethod: async (paymentData) => {
    const response = await api.post('/payment-methods/', paymentData);
    return response.data;
  },
  setDefaultPayment: async (id) => {
    const response = await api.post(`/payment-methods/${id}/set_default/`);
    return response.data;
  },
  deletePaymentMethod: async (id) => {
    const response = await api.delete(`/payment-methods/${id}/`);
    return response.data;
  },
};

export default api;
