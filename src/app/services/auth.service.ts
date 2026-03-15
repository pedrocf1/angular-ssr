import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3333';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  private currentTokenSubject = new BehaviorSubject<string | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient) {
    // Load stored auth on initialization (will work if localStorage is available)
    if (this.hasLocalStorage()) {
      this.loadUserFromStorage();
    }
  }

  private normalizeToken(rawToken: string | null | undefined): string | null {
    if (!rawToken) {
      return null;
    }

    let token = rawToken.trim();

    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      token = token.slice(1, -1).trim();
    }

    if (token.toLowerCase().startsWith('bearer ')) {
      token = token.slice(7).trim();
    }

    return token.length > 0 ? token : null;
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payload.padEnd(payload.length + (4 - (payload.length % 4 || 4)) % 4, '=');
      const decoded = atob(padded);
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private userFromTokenOrFallback(token: string): AuthUser {
    const payload = this.decodeJwtPayload(token) ?? {};
    const idValue = payload['id'] ?? payload['userId'] ?? payload['sub'];
    const parsedId = typeof idValue === 'number'
      ? idValue
      : typeof idValue === 'string'
        ? Number(idValue)
        : 0;

    const fullName =
      (payload['fullName'] as string | undefined) ||
      (payload['name'] as string | undefined) ||
      (payload['login'] as string | undefined) ||
      'Authenticated User';

    const email = (payload['email'] as string | undefined) || '';

    return {
      id: Number.isNaN(parsedId) ? 0 : parsedId,
      fullName,
      email,
    };
  }

  private hasWindow(): boolean {
    return typeof window !== 'undefined';
  }

  private hasLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }

  private hasSessionStorage(): boolean {
    return typeof sessionStorage !== 'undefined';
  }

  /**
   * Start OAuth flow with GitHub
   */
  private loadUserFromStorage(): void {
    if (!this.hasLocalStorage()) {
      return;
    }

    try {
      const token = localStorage.getItem(this.tokenKey);
      const user = localStorage.getItem(this.userKey);
      const normalizedToken = this.normalizeToken(token);

      if (normalizedToken) {
        this.currentTokenSubject.next(normalizedToken);
        if (normalizedToken !== token) {
          localStorage.setItem(this.tokenKey, normalizedToken);
        }
      }

      if (normalizedToken && user) {
        try {
          const userData = JSON.parse(user);
          this.currentUserSubject.next(userData);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          const fallbackUser = this.userFromTokenOrFallback(normalizedToken);
          localStorage.setItem(this.userKey, JSON.stringify(fallbackUser));
          this.currentUserSubject.next(fallbackUser);
        }
      } else if (normalizedToken) {
        const fallbackUser = this.userFromTokenOrFallback(normalizedToken);
        localStorage.setItem(this.userKey, JSON.stringify(fallbackUser));
        this.currentUserSubject.next(fallbackUser);
      }
    } catch (e) {
      // localStorage not available in SSR context
    }
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    const memoryToken = this.normalizeToken(this.currentTokenSubject.value);
    if (memoryToken) {
      if (memoryToken !== this.currentTokenSubject.value) {
        this.currentTokenSubject.next(memoryToken);
      }
      return memoryToken;
    }

    if (!this.hasLocalStorage()) {
      return null;
    }

    try {
      const storedToken = this.normalizeToken(localStorage.getItem(this.tokenKey));
      if (storedToken) {
        this.currentTokenSubject.next(storedToken);
        localStorage.setItem(this.tokenKey, storedToken);
      }
      return storedToken;
    } catch {
      return null;
    }
  }

  /**
   * Get the current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Manually refresh auth from localStorage (call after page loads)
   */
  refreshAuthFromStorage(): void {
    if (!this.hasLocalStorage()) {
      return;
    }

    try {
      const token = localStorage.getItem(this.tokenKey);
      const user = localStorage.getItem(this.userKey);
      const normalizedToken = this.normalizeToken(token);

      if (normalizedToken) {
        this.currentTokenSubject.next(normalizedToken);
        if (normalizedToken !== token) {
          localStorage.setItem(this.tokenKey, normalizedToken);
        }
      }

      if (normalizedToken && user) {
        try {
          const userData = JSON.parse(user);
          this.currentUserSubject.next(userData);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          const fallbackUser = this.userFromTokenOrFallback(normalizedToken);
          localStorage.setItem(this.userKey, JSON.stringify(fallbackUser));
          this.currentUserSubject.next(fallbackUser);
        }
      } else if (normalizedToken) {
        const fallbackUser = this.userFromTokenOrFallback(normalizedToken);
        localStorage.setItem(this.userKey, JSON.stringify(fallbackUser));
        this.currentUserSubject.next(fallbackUser);
      }
    } catch (e) {
      // localStorage not available
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Start OAuth flow with GitHub
   */
  getGithubAuthUrl(): string {
    return `${this.apiUrl}/auth/github`;
  }

  /**
   * Start OAuth flow with GitHub
   */
  loginWithGithub(): void {
    if (!this.hasWindow()) {
      return;
    }

    window.location.assign(this.getGithubAuthUrl());
  }

  /**
   * Handle OAuth callback from Adonis
   */
  private normalizeUser(user: unknown): AuthUser {
    const source = (user ?? {}) as Record<string, unknown>;
    const idValue = source['id'];
    const parsedId = typeof idValue === 'number'
      ? idValue
      : typeof idValue === 'string'
        ? Number(idValue)
        : 0;

    const fullName =
      (source['fullName'] as string | undefined) ||
      (source['name'] as string | undefined) ||
      (source['login'] as string | undefined) ||
      (source['username'] as string | undefined) ||
      'GitHub User';

    const email = (source['email'] as string | undefined) || '';

    return {
      id: Number.isNaN(parsedId) ? 0 : parsedId,
      fullName,
      email,
    };
  }

  handleCallback(token: string, user: unknown): void {
    const normalizedUser = this.normalizeUser(user);
    const normalizedToken = this.normalizeToken(token);

    if (!normalizedToken) {
      return;
    }

    this.currentTokenSubject.next(normalizedToken);

    if (this.hasSessionStorage()) {
      try {
        sessionStorage.setItem(this.tokenKey, normalizedToken);
      } catch (e) {
        console.error('Error saving token to sessionStorage:', e);
      }
    }

    if (this.hasLocalStorage()) {
      try {
        localStorage.setItem(this.tokenKey, normalizedToken);
        localStorage.setItem(this.userKey, JSON.stringify(normalizedUser));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
    
    this.currentUserSubject.next(normalizedUser);
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuth();
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    this.currentTokenSubject.next(null);

    if (this.hasSessionStorage()) {
      try {
        sessionStorage.removeItem(this.tokenKey);
      } catch (e) {
        // sessionStorage not available
      }
    }

    if (this.hasLocalStorage()) {
      try {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
      } catch (e) {
        // localStorage not available
      }
    }
    this.currentUserSubject.next(null);
  }
}
