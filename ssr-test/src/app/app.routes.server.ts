import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'about',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'pokemondetail/:name',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,
    async getPrerenderParams() {
      return [{ name: 'bulbasaur' }, { name: 'charmander' }, { name: 'pikachu' }, { name: 'squirtle' }];
    },
  },
];
