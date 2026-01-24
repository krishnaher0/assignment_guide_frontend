import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  // Verify token with backend
  const verifyToken = useCallback(async (storedUser) => {
    if (!storedUser?.token) {
      return null;
    }

    try {
      // Call backend to verify token and get fresh user data
      const { data } = await api.get('/auth/me');

      // Verify the role matches what we have stored
      if (data.role !== storedUser.role) {
        console.warn('Role mismatch detected. Using server role.');
        // Update with correct role from server
        const updatedUser = { ...storedUser, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }

      // Update user with fresh data from server (preserving token)
      const updatedUser = { ...storedUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Token is invalid, clear storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Verify token with backend
          const verifiedUser = await verifyToken(parsedUser);
          setUser(verifiedUser);
          setVerified(true);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [verifyToken]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    setVerified(true);
    return data;
  };

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    setVerified(true);
    return data;
  };

  const logout = useCallback(() => {
    // Clear all auth-related storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    setUser(null);
    setVerified(false);
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Re-verify token periodically (every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const verifiedUser = await verifyToken(parsedUser);
          if (!verifiedUser) {
            logout();
          } else {
            setUser(verifiedUser);
          }
        } catch (e) {
          logout();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, verifyToken, logout]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      verified,
      setUser,
      updateUser,
      verifyToken
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
