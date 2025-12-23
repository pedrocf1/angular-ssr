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
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(20);
  isLoading = signal<boolean>(false);
  selectedPokemon = signal<Pokemon | null>(null);
  showModal = signal<boolean>(false);
  modalLoading = signal<boolean>(false);

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
    const offset = (this.currentPage() - 1) * this.itemsPerPage();

    this.pokeApiService
      .getPokemonsList(this.itemsPerPage(), offset)
      .then((response: PokemonListResponse) => {
        // Fetch types for each pokemon
        const pokemonWithTypes = response.results.map(pokemon => 
          this.pokeApiService.getPokemonByName(pokemon.name)
            .then(details => ({
              ...pokemon,
              types: details.types
            }))
        );

        Promise.all(pokemonWithTypes)
          .then(results => {
            this.pokemonList.set(results);
            this.totalCount.set(response.count);
            this.isLoading.set(false);
          })
          .catch(error => {
            console.error('Error loading pokemon types:', error);
            this.pokemonList.set(response.results);
            this.totalCount.set(response.count);
            this.isLoading.set(false);
          });
      })
      .catch((error) => {
        console.error('Error loading pokemon list:', error);
        this.isLoading.set(false);
      });
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update((page) => page + 1);
      this.loadPokemonList();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update((page) => page - 1);
      this.loadPokemonList();
    }
  }

  hasNextPage(): boolean {
    return (
      this.currentPage() * this.itemsPerPage() < this.totalCount()
    );
  }

  hasPreviousPage(): boolean {
    return this.currentPage() > 1;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalCount() / this.itemsPerPage());
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

  onModalClose(): void {
    this.closeModal();
  }
}
