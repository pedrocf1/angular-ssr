import { Component, OnInit, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PokeApiService } from '../../services/pokeapi.service';
import { Pokemon } from 'pokenode-ts';

@Component({
  selector: 'pokemon-detail.component',
  imports: [JsonPipe],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
})
export class PokemonDetailComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private pokeApiService = inject(PokeApiService);
  
  pokemon = signal<Pokemon | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  evolutionChain = signal<any>(null);
  evolutionLoading = signal(false);
  evolutionError = signal<string | null>(null);

  ngOnInit() {
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

  fetchEvolutionChain() {
    if (!this.pokemon() || !this.pokemon()!.species?.url) {
      this.evolutionError.set('Pokemon species information not available');
      return;
    }

    this.evolutionLoading.set(true);
    this.evolutionError.set(null);

    // Extract species ID from species URL
    const speciesUrl = this.pokemon()!.species!.url;
    const speciesId = parseInt(speciesUrl.split('/').filter(Boolean).pop() || '0', 10);

    if (!speciesId) {
      this.evolutionError.set('Could not extract species ID');
      this.evolutionLoading.set(false);
      return;
    }

    // Fetch evolution chain (we need to get the evolution chain ID from species first)
    // For now, we'll try a common pattern where evolution chain ID often matches species ID
    this.pokeApiService
      .getEvolutionChainById(speciesId)
      .then((data) => {
        this.evolutionChain.set(data);
        console.log('Evolution chain fetched:', data);
        this.evolutionLoading.set(false);
      })
      .catch((err: any) => {
        this.evolutionError.set(
          `Failed to load evolution chain: ${err?.message || 'Unknown error'}`
        );
        this.evolutionLoading.set(false);
      });
  }
}
