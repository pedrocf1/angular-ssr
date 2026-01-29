import { Component, OnInit, inject, signal, input, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PokeApiService } from '../../services/pokeapi.service';
import { Pokemon, PokemonSpecies, LocationAreaEncounter, LocationArea } from '../../types/api.types';
import { Type } from 'pokenode-ts';
import { PokemonSpriteComponent } from '../pokemon-sprite/pokemon-sprite';
import { PokemonPhysicalStatusComponent } from '../pokemon-physical-status/pokemon-physical-status';
import { PokemonStatusBarGroupComponent } from '../pokemon-status-bar-group/pokemon-status-bar-group';
import { PokemonTypesBarGroupComponent } from '../pokemon-types-group/pokemon-types-group';
import { PokemonAbilitiesComponent } from '../pokemon-abilities/pokemon-abilities';
import { PokemonDamageRelationsComponent } from '../pokemon-damage-relations/pokemon-damage-relations';
import { PokemonEvolutionListComponent } from '../pokemon-evolution-list/pokemon-evolution-list.component';
import { PokemonEncounterListComponent } from '../pokemon-encounter-list/pokemon-encounter-list.component';
import { Subject, forkJoin, of, Observable } from 'rxjs';
import { takeUntil, switchMap, tap, catchError } from 'rxjs/operators';

type EncounterResult = { encounters: LocationAreaEncounter[]; evolution: any };
type LocationAreaResult = { locationAreas: LocationArea[]; evolutionData: any; encounters: LocationAreaEncounter[] };

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, PokemonSpriteComponent, PokemonPhysicalStatusComponent, PokemonStatusBarGroupComponent, PokemonTypesBarGroupComponent, PokemonAbilitiesComponent, PokemonDamageRelationsComponent, PokemonEvolutionListComponent, PokemonEncounterListComponent],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  pokemonData = input<Pokemon | null>(null);

  private activatedRoute = inject(ActivatedRoute);
  private pokeApiService = inject(PokeApiService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  
  pokemon = signal<Pokemon | null>(null);
  pokemonSpecies = signal<PokemonSpecies | null>(null);
  evolutionChainPokemon = signal<{ pokemon: any; evolutionDetails: any[] }[] | null>(null);
  firstTypeData = signal<Type | null>(null);
  encounters = signal<LocationAreaEncounter[] | null>(null);
  locationAreas = signal<LocationArea[] | null>(null);
  locationAreaEnglishNames = signal<Map<string, string>>(new Map());
  loading = signal(false);
  evolutionLoading = signal(false);
  encounterLoading = signal(false);
  error = signal<string | null>(null);
  typeLoading = signal(false);

  ngOnInit() {    
    if (this.pokemonData()) {
      this.pokemon.set(this.pokemonData());
      return;
    }

    this.activatedRoute.paramMap
      .pipe(
        switchMap((params) => this.handleRouteParams(params)),
        takeUntil(this.destroy$)
      )
      .subscribe((result: LocationAreaResult | null) => {
        if (!result) return;

        this.populateLocationData(result);
      });
  }

  private handleRouteParams(params: any): Observable<LocationAreaResult | null> {
    const name = params.get('name');
    if (!name) return of(null);
    
    this.resetPokemonData();

    return this.pokeApiService.getPokemonByName(name).pipe(
      tap((pokemon) => this.pokemon.set(pokemon)),
      switchMap(() => this.pokeApiService.getPokemonSpeciesByName(name)),
      tap(({ species }) => this.pokemonSpecies.set(species)),
      switchMap(({ species }) => 
        this.pokeApiService.getPokemonDetailData(name)
      ),
      catchError((err) => this.handleError(err))
    );
  }

  private resetPokemonData(): void {
    this.loading.set(true);
    this.pokemon.set(null);
    this.pokemonSpecies.set(null);
    this.encounters.set(null);
    this.evolutionChainPokemon.set(null);
    this.error.set(null);
  }

  private populateLocationData(result: LocationAreaResult): void {
    const { locationAreas, evolutionData, encounters } = result;
    this.encounters.set(encounters);
    this.locationAreas.set(locationAreas);

    const englishNames = new Map<string, string>();
    locationAreas.forEach((area) => {
      const englishName = area.names?.find(
        (name) => name.language.name === 'en'
      )?.name;
      if (englishName) {
        englishNames.set(area.name, englishName);
      }
    });
    this.locationAreaEnglishNames.set(englishNames);

    if (evolutionData) {
      this.evolutionChainPokemon.set(evolutionData);
    }

    this.loading.set(false);
    this.encounterLoading.set(false);
    this.evolutionLoading.set(false);
  }

  private handleError(err: any): Observable<null> {
    this.error.set(
      `Failed to load pokemon: ${err?.message || "Unknown error"}`
    );
    this.loading.set(false);
    this.encounterLoading.set(false);
    this.evolutionLoading.set(false);
    return of(null);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  navigateToPokemon(name: string): void {
    this.router.navigate(['/pokemondetail', name]);
  }

  getEncounterVersions(encounter: any): string {
    if (!encounter?.version_details) return '';
    return encounter.version_details.map((v: any) => v.version.name).join(', ');
  }

  getEnglishLocationName(locationAreaName: string): string {
    const englishName = this.locationAreaEnglishNames().get(locationAreaName);
    return englishName || locationAreaName;
  }
}