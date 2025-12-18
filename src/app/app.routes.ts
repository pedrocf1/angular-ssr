import { Routes } from '@angular/router';
import { PokemonDetailComponent } from './pages/pokemonDetail/pokemon-detail.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
	{ path: 'pokemondetail/:name', component: PokemonDetailComponent },
	{ path: 'about', component: AboutComponent },
];
