import { Injectable } from '@angular/core';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { PokemonClient, EvolutionClient, Pokemon } from 'pokenode-ts';

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  private platformId = inject(PLATFORM_ID);
  private pokemonClient: PokemonClient | null = null;
  private evolutionClient: EvolutionClient | null = null;

  constructor() {
    if (isPlatformServer(this.platformId)) {
      this.pokemonClient = new PokemonClient();
      this.evolutionClient = new EvolutionClient();
      console.log('Clients initialized on server side');
    }
  }

  getPokemonsList(limit: number, offset: number): Promise<any> {
    if (isPlatformServer(this.platformId) && this.pokemonClient) {
      return this.pokemonClient.listPokemons(offset, limit);
    }
    throw new Error('getPokemonsList only available on server');
  }

  getEvolutionChainById(id: number): Promise<any> {
    if (isPlatformServer(this.platformId) && this.evolutionClient) {
      return this.evolutionClient.getEvolutionChainById(id);
    }
    throw new Error('getEvolutionChainById only available on server');
  }

  async getPokemonByName(name: string): Promise<Pokemon> {
    console.log('getPokemonByName called with:', name);
    
    if (isPlatformServer(this.platformId) && this.pokemonClient) {
      try {
        return await this.pokemonClient.getPokemonByName(name) as Pokemon;
      } catch (err: any) {
        console.error('Error fetching pokemon:', name, err);
        throw err;
      }
    }
    throw new Error('getPokemonByName only available on server');
  }
}

