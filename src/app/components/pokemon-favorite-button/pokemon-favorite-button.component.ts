import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { FavoritePokemonService } from '../../services/favorite-pokemon.service';

@Component({
  selector: 'app-pokemon-favorite-button',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="toggle($event)"
      class="absolute top-3 right-3 z-10 text-2xl leading-none transition-colors"
      [class.text-yellow-400]="isFavorite()"
      [class.text-slate-400]="!isFavorite()"
      aria-label="Toggle favorite"
    >
      {{ isFavorite() ? '★' : '☆' }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonFavoriteButtonComponent {
  private favoriteService = inject(FavoritePokemonService);

  /** The pokeapi numeric ID of the pokemon. */
  pokemonId = input.required<number>();

  /** The pokemon name (sent when creating a favorite). */
  pokemonName = input.required<string>();

  /** Derived from the shared favorites map — no HTTP call per button. */
  isFavorite = computed(() => this.favoriteService.isFavorite(this.pokemonId()));

  toggle(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isFavorite()) {
      this.favoriteService.remove(this.pokemonId());
    } else {
      this.favoriteService.add(this.pokemonId(), this.pokemonName());
    }
  }
}
