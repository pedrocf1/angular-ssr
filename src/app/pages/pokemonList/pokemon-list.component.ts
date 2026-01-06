import { Component, OnInit, inject, signal, HostListener, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { PokeApiService } from '../../services/pokeapi.service';
import { PokemonModalComponent } from '../../components/pokemon-modal/pokemon-modal.component';
import { NamedAPIResource, NamedAPIResourceList, Pokemon } from 'pokenode-ts';
import { PokemonTypeIconComponent } from '../../components/pokemon-type-icon/pokemon-type-icon.component';
import { distinctUntilChanged } from 'rxjs';

export interface PokemonItem {
  name: string;
  url: string;
  pokemonDetails?: Pokemon | null;
}


@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PokemonModalComponent, PokemonTypeIconComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonListComponent implements OnInit {
  private pokeApiService = inject(PokeApiService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private document = inject(DOCUMENT);

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
    this.loadPokemonList();
    this.activatedRoute.queryParams
      // .pipe(distinctUntilChanged((prev, curr) => prev['pokemon'] === curr['pokemon']))
      .subscribe(params => {
        if (params['pokemon']) {
          this.openPokemonModal(params['pokemon']);
        }
      });
  }

  private loadPokemonList(): void {
    this.isLoading.set(true);
    this.offset.set(0);

    this.pokeApiService
      .getPokemonsList(this.itemsPerPage(), 0)
      .then((response: NamedAPIResourceList) => {
        this.totalCount.set(response.count);
        this.fetchPokemonDetails(response.results, true);
      })
      .catch((error) => {
        console.error('Error loading pokemon list:', error);
        this.isLoading.set(false);
      });
  }

  loadMorePokemon(): void {
    if (this.isLoadingMore() || !this.hasMoreResults()) return;

    this.isLoadingMore.set(true);
    const newOffset = this.offset() + this.itemsPerPage();
    this.offset.set(newOffset);

    this.pokeApiService
      .getPokemonsList(this.itemsPerPage(), newOffset)
      .then((response: NamedAPIResourceList) => {
        if (response.results.length === 0) {
          this.hasMoreResults.set(false);
        }
        this.fetchPokemonDetails(response.results, false);
      })
      .catch((error) => {
        console.error('Error loading more pokemon:', error);
        this.isLoadingMore.set(false);
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
        .then(details => {
          this.pokemonList.update(current => 
            current.map(item => 
              item.name === pokemon.name 
                ? { ...item, pokemonDetails: details }
                : item
            )
          );
        })
        .catch(error => {
          console.error(`Error loading pokemon ${pokemon.name}:`, error);
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
      .then((data) => {
        this.selectedPokemon.set(data);
        this.showModal.set(true);
        this.modalLoading.set(false);
      })
      .catch((error) => {
        console.error('Error loading pokemon details:', error);
        this.modalLoading.set(false);
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
}
