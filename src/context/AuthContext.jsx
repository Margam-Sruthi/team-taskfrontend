import { createContext, useContext, useEffect, useState } from 'react';
import { authRequest, request } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const setAuthData = (data) => {
    const normalizedRole = data.role?.toLowerCase();
    const allowedRoles = ['admin', 'member'];

    if (!allowedRoles.includes(normalizedRole)) {
      throw new Error('Invalid role received from authentication response');
    }

    localStorage.setItem('ttm_role', normalizedRole);
    setUser({ _id: data._id, name: data.name, email: data.email, role: normalizedRole });
    setError(null);
  };

  const clearAuthData = () => {
    localStorage.removeItem('ttm_token');
    localStorage.removeItem('ttm_role');
    localStorage.removeItem('role');
    setUser(null);
    setError(null);
  };

  const loadUser = async () => {
    const token = localStorage.getItem('ttm_token');
    if (!token) {
      clearAuthData();
      setLoading(false);
      return;
    }

    try {
      const data = await request('/auth/me');
      console.log('[Auth] loadUser response:', data);
      if (data._id) {
        setAuthData(data);
      } else {
        clearAuthData();
      }
    } catch (err) {
      clearAuthData();
      setError(err.message || 'Session expired');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authRequest('/auth/login', 'POST', { email, password });
      if (data.token) {
        localStorage.setItem('ttm_token', data.token);
        setAuthData(data);
        console.log('[Auth] login stored role:', data.role, 'token:', !!data.token);
        setError(null);
      }
      return data;
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { error: message };
    }
  };

  const signup = async (name, email, password, role = 'member') => {
    try {
      const data = await authRequest('/auth/signup', 'POST', { name, email, password, role });
      if (data.token) {
        localStorage.setItem('ttm_token', data.token);
        setAuthData(data);
        console.log('[Auth] signup stored role:', data.role, 'token:', !!data.token);
        setError(null);
      }
      return data;
    } catch (err) {
      const message = err.message || 'Signup failed';
      setError(message);
      return { error: message };
    }
  };

  const logout = () => {
    clearAuthData();
  };

  const role = user?.role || null;
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, loading, error, login, signup, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
