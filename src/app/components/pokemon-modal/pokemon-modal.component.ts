import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonDetailComponent } from '../pokemonDetail/pokemon-detail.component';
import { Pokemon } from 'pokenode-ts';

@Component({
  selector: 'app-pokemon-modal',
  standalone: true,
  imports: [CommonModule, PokemonDetailComponent],
  templateUrl: './pokemon-modal.component.html',
  styleUrl: './pokemon-modal.component.scss',
})
export class PokemonModalComponent {
  @Input() showModal!: boolean;
  @Input() selectedPokemon: Pokemon | null = null;
  @Input() modalLoading: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>();

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
