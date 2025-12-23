import { Component, OnInit, inject, signal, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PokeApiService } from '../../services/pokeapi.service';
import { PokemonModalComponent } from '../../components/pokemon-modal/pokemon-modal.component';
import { Pokemon } from 'pokenode-ts';

interface PokemonItem {
  name: string;
  url: string;
  types?: Array<{ type: { name: string } }>;
}

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonItem[];
}

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PokemonModalComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
})
export class PokemonListComponent implements OnInit {
  private pokeApiService = inject(PokeApiService);

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
      if (this.showModal()) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    });
  }

  ngOnInit(): void {
    this.loadPokemonList();
  }

  private loadPokemonList(): void {
    this.isLoading.set(true);
    this.offset.set(0);

    this.pokeApiService
      .getPokemonsList(this.itemsPerPage(), 0)
      .then((response: PokemonListResponse) => {
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
      .then((response: PokemonListResponse) => {
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

  private fetchPokemonDetails(pokemonResults: PokemonItem[], isInitial: boolean): void {
    const pokemonWithTypes = pokemonResults.map(pokemon => 
      this.pokeApiService.getPokemonByName(pokemon.name)
        .then(details => ({
          ...pokemon,
          types: details.types
        }))
    );

    Promise.all(pokemonWithTypes)
      .then(results => {
        if (isInitial) {
          this.pokemonList.set(results);
          this.isLoading.set(false);
        } else {
          this.pokemonList.update(current => [...current, ...results]);
          this.isLoadingMore.set(false);
        }
      })
      .catch(error => {
        console.error('Error loading pokemon types:', error);
        if (isInitial) {
          this.pokemonList.set(pokemonResults);
          this.isLoading.set(false);
        } else {
          this.pokemonList.update(current => [...current, ...pokemonResults]);
          this.isLoadingMore.set(false);
        }
      });
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
    return pokemon.types?.[0]?.type?.name || 'unknown';
  }

  openPokemonModal(pokemonName: string): void {
    console.log('Opening modal for:', pokemonName);
    this.modalLoading.set(true);
    this.pokeApiService
      .getPokemonByName(pokemonName)
      .then((data) => {
        console.log('Pokemon data loaded:', data);
        this.selectedPokemon.set(data);
        this.showModal.set(true);
        this.modalLoading.set(false);
      })
      .catch((error) => {
        console.error('Error loading pokemon details:', error);
        this.modalLoading.set(false);
      });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedPokemon.set(null);
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
