import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthPanelComponent } from './components/auth-panel/auth-panel.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('ssr-test');
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Refresh auth from localStorage after component initializes
    setTimeout(() => {
      this.authService.refreshAuthFromStorage();
    }, 100);
  }
}

