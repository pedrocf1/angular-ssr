import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NamedAPIResourceList, Pokemon, PokemonType, PokemonSpecies, EvolutionChain, ChainLink, EvolutionDetail } from 'pokenode-ts';

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  private http = inject(HttpClient);
  private baseUrl = 'https://pokeapi.co/api/v2';

  getPokemonsList(limit: number, offset: number): Promise<NamedAPIResourceList> {
    return firstValueFrom(
      this.http.get<NamedAPIResourceList>(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`)
    );
  }

  getTypesList(limit: number = 20, offset: number = 0): Promise<NamedAPIResourceList> {
    return firstValueFrom(
      this.http.get<NamedAPIResourceList>(`${this.baseUrl}/type?limit=${limit}&offset=${offset}`)
    );
  }

  getPokemonByName(name: string): Promise<Pokemon> {    
    return firstValueFrom(
      this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${name}`)
    ).catch((err: any) => {
      console.error('HTTP error fetching pokemon:', name, err);
      throw err;
    });
  }

  getTypeById(id: number): Promise<PokemonType> {
    return firstValueFrom(
      this.http.get<PokemonType>(`${this.baseUrl}/type/${id}`)
    ).catch((err: any) => {
      console.error('HTTP error fetching type:', id, err);
      throw err;
    });
  }

  getPokemonSpeciesByName(pokemonName: string): Promise<{ species: PokemonSpecies; evolutionChain: EvolutionChain }> {
    return firstValueFrom(
      this.http.get<PokemonSpecies>(`${this.baseUrl}/pokemon-species/${pokemonName}`)
    )
      .then(async (species) => {
        try {
          const evolutionChain = await firstValueFrom(
            this.http.get<any>(species.evolution_chain.url)
          );
          return { species, evolutionChain };
        } catch (err: any) {
          console.error('HTTP error fetching evolution chain:', species.evolution_chain.url, err);
          throw err;
        }
      })
      .catch((err: any) => {
        console.error('HTTP error fetching pokemon species:', pokemonName, err);
        throw err;
      });
  }

  async getEvolutionChainPokemon(evolutionChainUrl: string): Promise<{ pokemon: Pokemon; evolutionDetails: EvolutionDetail[] }[]> {
    try {
      const evolutionChain = await firstValueFrom(
        this.http.get<EvolutionChain>(evolutionChainUrl)
      );

      const pokemonList: { pokemon: Pokemon; evolutionDetails: EvolutionDetail[] }[] = [];
      const queue = [{ chain: evolutionChain.chain, details: [] as EvolutionDetail[] }];

      while (queue.length > 0) {
        const current = queue.shift();
        if (!current) continue;

        const { chain, details } = current;
        const pokemonName = chain.species.name;
        
        try {
          const pokemon = await this.getPokemonByName(pokemonName);
          pokemonList.push({
            pokemon,
            evolutionDetails: details,
          });
        } catch (err: any) {
          console.error(`Failed to fetch pokemon ${pokemonName}:`, err);
        }

        if (chain.evolves_to && chain.evolves_to.length > 0) {
          for (const evolution of chain.evolves_to) {
            queue.push({
              chain: evolution,
              details: evolution.evolution_details,
            });
          }
        }
      }

      return pokemonList;
    } catch (err: any) {
      console.error('HTTP error fetching evolution chain pokemon:', evolutionChainUrl, err);
      throw err;
    }
  }
}
