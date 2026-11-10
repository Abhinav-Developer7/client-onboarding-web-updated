import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check active session on initial mount
  useEffect(() => {
    const checkSession = async () => {
      // Re-apply stored token before verifying session
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('tortillon_auth_token');
        if (storedToken) {
          setAuthToken(storedToken);
        }
      }

      try {
        const response = await apiService.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          setAuthToken(null);
          setUser(null);
        }
      } catch (err) {
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (credentials) => {
    const response = await apiService.login(credentials);
    if (response.success && response.user) {
      if (response.token) {
        setAuthToken(response.token);
      }
      setUser(response.user);
      return response.user;
    }
    throw new Error(response.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
