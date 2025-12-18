import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'about2',
    renderMode: RenderMode.Client,
  },
  {
    path: 'about/:name',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      return [{ name: 'bulbasaur' }];
    },
  },
];
