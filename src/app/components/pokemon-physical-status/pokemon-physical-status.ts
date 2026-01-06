import { Component, input } from '@angular/core';
import { Pokemon } from 'pokenode-ts';

@Component({
  standalone: true,
  selector: 'app-pokemon-physical-status',
  imports: [],
  templateUrl: './pokemon-physical-status.html',
  styleUrl: './pokemon-physical-status.scss',
})
export class PokemonPhysicalStatusComponent {
  pokemon = input<Pokemon | null>(null);

}
