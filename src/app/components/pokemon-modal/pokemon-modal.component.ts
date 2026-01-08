import { Component, Input, Output, EventEmitter, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from 'pokenode-ts';
import { PokemonSpriteComponent } from '../pokemon-sprite/pokemon-sprite';
import { PokemonPhysicalStatusComponent } from '../pokemon-physical-status/pokemon-physical-status';
import { PokemonStatusBarGroupComponent } from '../pokemon-status-bar-group/pokemon-status-bar-group';
import { PokemonTypesBarGroupComponent } from '../pokemon-types-group/pokemon-types-group';
import { PokemonAbilitiesComponent } from '../pokemon-abilities/pokemon-abilities';
import { PokemonDamageRelationsComponent } from '../pokemon-damage-relations/pokemon-damage-relations';

@Component({
  selector: 'app-pokemon-modal',
  standalone: true,
  imports: [
    CommonModule,
    PokemonSpriteComponent,
    PokemonPhysicalStatusComponent,
    PokemonStatusBarGroupComponent,
    PokemonTypesBarGroupComponent,
    PokemonAbilitiesComponent,
    PokemonDamageRelationsComponent,
  ],
  templateUrl: './pokemon-modal.component.html',
  styleUrl: './pokemon-modal.component.scss',
})
export class PokemonModalComponent {
  @Input() showModal!: boolean;
  @Input() selectedPokemon: Pokemon | null = null;
  @Input() modalLoading: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>();

  pokemon = signal<Pokemon | null>(null);
  error = signal<string | null>(null);

  ngOnChanges() {
    if (this.selectedPokemon) {
      this.pokemon.set(this.selectedPokemon);
      this.error.set(null);
    }
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  closeModalOnBackdropClick(event: MouseEvent): void {
    // Close only if clicking on the backdrop itself (the outer div), not the modal content
    const backdrop = event.currentTarget as HTMLElement;
    if (event.target === backdrop) {
      this.closeModal();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showModal) {
      this.closeModal();
    }
  }
}
