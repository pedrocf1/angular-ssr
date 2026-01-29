import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      
      const token = params['token'];
      const user = params['user'];

      if (token && user) {
        try {
          const userData = JSON.parse(user);
          this.authService.handleCallback(token, userData);
          this.debugMessage = 'Authentication successful! Redirecting in 3 seconds...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        } catch (e) {
          console.error('Failed to parse user data:', e);
          this.debugMessage = 'Error processing authentication';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        }
      } else {
        console.error('No token or user data in query params');
        this.debugMessage = 'No authentication data received';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      }
    });
  }
}
