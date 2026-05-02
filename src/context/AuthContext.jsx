import { createContext, useContext, useEffect, useState } from 'react';
import { authRequest, request } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = async () => {
    const token = localStorage.getItem('ttm_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await request('/auth/me');
      if (data._id) {
        setUser(data);
      } else {
        localStorage.removeItem('ttm_token');
      }
    } catch (err) {
      localStorage.removeItem('ttm_token');
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
        setError(null);
        if (data.user) {
          setUser(data.user);
        } else {
          await loadUser();
        }
      }
      return data;
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { error: message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const data = await authRequest('/auth/signup', 'POST', { name, email, password });
      if (data.token) {
        localStorage.setItem('ttm_token', data.token);
        setError(null);
        if (data.user) {
          setUser(data.user);
        } else {
          await loadUser();
        }
      }
      return data;
    } catch (err) {
      const message = err.message || 'Signup failed';
      setError(message);
      return { error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('ttm_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
