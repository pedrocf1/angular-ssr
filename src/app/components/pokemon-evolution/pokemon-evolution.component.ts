import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-evolution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-evolution.component.html',
  styleUrl: './pokemon-evolution.component.scss',
})
export class PokemonEvolutionComponent {
  evolution = input<{ pokemon: any; evolutionDetails: any[] }>();
  currentPokemonName = input<string>();
  
  navigateToPokemon = output<string>();

  onNavigate(pokemonName: string): void {
    this.navigateToPokemon.emit(pokemonName);
  }
}
