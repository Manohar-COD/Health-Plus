import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Set default auth header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  const fetchCurrentUser = async (authToken) => {
    try {
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user profile', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('token', userToken);
      setToken(userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.name}!`);
      return { ok: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', { name, email, password });
      const { token: userToken, user: userData } = res.data;

      localStorage.setItem('token', userToken);
      setToken(userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      setUser(userData);

      toast.success(`Welcome to Health Plus, ${userData.name}!`);
      return { ok: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/profile', profileData);
      setUser(res.data.user);
      toast.success('Profile updated successfully!');
      return true;
    } catch (err) {
      toast.error('Failed to update profile.');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
