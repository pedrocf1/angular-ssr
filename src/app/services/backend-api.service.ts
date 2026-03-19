import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { FavoritePokemon } from '../types/api.types';

export type RequestOptions = {
  params?: HttpParams | Record<string, string | number | boolean>;
  headers?: HttpHeaders | Record<string, string | string[]>;
};

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private readonly baseUrl = 'http://localhost:3333';
  private readonly favoritePokemonPath = '/favorite-pokemon';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private withAuth(options?: RequestOptions): RequestOptions | undefined {
    const token = this.authService.getToken() ?? this.getSessionToken();
    if (!token) {
      return options;
    }

    const currentHeaders = options?.headers;

    if (currentHeaders instanceof HttpHeaders) {
      if (currentHeaders.has('Authorization')) {
        return options;
      }

      return {
        ...options,
        headers: currentHeaders.set('Authorization', `Bearer ${token}`)
      };
    }

    const normalizedHeaders: Record<string, string | string[]> = {
      ...(currentHeaders ?? {})
    };

    if (!('Authorization' in normalizedHeaders)) {
      normalizedHeaders['Authorization'] = `Bearer ${token}`;
    }

    return {
      ...options,
      headers: normalizedHeaders
    };
  }

  private getSessionToken(): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    try {
      const rawToken = sessionStorage.getItem('auth_token');
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
    } catch {
      return null;
    }
  }

  get<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), this.withAuth(options));
  }

  post<TResponse, TBody = unknown>(path: string, body: TBody, options?: RequestOptions): Observable<TResponse> {
    return this.http.post<TResponse>(this.buildUrl(path), body, this.withAuth(options));
  }

  put<TResponse, TBody = unknown>(path: string, body: TBody, options?: RequestOptions): Observable<TResponse> {
    return this.http.put<TResponse>(this.buildUrl(path), body, this.withAuth(options));
  }

  patch<TResponse, TBody = unknown>(path: string, body: TBody, options?: RequestOptions): Observable<TResponse> {
    return this.http.patch<TResponse>(this.buildUrl(path), body, this.withAuth(options));
  }

  delete<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(path), this.withAuth(options));
  }

  getFavoritePokemons(options?: RequestOptions): Observable<FavoritePokemon[]> {
    return this.get<FavoritePokemon[]>(this.favoritePokemonPath, options);
  }

  getFavoritePokemonById<T = unknown>(id: number | string, options?: RequestOptions): Observable<T> {
    return this.get<T>(`${this.favoritePokemonPath}/${id}`, options);
  }

  createFavoritePokemon<TResponse = unknown, TBody = unknown>(
    body: TBody,
    options?: RequestOptions
  ): Observable<TResponse> {
    return this.post<TResponse, TBody>(this.favoritePokemonPath, body, options);
  }

  updateFavoritePokemon<TResponse = unknown, TBody = unknown>(
    id: number | string,
    body: TBody,
    options?: RequestOptions
  ): Observable<TResponse> {
    return this.put<TResponse, TBody>(`${this.favoritePokemonPath}/${id}`, body, options);
  }

  patchFavoritePokemon<TResponse = unknown, TBody = unknown>(
    id: number | string,
    body: TBody,
    options?: RequestOptions
  ): Observable<TResponse> {
    return this.patch<TResponse, TBody>(`${this.favoritePokemonPath}/${id}`, body, options);
  }

  deleteFavoritePokemon<T = unknown>(id: number | string, options?: RequestOptions): Observable<T> {
    return this.delete<T>(`${this.favoritePokemonPath}/${id}`, options);
  }

  private buildUrl(path: string): string {
    if (!path) {
      return this.baseUrl;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }
}
