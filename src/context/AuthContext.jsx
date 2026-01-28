import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';
import { toast } from '../utils/toastService';

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

  const login = async (email, password, captchaToken = null) => {
    const { data } = await api.post('/auth/login', {
      email,
      password,
      captchaToken
    });

    console.log('[AuthContext] Login response:', data);

    // Check for intermediate MFA step
    if (data.mfaRequired) {
      console.log('[AuthContext] MFA required, returning MFA response');
      return {
        mfaRequired: true,
        userId: data.userId,
        message: data.message
      };
    }

    console.log('[AuthContext] No MFA, proceeding with normal login');
    localStorage.setItem('user', JSON.stringify(data));
    if (data.sessionId) {
      localStorage.setItem('sessionId', data.sessionId);
    }
    setUser(data);
    setVerified(true);
    return data;
  };

  const verifyMfaLogin = async (userId, token, isBackupCode = false) => {
    const { data } = await api.post('/mfa/verify-login', {
      userId,
      token,
      isBackupCode
    });

    if (data.success) {
      if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
        if (data.sessionId) {
          localStorage.setItem('sessionId', data.sessionId);
        }
        setUser(data);
        setVerified(true);
        return data;
      }
    }
    return data;
  };

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });

    // If email verification is required, don't log in yet
    if (data.requiresVerification) {
      return data;
    }

    localStorage.setItem('user', JSON.stringify(data));
    if (data.sessionId) {
      localStorage.setItem('sessionId', data.sessionId);
    }
    setUser(data);
    setVerified(true);
    return data;
  };

  const logout = useCallback(() => {
    // Clear all auth-related storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('sessionId');
    setUser(null);
    setVerified(false);
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateUserProfile = async (profileData) => {
    try {
      const { data } = await api.put('/users/profile', profileData);

      // Merge new profile data with existing user data (to keep token/role)
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return data;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
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

  // Inactivity Logout (2 minutes)
  useEffect(() => {
    if (!user) return;

    let inactivityTimer;
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 2 minutes in milliseconds

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('[AuthContext] User inactive for 2 minutes, logging out...');
        toast.warning('Session expired due to inactivity');
        logout();
      }, INACTIVITY_LIMIT);
    };

    // Events to track user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    // Initialize timer
    resetTimer();

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, logout]);

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
      updateUserProfile,
      verifyToken,
      verifyMfaLogin
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
