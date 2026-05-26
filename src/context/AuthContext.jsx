import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize authentication profile on startup
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await API.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session validation failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid credentials';
      return { success: false, message: errMsg };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const res = await API.post('/auth/register', { name, email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      return { success: false, message: errMsg };
    }
  };

  // Update pet preference (Do you have pets questionnaire)
  const updatePetPreference = async (hasPet) => {
    try {
      const res = await API.put('/auth/update-pet-preference', { hasPet });
      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update pet preference';
      return { success: false, message: errMsg };
    }
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updatePetPreference
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
