import { useState, useCallback, useEffect } from 'react';
import type { User, LoginCredentials, RegisterCredentials, AuthState } from '../types';
import { authService } from '../lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    user: authService.getUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
  }));

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        setAuthState({
          user: authService.getUser(),
          token: authService.getToken(),
          isAuthenticated: authService.isAuthenticated(),
        });
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user, token } = await authService.login(credentials);
    setAuthState({ user, token, isAuthenticated: true });
    return user;
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const { user, token } = await authService.register(credentials);
    setAuthState({ user, token, isAuthenticated: true });
    return user;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setAuthState({ user: null, token: null, isAuthenticated: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState((prev) => ({ ...prev, user }));
  }, []);

  const hasRole = useCallback(
    (roles: string | string[]) => {
      if (!authState.user) return false;
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(authState.user.role);
    },
    [authState.user]
  );

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    hasRole,
  };
}
