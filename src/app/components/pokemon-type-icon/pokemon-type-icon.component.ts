import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from 'pokenode-ts';

@Component({
  selector: 'app-pokemon-type-icon',
  imports: [CommonModule],
  templateUrl: './pokemon-type-icon.component.html',
  styleUrl: './pokemon-type-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonTypeIconComponent {
  pokemon = input<Pokemon | null>();
  typeName = input<string>('');
  size = input<'big' | 'normal'>('normal');
  pokemionType = computed(()=> this.typeName() || this.pokemon()?.types?.[0]?.type?.name || 'unknown');
  spanClasses = computed(() => this.size() === 'big' ? 'text-6xl' : 'text-2xl');
}
