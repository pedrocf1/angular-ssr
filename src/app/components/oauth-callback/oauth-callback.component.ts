import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-lg mb-4">Processing authentication...</p>
        <p class="text-sm text-gray-500 mb-4">{{ debugMessage }}</p>
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  `,
  styles: []
})
export class OAuthCallbackComponent implements OnInit {
  debugMessage = 'Processing authentication...';
  private platformId = inject(PLATFORM_ID);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  private normalizeTokenValue(value: string | null): string | null {
    if (!value) {
      return null;
    }

    return value.trim().replace(/ /g, '+');
  }

  private parseCallbackParams(): { token: string | null; user: unknown | null } {
    const searchParams = new URLSearchParams(window.location.search);
    const hashValue = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hashValue);

    const getParam = (keys: string[]): string | null => {
      for (const key of keys) {
        const fromSearch = searchParams.get(key);
        if (fromSearch) {
          return fromSearch;
        }

        const fromHash = hashParams.get(key);
        if (fromHash) {
          return fromHash;
        }
      }

      return null;
    };

    const token = this.normalizeTokenValue(getParam(['token', 'access_token', 'accessToken', 'auth_token', 'access-token', 'jwt']));
    const userRaw = getParam(['user', 'userData', 'profile']);
    const user = this.parseUser(userRaw, token);

    return { token, user };
  }

  private parseUser(userRaw: string | null, token: string | null): unknown | null {
    if (userRaw) {
      try {
        return JSON.parse(userRaw);
      } catch {
        try {
          return JSON.parse(decodeURIComponent(userRaw));
        } catch {
          try {
            const normalized = userRaw.replace(/-/g, '+').replace(/_/g, '/');
            const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4 || 4)) % 4, '=');
            const decoded = atob(padded);
            return JSON.parse(decoded);
          } catch {
            return null;
          }
        }
      }
    }

    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = payload.padEnd(payload.length + (4 - (payload.length % 4 || 4)) % 4, '=');
      const decoded = atob(paddedPayload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Parse query params directly from the URL
    const { token, user } = this.parseCallbackParams();

    if (token) {
      this.authService.handleCallback(token, user);
      this.debugMessage = 'Authentication successful! Redirecting in 3 seconds...';
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    } else {
      console.error('No authentication token found in callback URL');
      this.debugMessage = 'No authentication data received';
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }
  }
}
