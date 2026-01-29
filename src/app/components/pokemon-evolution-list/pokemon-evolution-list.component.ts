import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonEvolutionComponent } from '../pokemon-evolution/pokemon-evolution.component';

@Component({
  selector: 'app-pokemon-evolution-list',
  standalone: true,
  imports: [CommonModule, PokemonEvolutionComponent],
  templateUrl: './pokemon-evolution-list.component.html',
  styleUrl: './pokemon-evolution-list.component.scss',
})
export class PokemonEvolutionListComponent {
  evolutionChainPokemon = input<{ pokemon: any; evolutionDetails: any[] }[] | null>(null);
  currentPokemonName = input<string>();
  evolutionLoading = input(false);
  
  navigateToPokemon = output<string>();

  onNavigate(pokemonName: string): void {
    this.navigateToPokemon.emit(pokemonName);
  }
}
