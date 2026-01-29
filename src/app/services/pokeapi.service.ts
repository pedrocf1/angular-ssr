import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, switchMap, forkJoin, of } from 'rxjs';
import { Observable, from } from 'rxjs';
import {
  PokemonType,
  Pokemon,
  PokemonSpecies,
  EvolutionChain,
  EvolutionDetail,
  LocationAreaEncounter,
  LocationArea,
  NamedAPIResourceList,
  ChainLink,
} from '../types/api.types';

type EvolutionData = { pokemon: Pokemon; evolutionDetails: EvolutionDetail[] };
type EvolutionQueueItem = { chain: ChainLink; details: EvolutionDetail[] };
type EncounterResult = { encounters: LocationAreaEncounter[]; evolution: any };
type LocationAreaResult = { locationAreas: LocationArea[]; evolutionData: any; encounters: LocationAreaEncounter[] };

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  private http = inject(HttpClient);
  private baseUrl = 'https://pokeapi.co/api/v2';

  getPokemonsList(limit: number, offset: number): Observable<NamedAPIResourceList> {
    return this.http.get<NamedAPIResourceList>(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
  }

  getAllPokemons(): Observable<NamedAPIResourceList> {
    return this.http.get<NamedAPIResourceList>(`${this.baseUrl}/pokemon?limit=100000`).pipe(
      catchError((err: any) => {
        console.error('HTTP error fetching all pokemons:', err);
        throw err;
      })
    );
  }

  getTypesList(limit: number = 30, offset: number = 0): Observable<NamedAPIResourceList> {
    return this.http.get<NamedAPIResourceList>(`${this.baseUrl}/type?limit=${limit}&offset=${offset}`);
  }

  getPokemonByName(name: string): Observable<Pokemon> {    
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${name}`).pipe(
      catchError((err: any) => {
        console.error('HTTP error fetching pokemon:', name, err);
        throw err;
      })
    );
  }

  getTypeById(id: number): Observable<PokemonType> {
    return this.http.get<PokemonType>(`${this.baseUrl}/type/${id}`).pipe(
      catchError((err: any) => {
        console.error('HTTP error fetching type:', id, err);
        throw err;
      })
    );
  }

  getPokemonsByTypeUrl(typeUrl: string): Observable<NamedAPIResourceList> {
    return this.http.get<any>(typeUrl).pipe(
      map((response) => {
        // Transform the response to match NamedAPIResourceList format
        return {
          count: response.pokemon.length,
          results: response.pokemon.map((p: any) => p.pokemon)
        } as NamedAPIResourceList;
      }),
      catchError((err: any) => {
        console.error('HTTP error fetching pokemon by type:', typeUrl, err);
        throw err;
      })
    );
  }

  getPokemonSpeciesByName(pokemonName: string): Observable<{ species: PokemonSpecies; evolutionChain: EvolutionChain }> {
    return this.http.get<PokemonSpecies>(`${this.baseUrl}/pokemon-species/${pokemonName}`).pipe(
      map((species) => ({ species, evolutionChain: null as any })),
      catchError((err: any) => {
        console.error('HTTP error fetching pokemon species:', pokemonName, err);
        throw err;
      })
    );
  }

  getEvolutionChainPokemon(evolutionChainUrl: string): Observable<EvolutionData[]> {
    return this.http.get<EvolutionChain>(evolutionChainUrl).pipe(
      switchMap((evolutionChain) => {
        return from(this.processEvolutionChain(evolutionChain));
      }),
      catchError((err: any) => {
        console.error('HTTP error fetching evolution chain pokemon:', evolutionChainUrl, err);
        throw err;
      })
    );
  }

  private async processEvolutionChain(evolutionChain: EvolutionChain): Promise<EvolutionData[]> {
    const pokemonList: EvolutionData[] = [];
    const queue: EvolutionQueueItem[] = [{ chain: evolutionChain.chain, details: [] }];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      const { chain, details } = current;
      const pokemonName = chain.species.name;
      
      try {
        const pokemon = await new Promise<Pokemon>((resolve, reject) => {
          this.getPokemonByName(pokemonName).subscribe({
            next: (data) => resolve(data),
            error: (err) => {
              console.error(`Failed to fetch pokemon ${pokemonName}:`, err);
              reject(err);
            }
          });
        });
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
          } as EvolutionQueueItem);
        }
      }
    }

    return pokemonList;
  }

  getPokemonEncounterByName(pokemonName: string): Observable<LocationAreaEncounter[]> {
    return this.http.get<LocationAreaEncounter[]>(`${this.baseUrl}/pokemon/${pokemonName}/encounters`);
  }

  getLocationAreaById(id: number): Observable<LocationArea> {
    return this.http.get<LocationArea>(`${this.baseUrl}/location-area/${id}`);
  }

  getLocationAreaByUrl(url: string): Observable<LocationArea> {
    return this.http.get<LocationArea>(url).pipe(
      catchError((err: any) => {
        console.error('HTTP error fetching location area:', url, err);
        throw err;
      })
    );
  }

  getPokemonDetailData(pokemonName: string): Observable<LocationAreaResult | null> {
    return forkJoin({
      pokemon: this.getPokemonByName(pokemonName),
      speciesData: this.getPokemonSpeciesByName(pokemonName),
    }).pipe(
      switchMap(({ pokemon, speciesData }) =>
        this.loadEncountersAndEvolution(pokemonName, speciesData)
      ),
      switchMap((results: EncounterResult) =>
        this.loadLocationAreasData(results)
      )
    );
  }

  private loadEncountersAndEvolution(pokemonName: string, speciesData: any): Observable<EncounterResult> {
    return forkJoin({
      encounters: this.getPokemonEncounterByName(pokemonName),
      evolution: speciesData.species.evolution_chain.url 
        ? this.getEvolutionChainPokemon(speciesData.species.evolution_chain.url)
        : of<any>(null),
    }) as Observable<EncounterResult>;
  }

  private loadLocationAreasData(results: EncounterResult): Observable<LocationAreaResult> {
    const encounters = results.encounters as LocationAreaEncounter[];

    const locationAreaUrls = Array.from(
      new Set(encounters.map((e) => e.location_area.url))
    );

    const locationAreaRequests = locationAreaUrls.map((url) =>
      this.getLocationAreaByUrl(url)
    );

    return forkJoin({
      locationAreas: locationAreaRequests.length > 0
        ? forkJoin(locationAreaRequests)
        : of([]),
      evolutionData: of(results.evolution || null),
      encounters: of(encounters),
    });
  }
}
