/**
 * API Types Mapping Documentation
 * 
 * This file documents all types used from pokenode-ts and custom extended types
 * for the Angular SSR Pokemon application.
 */

// Import base types from pokenode-ts
export type {
  NamedAPIResourceList,
  Pokemon,
  PokemonSprites,
  PokemonSpecies,
  EvolutionChain,
  ChainLink,
  EvolutionDetail,
  LocationAreaEncounter,
  LocationArea,
  EncounterMethodRate,
  PokemonEncounter,
  VersionEncounterDetail,
} from 'pokenode-ts';

// Import base PokemonType for extension
import { PokemonType as PokemonTypeBase } from 'pokenode-ts';

/**
 * Extended PokemonType with damage relations
 * 
 * Extends the base PokemonType from pokenode-ts to include damage_relations
 * which contains type effectiveness information.
 */
export interface PokemonType extends PokemonTypeBase {
  name: string;
  damage_relations?: {
    double_damage_from?: Array<{ name: string; url: string }>;
    double_damage_to?: Array<{ name: string; url: string }>;
    half_damage_from?: Array<{ name: string; url: string }>;
    half_damage_to?: Array<{ name: string; url: string }>;
    no_damage_from?: Array<{ name: string; url: string }>;
    no_damage_to?: Array<{ name: string; url: string }>;
  };
}
