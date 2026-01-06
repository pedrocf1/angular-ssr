import { Component, input } from '@angular/core';
import { PokemonAbility } from 'pokenode-ts';

@Component({
  standalone: true,
  selector: 'app-pokemon-abilities',
  imports: [],
  templateUrl: './pokemon-abilities.html',
  styleUrl: './pokemon-abilities.scss',
})
export class PokemonAbilitiesComponent {
  pokemonAbilities = input<PokemonAbility[] | null>(null);
}
