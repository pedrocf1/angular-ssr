import { Component, input } from '@angular/core';
import { Pokemon } from 'pokenode-ts';

@Component({
  standalone: true,
  selector: 'app-pokemon-status-bar-group',
  imports: [],
  templateUrl: './pokemon-status-bar-group.html',
  styleUrl: './pokemon-status-bar-group.scss',
})
export class PokemonStatusBarGroupComponent {
  pokemon = input<Pokemon | null>(null)
}
