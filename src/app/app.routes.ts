import { Routes } from '@angular/router';
import { PokemonDetailComponent } from './components/pokemonDetail/pokemon-detail.component';
import { AboutComponent } from './pages/about/about.component';
import { PokemonListComponent } from './pages/pokemonList/pokemon-list.component';

export const routes: Routes = [
	{ path: '', component: PokemonListComponent },
	{ path: 'pokemonlist', component: PokemonListComponent },
	{ path: 'pokemondetail/:name', component: PokemonDetailComponent },
	{ path: 'about', component: AboutComponent },
];
