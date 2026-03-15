import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly backendBaseUrl = 'http://localhost:3333';

  constructor(private authService: AuthService) {}

  private isBackendRequest(url: string): boolean {
    return url.startsWith(this.backendBaseUrl) || url.startsWith('/');
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isBackendRequest = this.isBackendRequest(request.url);

    // Get token from auth service
    const token = this.authService.getToken();

    // Clone request and add Authorization header if token exists
    if (token && isBackendRequest) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
}
