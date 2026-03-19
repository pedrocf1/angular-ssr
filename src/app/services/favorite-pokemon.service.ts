import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BackendApiService } from './backend-api.service';
import { FavoritePokemon } from '../types/api.types';

@Injectable({ providedIn: 'root' })
export class FavoritePokemonService {
  private backendApi = inject(BackendApiService);
  private platformId = inject(PLATFORM_ID);

  /** All favorite records from the backend. */
  private readonly _favorites = signal<FavoritePokemon[]>([]);

  /** Read-only signal consumers can use. */
  readonly favorites = this._favorites.asReadonly();

  /** Quick lookup: pokemonId → backend record id. */
  readonly favoritesMap = computed(() => {
    const map = new Map<number, number>();
    for (const f of this._favorites()) {
      map.set(f.pokemonId, f.id);
    }
    return map;
  });

  private loaded = false;
  private loading = false;

  /** Load favorites once. Safe to call from many components — only fires one HTTP request. */
  load(): void {
    if (!isPlatformBrowser(this.platformId) || this.loaded || this.loading) {
      return;
    }

    this.loading = true;
    this.backendApi.getFavoritePokemons().subscribe({
      next: (favorites) => {
        this._favorites.set(favorites);
        this.loaded = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.loading = false;
      },
    });
  }

  /** Force-refresh from the backend (e.g. after add/remove). */
  refresh(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.backendApi.getFavoritePokemons().subscribe({
      next: (favorites) => this._favorites.set(favorites),
      error: (err) => console.error('Error refreshing favorites:', err),
    });
  }

  isFavorite(pokemonId: number): boolean {
    return this.favoritesMap().has(pokemonId);
  }

  getRecordId(pokemonId: number): number | undefined {
    return this.favoritesMap().get(pokemonId);
  }

  add(pokemonId: number, pokemonName: string): void {
    this.backendApi.createFavoritePokemon({ pokemonId, pokemonName }).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Error creating favorite:', err),
    });
  }

  remove(pokemonId: number): void {
    const recordId = this.getRecordId(pokemonId);
    if (recordId === undefined) {
      return;
    }

    this.backendApi.deleteFavoritePokemon(recordId).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Error removing favorite:', err),
    });
  }
}
