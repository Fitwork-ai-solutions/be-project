import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authReady, setAuthReady] = useState(false);

  const login = useCallback((userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    if (jwt) localStorage.setItem('token', jwt);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    if (!token) {
      setAuthReady(true);
      return;
    }
    api.get('/users/me')
      .then(({ data }) => {
        setUser(data.user);
      })
      .catch(() => {
        logout();
      })
      .finally(() => setAuthReady(true));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = { user, token, login, logout, isAuthenticated: !!token, authReady };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
