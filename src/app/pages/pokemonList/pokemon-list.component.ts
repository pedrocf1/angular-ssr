import { Component, OnInit, inject, signal, HostListener, effect, ChangeDetectionStrategy, DestroyRef, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PokeApiService } from '../../services/pokeapi.service';
import { PokemonModalComponent } from '../../components/pokemon-modal/pokemon-modal.component';
import { NamedAPIResource, NamedAPIResourceList, Pokemon } from 'pokenode-ts';
import { PokemonTypeIconComponent } from '../../components/pokemon-type-icon/pokemon-type-icon.component';
import { PokemonTypeFilterComponent } from '../../components/pokemon-type-filter/pokemon-type-filter.component';
import { PokemonSearchComponent } from '../../components/pokemon-search/pokemon-search.component';
import { HttpErrorResponse } from '@angular/common/http';
import { BackendApiService } from '../../services/backend-api.service';

export interface PokemonItem {
  name: string;
  url: string;
  pokemonDetails?: Pokemon | null;
}

export interface PokemonType {
  name: string;
  url: string;
}


@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PokemonModalComponent, PokemonTypeIconComponent, PokemonTypeFilterComponent, PokemonSearchComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonListComponent implements OnInit {
  private pokeApiService = inject(PokeApiService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private backendApi = inject(BackendApiService);
  private platformId = inject(PLATFORM_ID);

  pokemonList = signal<PokemonItem[]>([]);
  totalCount = signal<number>(0);
  itemsPerPage = signal<number>(20);
  isLoading = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  selectedPokemon = signal<Pokemon | null>(null);
  showModal = signal<boolean>(false);
  modalLoading = signal<boolean>(false);
  offset = signal<number>(0);
  hasMoreResults = signal<boolean>(true);
  typesList = signal<PokemonType[]>([]);
  selectedType = signal<string>('');
  favoriteRecordByPokemonId = signal<Record<string, string | number>>({});
  favoriteRecordByName = signal<Record<string, string | number>>({});
  favoriteLoadingState = signal<Record<string, boolean>>({});

  constructor() {
    // Watch for modal state changes and update body overflow
    effect(() => {
      const body = this.document.body;
      if (body) {
        if (this.showModal()) {
          body.classList.add('overflow-hidden');
        } else {
          body.classList.remove('overflow-hidden');
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadTypesList();
    this.loadPokemonList();
    if (isPlatformBrowser(this.platformId)) {
      this.loadFavoritePokemon();
    }
    this.activatedRoute.queryParams
      // .pipe(distinctUntilChanged((prev, curr) => prev['pokemon'] === curr['pokemon']))
      .subscribe(params => {
        if (params['pokemon']) {
          this.openPokemonModal(params['pokemon']);
        }
      });
  }

  private loadFavoritePokemon(): void {
    this.backendApi.getFavoritePokemon<unknown[]>()
      .subscribe({
        next: (favorites) => {
          const byPokemonId: Record<string, string | number> = {};
          const byName: Record<string, string | number> = {};

          for (const favorite of favorites ?? []) {
            const recordId = this.extractFavoriteRecordId(favorite);
            if (!recordId) {
              continue;
            }

            const pokemonId = this.extractFavoritePokemonId(favorite);
            if (pokemonId) {
              byPokemonId[pokemonId] = recordId;
            }

            const pokemonName = this.extractFavoritePokemonName(favorite);
            if (pokemonName) {
              byName[pokemonName] = recordId;
            }
          }

          this.favoriteRecordByPokemonId.set(byPokemonId);
          this.favoriteRecordByName.set(byName);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading favorite pokemon:', error);
        }
      });
  }

  private extractFavoriteRecordId(value: unknown): string | number | null {
    const favorite = (value ?? {}) as Record<string, unknown>;
    const candidate = favorite['id'];
    if (typeof candidate === 'number' || typeof candidate === 'string') {
      return candidate;
    }
    return null;
  }

  private extractFavoritePokemonId(value: unknown): string | null {
    const favorite = (value ?? {}) as Record<string, unknown>;
    const candidate = favorite['pokemonId'] ?? favorite['pokemon_id'] ?? favorite['pokeapiId'];
    if (typeof candidate === 'number' || typeof candidate === 'string') {
      return String(candidate);
    }
    return null;
  }

  private extractFavoritePokemonName(value: unknown): string | null {
    const favorite = (value ?? {}) as Record<string, unknown>;
    const candidate = favorite['pokemonName'] ?? favorite['pokemon_name'] ?? favorite['name'];
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim().toLowerCase();
    }
    return null;
  }

  private getFavoriteRecordId(pokemon: PokemonItem): string | number | null {
    const pokemonId = this.getPokemonId(pokemon.url);
    const byId = this.favoriteRecordByPokemonId()[pokemonId];
    if (byId !== undefined) {
      return byId;
    }

    const byName = this.favoriteRecordByName()[pokemon.name.toLowerCase()];
    if (byName !== undefined) {
      return byName;
    }

    return null;
  }

  private getFavoriteKey(pokemon: PokemonItem): string {
    const pokemonId = this.getPokemonId(pokemon.url);
    return pokemonId ? `id:${pokemonId}` : `name:${pokemon.name.toLowerCase()}`;
  }

  isFavorite(pokemon: PokemonItem): boolean {
    return this.getFavoriteRecordId(pokemon) !== null;
  }

  isFavoriteLoading(pokemon: PokemonItem): boolean {
    return this.favoriteLoadingState()[this.getFavoriteKey(pokemon)] === true;
  }

  toggleFavorite(pokemon: PokemonItem, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const loadingKey = this.getFavoriteKey(pokemon);
    if (this.favoriteLoadingState()[loadingKey]) {
      return;
    }

    this.favoriteLoadingState.update(current => ({ ...current, [loadingKey]: true }));

    const favoriteRecordId = this.getFavoriteRecordId(pokemon);

    if (favoriteRecordId !== null) {
      this.backendApi.deleteFavoritePokemon(favoriteRecordId)
        .subscribe({
          next: () => {
            this.loadFavoritePokemon();
            this.favoriteLoadingState.update(current => ({ ...current, [loadingKey]: false }));
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error removing favorite pokemon:', error);
            this.favoriteLoadingState.update(current => ({ ...current, [loadingKey]: false }));
          }
        });
      return;
    }

    this.backendApi.createFavoritePokemon(
      {
        pokemonId: Number(this.getPokemonId(pokemon.url)),
        pokemonName: pokemon.name,
      }
    )
      .subscribe({
        next: () => {
          this.loadFavoritePokemon();
          this.favoriteLoadingState.update(current => ({ ...current, [loadingKey]: false }));
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error creating favorite pokemon:', error);
          this.favoriteLoadingState.update(current => ({ ...current, [loadingKey]: false }));
        }
      });
  }

  private loadTypesList(): void {
    this.pokeApiService
      .getTypesList(30, 0)
      .subscribe({
        next: (response: NamedAPIResourceList) => {
          // Deduplicate types by name
          const uniqueTypes = Array.from(
            new Map(response.results.map(type => [type.name, type])).values()
          ).sort((a, b) => a.name.localeCompare(b.name));
          this.typesList.set(uniqueTypes);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading types list:', error);
        }
      });
  }

  private loadPokemonList(): void {
    this.isLoading.set(true);
    this.offset.set(0);

    this.pokeApiService
      .getPokemonsList(this.itemsPerPage(), 0)
      .subscribe({
        next: (response: NamedAPIResourceList) => {
          this.totalCount.set(response.count);
          this.fetchPokemonDetails(response.results, true);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading pokemon list:', error);
          this.isLoading.set(false);
        }
      });
  }

  loadMorePokemon(): void {
    if (this.isLoadingMore() || !this.hasMoreResults()) return;

    this.isLoadingMore.set(true);
    const newOffset = this.offset() + this.itemsPerPage();
    this.offset.set(newOffset);

    this.pokeApiService
      .getPokemonsList(this.itemsPerPage(), newOffset)
      .subscribe({
        next: (response: NamedAPIResourceList) => {
          if (response.results.length === 0) {
            this.hasMoreResults.set(false);
          }
          this.fetchPokemonDetails(response.results, false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading more pokemon:', error);
          this.isLoadingMore.set(false);
        }
      });
  }

  private fetchPokemonDetails(pokemonResults: NamedAPIResource[], isInitial: boolean): void {
    // First, add the items without details
    const initialItems = pokemonResults.map(p => ({ ...p, pokemonDetails: null } as PokemonItem));
    
    if (isInitial) {
      this.pokemonList.set(initialItems);
    } else {
      this.pokemonList.update(current => [...current, ...initialItems]);
    }

    // Then fetch details for each pokemon and update the array
    pokemonResults.forEach(pokemon => {
      this.pokeApiService.getPokemonByName(pokemon.name)
        .subscribe({
          next: (details: Pokemon) => {
            this.pokemonList.update(current => 
              current.map(item => 
                item.name === pokemon.name 
                  ? { ...item, pokemonDetails: details }
                  : item
              )
            );
          },
          error: (error: HttpErrorResponse) => {
            console.error(`Error loading pokemon ${pokemon.name}:`, error);
          }
        });
    });

    this.isLoading.set(false);
    this.isLoadingMore.set(false);
  }

  getPokemonImageUrl(url: string): string {
    // Extract Pokemon ID from URL (format: https://pokeapi.co/api/v2/pokemon/123/)
    const id = url.split('/').filter(part => part).pop();
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  getPokemonId(url: string): string {
    // Extract Pokemon ID from URL (format: https://pokeapi.co/api/v2/pokemon/123/)
    return url.split('/').filter(part => part).pop() || '';
  }

  getFirstType(pokemon: PokemonItem): string {
    return pokemon.pokemonDetails?.types?.[0]?.type?.name || 'unknown';
  }

  openPokemonModal(pokemonName: string): void {
    // Don't fetch if already selected
    if (this.selectedPokemon()?.name === pokemonName && this.showModal()) {
      return;
    }

    this.modalLoading.set(true);
    this.pokeApiService
      .getPokemonByName(pokemonName)
      .subscribe({
        next: (data: Pokemon) => {
          this.selectedPokemon.set(data);
          this.showModal.set(true);
          this.modalLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading pokemon details:', error);
          this.modalLoading.set(false);
        }
      });
  }

  selectPokemonDetail(pokemonName: string): void {
    this.router.navigate([], { 
      relativeTo: this.activatedRoute,
      queryParams: { pokemon: pokemonName },
      queryParamsHandling: 'merge',
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedPokemon.set(null);
    // Remove pokemon from query params
    this.router.navigate([], { 
      relativeTo: this.activatedRoute,
      queryParams: { pokemon: null },
      queryParamsHandling: 'merge'
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 500; // Load more when 500px from bottom

    if (scrollPosition >= threshold && !this.isLoadingMore() && this.hasMoreResults()) {
      this.loadMorePokemon();
    }
  }

  onModalClose(): void {
    this.closeModal();
  }

  toggleTypeFilter(type: PokemonType): void {
    this.selectedType.set(
      this.selectedType() === type.name ? '' : type.name
    );
  }

  isTypeSelected(type: PokemonType): boolean {
    return this.selectedType() === type.name;
  }

  onTypeFilterChange(type: PokemonType): void {
    if (type.name === '') {
      this.selectedType.set('');
      this.loadPokemonList();
    } else {
      this.selectedType.set(type.name);
      this.isLoading.set(true);
      this.offset.set(0);
      this.hasMoreResults.set(true);
      
      this.pokeApiService
        .getPokemonsByTypeUrl(type.url)
        .subscribe({
          next: (response: NamedAPIResourceList) => {
            this.totalCount.set(response.count);
            this.fetchPokemonDetails(response.results, true);
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error loading pokemon by type:', error);
            this.isLoading.set(false);
          }
        });
    }
  }

  getFilteredPokemonList(): PokemonItem[] {
    const selectedType = this.selectedType();
    if (!selectedType) {
      return this.pokemonList();
    }
    return this.pokemonList().filter(pokemon => 
      pokemon.pokemonDetails?.types?.some(t => t.type.name === selectedType)
    );
  }

  onSearchResultSelected(pokemonName: string): void {
    this.selectPokemonDetail(pokemonName);
  }
}
