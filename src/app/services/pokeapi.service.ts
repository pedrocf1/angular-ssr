import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Pokemon } from 'pokenode-ts';

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  private http = inject(HttpClient);
  private baseUrl = 'https://pokeapi.co/api/v2';

  getPokemonsList(limit: number, offset: number): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`)
    );
  }

  getEvolutionChainById(id: number): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/evolution-chain/${id}`)
    );
  }

  getPokemonByName(name: string): Promise<Pokemon> {
    console.log('getPokemonByName called with:', name);
    
    return firstValueFrom(
      this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${name}`)
    ).catch((err: any) => {
      console.error('HTTP error fetching pokemon:', name, err);
      throw err;
    });
  }
}
