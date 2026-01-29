import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient) {
    // Load stored auth on initialization (will work if localStorage is available)
    this.loadUserFromStorage();
  }

  /**
   * Start OAuth flow with GitHub
   */
  private loadUserFromStorage(): void {
    try {
      const token = localStorage.getItem(this.tokenKey);
      const user = localStorage.getItem(this.userKey);

      if (token && user) {
        try {
          const userData = JSON.parse(user);
          this.currentUserSubject.next(userData);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          this.clearAuth();
        }
      }
    } catch (e) {
      // localStorage not available in SSR context
    }
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
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
    try {
      const token = localStorage.getItem(this.tokenKey);
      const user = localStorage.getItem(this.userKey);

      if (token && user) {
        try {
          const userData = JSON.parse(user);
          this.currentUserSubject.next(userData);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
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
  loginWithGithub(): void {
    window.location.href = `${this.apiUrl}/auth/github`;
  }

  /**
   * Handle OAuth callback from Adonis
   */
  handleCallback(token: string, user: AuthUser): void {
    try {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
    
    this.currentUserSubject.next(user);
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
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    } catch (e) {
      // localStorage not available
    }
    this.currentUserSubject.next(null);
  }
}
