import { Injectable } from '@angular/core';
import Pokedex from 'pokedex-promise-v2';

@Injectable({
  providedIn: 'root',
})
export class Pokeapi {
  private pokedex = new Pokedex();

  getPokemonsList(limit: number, offset: number): Promise<any> {
    return this.pokedex.getPokemonsList({ limit, offset });
  }

  getEvolutionChainById(id: number): Promise<any> {
    return this.pokedex.getEvolutionChainById(id);
  }

  getPokemonByName(name: string): Promise<any> {
    return this.pokedex.getPokemonByName(name);
  }
}
