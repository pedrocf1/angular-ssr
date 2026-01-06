import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NamedAPIResourceList, Pokemon } from 'pokenode-ts';

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

  getTypeById(id: number): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/type/${id}`)
    ).catch((err: any) => {
      console.error('HTTP error fetching type:', id, err);
      throw err;
    });
  }
}
