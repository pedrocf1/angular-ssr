import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Pokemon, PokemonType } from '../../types/api.types';
import { PokeApiService } from '../../services/pokeapi.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-pokemon-damage-relations',
  imports: [CommonModule],
  templateUrl: './pokemon-damage-relations.html',
  styleUrl: './pokemon-damage-relations.scss',
})
export class PokemonDamageRelationsComponent {
  private pokeApiService = inject(PokeApiService);
  pokemon = input<Pokemon | null>(null);

  firstTypeData = signal<PokemonType | null>(null);
  typeLoading = signal(false);

  constructor() {
    // Watch for pokemon changes and fetch type data
    effect(() => {
      const pokemonData = this.pokemon();
      if (pokemonData) {
        this.fetchFirstTypeData();
      }
    });
  }

  private fetchFirstTypeData(): void {
    if (!this.pokemon()?.types || this.pokemon()!.types.length === 0) {
      return;
    }

    const firstTypeUrl = this.pokemon()!.types[0].type.url;
    if (!firstTypeUrl) {
      return;
    }

    this.typeLoading.set(true);
    // Extract type ID from URL and fetch the type data
    const typeId = firstTypeUrl.split('/').filter(part => part).pop();
    
    this.pokeApiService
      .getTypeById(parseInt(typeId || '0', 10))
      .subscribe({
        next: (typeData: PokemonType) => {
          this.firstTypeData.set(typeData);
          this.typeLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading type data:', error);
          this.typeLoading.set(false);
        }
      });
  }
}
