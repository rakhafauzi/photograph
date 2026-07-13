import api from './api';
import type { ApiResponse, AuthTokens, User, LoginData, RegisterData } from '@/types';

class AuthService {
  private readonly endpoint = '/auth';

  async login(data: LoginData): Promise<{ user: User } & AuthTokens> {
    const response = await api.post<ApiResponse<{ user: User } & AuthTokens>>(
      `${this.endpoint}/login`,
      data
    );
    const result = response.data.data!;
    this.setTokens(result);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  }

  async register(data: RegisterData): Promise<{ user: User } & AuthTokens> {
    const response = await api.post<ApiResponse<{ user: User } & AuthTokens>>(
      `${this.endpoint}/register`,
      data
    );
    const result = response.data.data!;
    this.setTokens(result);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  }

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`${this.endpoint}/me`);
    return response.data.data!;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post(`${this.endpoint}/logout`, { refreshToken });
    } catch {
      // Ignore errors
    }
    this.clearAuth();
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await api.post<ApiResponse<AuthTokens>>(`${this.endpoint}/refresh-token`, {
      refreshToken,
    });
    const tokens = response.data.data!;
    this.setTokens(tokens);
    return tokens;
  }

  getStoredUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'admin';
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();
export default authService;
