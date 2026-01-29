import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonTypeIconComponent } from '../pokemon-type-icon/pokemon-type-icon.component';

export interface PokemonType {
  name: string;
  url: string;
}

@Component({
  selector: 'app-pokemon-type-filter',
  standalone: true,
  imports: [CommonModule, PokemonTypeIconComponent],
  templateUrl: './pokemon-type-filter.component.html',
  styleUrl: './pokemon-type-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonTypeFilterComponent {
  typesList = input<PokemonType[]>([]);
  selectedType = input<string>('');
  typeSelected = output<PokemonType>();

  toggleType(type: PokemonType): void {
    if (this.selectedType() === type.name) {
      this.typeSelected.emit({ name: '', url: '' });
    } else {
      this.typeSelected.emit(type);
    }
  }

  isTypeSelected(type: PokemonType): boolean {
    return this.selectedType() === type.name;
  }
}
