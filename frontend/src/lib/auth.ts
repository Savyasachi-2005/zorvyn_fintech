import api from './api';
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
  UserFromAPI,
  JWTPayload,
} from '../types';
import { normalizeUser as normalize } from '../types';

interface TokenResponse {
  access_token: string;
  token_type: string;
}

/**
 * Decode JWT payload without verification (browser-side).
 * We trust the server signed it; we just need the claims for UI.
 */
function decodeJWT(token: string): JWTPayload {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(json);
}

export const authService = {
  /**
   * Login: POST /login with OAuth2 form data (username + password).
   * FastAPI's OAuth2PasswordRequestForm expects form-encoded with "username" field.
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const { data } = await api.post<TokenResponse>('/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const token = data.access_token;
    localStorage.setItem('token', token);

    // Decode JWT to get user id and role
    const payload = decodeJWT(token);

    // Build a partial user from the JWT + credentials
    const user: User = {
      id: parseInt(payload.sub),
      name: '', // Will be filled by fetchMe
      email: credentials.email,
      role: payload.role,
      isActive: true,
      createdAt: '',
    };

    // Try to fetch full user profile
    try {
      const profileRes = await api.get<UserFromAPI>('/users/me');
      const fullUser = normalize(profileRes.data);
      localStorage.setItem('user', JSON.stringify(fullUser));
      return { user: fullUser, token };
    } catch {
      // If /users/me doesn't exist, use JWT-derived user
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    }
  },

  /**
   * Register: POST /register with JSON body.
   * Returns UserPublic (no token), so we auto-login after.
   */
  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    // Register the user
    await api.post<UserFromAPI>('/register', {
      email: credentials.email,
      full_name: credentials.full_name,
      password: credentials.password,
    });

    // Auto-login to get the JWT
    return this.login({ email: credentials.email, password: credentials.password });
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = decodeJWT(token);
      // Check expiration
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};
