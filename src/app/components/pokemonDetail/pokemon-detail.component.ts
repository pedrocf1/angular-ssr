import { Component, OnInit, inject, signal, input, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PokeApiService } from '../../services/pokeapi.service';
import { Pokemon, PokemonSpecies, Type } from 'pokenode-ts';
import { PokemonSpriteComponent } from '../pokemon-sprite/pokemon-sprite';
import { PokemonPhysicalStatusComponent } from '../pokemon-physical-status/pokemon-physical-status';
import { PokemonStatusBarGroupComponent } from '../pokemon-status-bar-group/pokemon-status-bar-group';
import { PokemonTypesBarGroupComponent } from '../pokemon-types-group/pokemon-types-group';
import { PokemonAbilitiesComponent } from '../pokemon-abilities/pokemon-abilities';
import { PokemonDamageRelationsComponent } from '../pokemon-damage-relations/pokemon-damage-relations';
// TODO: pegar o pokemon-specie -> evolution chain
@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, PokemonSpriteComponent, PokemonPhysicalStatusComponent, PokemonStatusBarGroupComponent, PokemonTypesBarGroupComponent, PokemonAbilitiesComponent, PokemonDamageRelationsComponent],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
})
export class PokemonDetailComponent implements OnInit {
  pokemonData = input<Pokemon | null>(null);

  private activatedRoute = inject(ActivatedRoute);
  private pokeApiService = inject(PokeApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  pokemon = signal<Pokemon | null>(null);
  pokemonSpecies = signal<PokemonSpecies | null>(null);
  evolutionChainPokemon = signal<{ pokemon: any; evolutionDetails: any[] }[] | null>(null);
  firstTypeData = signal<Type | null>(null);
  loading = signal(false);
  evolutionLoading = signal(false);
  error = signal<string | null>(null);
  typeLoading = signal(false);

  ngOnInit() {
    if (this.pokemonData()) {
      this.pokemon.set(this.pokemonData());
      return;
    }

    const name = this.activatedRoute.snapshot.paramMap.get('name');
    if (name) {
      this.loading.set(true);
      this.pokeApiService
        .getPokemonByName(name)
        .then((data) => {
          this.pokemon.set(data);
          this.loading.set(false);
        })
        .catch((err: any) => {
          this.error.set(`Failed to load pokemon: ${err?.message || 'Unknown error'}`);
          this.loading.set(false);
        });

      this.pokeApiService
        .getPokemonSpeciesByName(name)
        .then((data) => {
          console.log("Pokemon Species Data:", data);
          this.pokemonSpecies.set(data.species);
          
          // Fetch evolution chain pokemon
          if (isPlatformBrowser(this.platformId)) {
            this.evolutionLoading.set(true);
            this.pokeApiService
              .getEvolutionChainPokemon(data.species.evolution_chain.url)
              .then((evolutionPokemon) => {
                this.evolutionChainPokemon.set(evolutionPokemon);
                console.log("Evolution Chain Pokemon:", evolutionPokemon);
                this.evolutionLoading.set(false);
              })
              .catch((err: any) => {
                console.error('Failed to load evolution chain:', err);
                this.evolutionLoading.set(false);
              });
          }
        })
        .catch((err: any) => {
          this.error.set(`Failed to load pokemon species: ${err?.message || 'Unknown error'}`);
          this.loading.set(false);
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
