import { Component, OnInit, inject, signal, Output, EventEmitter, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PokeApiService } from '../../services/pokeapi.service';
import { distinctUntilChanged, debounceTime, Subject, switchMap, filter } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Pokemon } from 'pokenode-ts';

export interface PokemonItem {
  name: string;
  url: string;
  pokemonDetails?: Pokemon | null;
}

@Component({
  selector: 'app-pokemon-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-search.component.html',
  styleUrl: './pokemon-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonSearchComponent implements OnInit {
  private pokeApiService = inject(PokeApiService);
  private destroyRef = inject(DestroyRef);

  searchQuery = signal<string>('');
  searchResults = signal<PokemonItem[]>([]);
  isSearching = signal<boolean>(false);

  @Output() searchResultSelected = new EventEmitter<string>();

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    // Setup search with debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(query => query.trim() !== ''),
        switchMap(query =>
          this.pokeApiService.getPokemonByName(query.toLowerCase())
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (pokemon: any) => {
          const searchResult: PokemonItem = {
            name: pokemon.name,
            url: `${pokemon.id}/`,
            pokemonDetails: pokemon
          };
          this.searchResults.set([searchResult]);
          this.isSearching.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error searching pokemon:', error);
          this.searchResults.set([]);
          this.isSearching.set(false);
        }
      });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    if (query.trim() !== '') {
      this.isSearching.set(true);
    } else {
      this.searchResults.set([]);
      this.isSearching.set(false);
    }
    this.searchSubject.next(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.isSearching.set(false);
    this.searchSubject.next('');
  }

  selectSearchResult(pokemonName: string): void {
    this.clearSearch();
    this.searchResultSelected.emit(pokemonName);
  }

  getPokemonImageUrl(url: string): string {
    // Extract Pokemon ID from URL (format: https://pokeapi.co/api/v2/pokemon/123/)
    const id = url.split('/').filter(part => part).pop();
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
}
