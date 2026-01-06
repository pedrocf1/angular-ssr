import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PokeApiService } from '../../services/pokeapi.service';
import { Pokemon, Type } from 'pokenode-ts';
import { PokemonTypeIconComponent } from '../pokemon-type-icon/pokemon-type-icon.component';
import { PokemonSpriteComponent } from '../pokemon-sprite/pokemon-sprite';
import { PokemonPhysicalStatusComponent } from '../pokemon-physical-status/pokemon-physical-status';
import { PokemonStatusBarGroupComponent } from '../pokemon-status-bar-group/pokemon-status-bar-group';
import { PokemonTypesBarGroupComponent } from '../pokemon-types-group/pokemon-types-group';
import { PokemonAbilitiesComponent } from '../pokemon-abilities/pokemon-abilities';
import { PokemonDamageRelationsComponent } from '../pokemon-damage-relations/pokemon-damage-relations';
// TODO: transformar tudo em component e então criar uma nova tela para detalhes do pokemon
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
  
  pokemon = signal<Pokemon | null>(null);
  firstTypeData = signal<Type | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  typeLoading = signal(false);

  ngOnInit() {
    // console.log("PokemonDetailComponent initialized", this.pokemonData());
    // If pokemonData is provided as input (from modal), use it directly
    if (this.pokemonData()) {
      this.pokemon.set(this.pokemonData());
      return;
    }

    // Otherwise, fetch from route params (original behavior for direct navigation)
    const name = this.activatedRoute.snapshot.paramMap.get('name');
    if (name) {
      // console.log('pokemon name', name)
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
    }
  }
}
