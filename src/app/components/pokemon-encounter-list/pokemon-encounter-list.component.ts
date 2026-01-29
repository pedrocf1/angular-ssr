import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonEncounterComponent } from '../pokemon-encounter/pokemon-encounter.component';

@Component({
  selector: 'app-pokemon-encounter-list',
  standalone: true,
  imports: [CommonModule, PokemonEncounterComponent],
  templateUrl: './pokemon-encounter-list.component.html',
  styleUrl: './pokemon-encounter-list.component.scss',
})
export class PokemonEncounterListComponent {
  encounters = input<any[] | null>(null);
  encounterLoading = input(false);
  getEnglishLocationName = input<(name: string) => string>();
  getEncounterVersions = input<(encounter: any) => string>();

  getLocationName(locationAreaName: string): string {
    const fn = this.getEnglishLocationName();
    return (fn?.(locationAreaName) ?? locationAreaName) as string;
  }

  getVersions(encounter: any): string {
    const fn = this.getEncounterVersions();
    return (fn?.(encounter) ?? '') as string;
  }
}
