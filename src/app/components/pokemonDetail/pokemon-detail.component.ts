import { Component, OnInit, Input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PokeApiService } from '../../services/pokeapi.service';
import { Pokemon, Type } from 'pokenode-ts';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
})
export class PokemonDetailComponent implements OnInit {
  @Input() pokemonData: Pokemon | null = null;

  private activatedRoute = inject(ActivatedRoute);
  private pokeApiService = inject(PokeApiService);
  
  pokemon = signal<Pokemon | null>(null);
  firstTypeData = signal<Type | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  typeLoading = signal(false);

  constructor() {
    // Watch for pokemon changes and fetch type data
    effect(() => {
      const pokemonData = this.pokemon();
      if (pokemonData) {
        console.log('Pokemon signal changed, fetching type data');
        this.fetchFirstTypeData();
      }
    });
  }

  ngOnInit() {
    // If pokemonData is provided as input (from modal), use it directly
    if (this.pokemonData) {
      this.pokemon.set(this.pokemonData);
      return;
    }

    // Otherwise, fetch from route params (original behavior for direct navigation)
    const name = this.activatedRoute.snapshot.paramMap.get('name');
    if (name) {
      this.loading.set(true);
      this.pokeApiService
        .getPokemonByName(name)
        .then((data) => {
          this.pokemon.set(data);
          console.log('Pokemon fetched:', data);
          this.loading.set(false);
        })
        .catch((err: any) => {
          this.error.set(`Failed to load pokemon: ${err?.message || 'Unknown error'}`);
          this.loading.set(false);
        });
    }
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
      .then((typeData: any) => {
        this.firstTypeData.set(typeData);
        console.log('Type data fetched:', typeData);
        this.typeLoading.set(false);
      })
      .catch((error: any) => {
        console.error('Error loading type data:', error);
        this.typeLoading.set(false);
      });
  }

  getFirstTypeData() {
    return this.firstTypeData();
  }

}
