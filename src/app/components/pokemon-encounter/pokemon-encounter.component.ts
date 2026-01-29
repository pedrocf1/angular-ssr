import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-encounter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-encounter.component.html',
  styleUrl: './pokemon-encounter.component.scss',
})
export class PokemonEncounterComponent {
  encounter = input<any>();
  englishLocationName = input<string>();
  versionDetails = input<string>();
}
