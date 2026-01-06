import { Component, input } from '@angular/core';
import { Pokemon, PokemonType } from 'pokenode-ts';
import { PokemonTypeIconComponent } from '../pokemon-type-icon/pokemon-type-icon.component';

@Component({
  standalone: true,
  selector: 'app-pokemon-types-group',
  imports: [PokemonTypeIconComponent],
  templateUrl: './pokemon-types-group.html',
  styleUrl: './pokemon-types-group.scss',
})
export class PokemonTypesBarGroupComponent {
  pokemon = input<Pokemon | null>(null)
}
