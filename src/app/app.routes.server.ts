import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { PokeApiService } from './services/pokeapi.service';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'pokemonlist',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'auth/callback',
    renderMode: RenderMode.Server,
  },
  {
    path: 'about',
    renderMode: RenderMode.Prerender,
  },
  {
    path: ':name',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,
    async getPrerenderParams() {
      const pokeApiService = inject(PokeApiService);
      
      try {
        const allPokemons = await firstValueFrom(pokeApiService.getAllPokemons());
        
        if (!allPokemons?.results) {
          return [
            { name: 'bulbasaur' },
            { name: 'charmander' },
            { name: 'pikachu' },
            { name: 'squirtle' }
          ];
        }
        return allPokemons.results.slice(0, 100).map((pokemon) => ({
          name: pokemon.name,
        }));
      } catch (error) {
        console.error('Error fetching pokemons for prerender:', error);
        return [
          { name: 'bulbasaur' },
          { name: 'charmander' },
          { name: 'pikachu' },
          { name: 'squirtle' }
        ];
      }
    },
  },
];
