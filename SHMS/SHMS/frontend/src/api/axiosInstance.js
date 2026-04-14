import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Intercept all outgoing requests to append the JWT structure
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept unauthenticated API traces natively rejecting out invalid parameters
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('shms_token');
      // Rather than a harsh window.location.href, context manages state changes dynamically, but this acts as an absolute fail-safe.
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
