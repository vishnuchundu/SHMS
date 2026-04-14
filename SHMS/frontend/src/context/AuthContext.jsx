import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Global boot loading state
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const bootstrapContext = () => {
      const token = localStorage.getItem('shms_token');
      if (token) {
        try {
          // Decode standard JWT string parsing payload claims locally
          const decodedPayload = jwtDecode(token);
          
          // Token expire boundary structural check natively preventing stale payloads
          if (decodedPayload.exp * 1000 < Date.now()) {
            logout();
          } else {
            setUser({
              sub: decodedPayload.sub,
              roles: decodedPayload.roles || [], // Spring Security writes arrays dynamically
              token
            });
          }
        } catch (err) {
          console.error("JWT Decode structural failure", err);
          logout();
        }
      }
      setLoading(false);
    };
    bootstrapContext();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const token = response.data.token;
      
      localStorage.setItem('shms_token', token);
      
      const decoded = jwtDecode(token);
      setUser({
        sub: decoded.sub,
        roles: decoded.roles || [],
        token,
        mustChangePassword: response.data.mustChangePassword || false,
      });

      navigate('/');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('shms_token');
    setUser(null);
    queryClient.clear();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
