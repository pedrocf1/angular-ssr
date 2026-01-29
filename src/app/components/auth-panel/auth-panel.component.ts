import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-4">
      <ng-container *ngIf="(currentUser$ | async) as user; else notLoggedIn">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-700">{{ user.fullName }}</span>
          <button
            (click)="logout()"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </ng-container>
      <ng-template #notLoggedIn>
        <button
          (click)="loginWithGithub()"
          class="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition flex items-center gap-2"
        >
          <span>GitHub Login</span>
        </button>
      </ng-template>
    </div>
  `,
  styles: []
})
export class AuthPanelComponent {
  get currentUser$() {
    return this.authService.currentUser$;
  }

  constructor(private authService: AuthService) {}

  loginWithGithub(): void {
    this.authService.loginWithGithub();
  }

  logout(): void {
    this.authService.logout();
  }
}
