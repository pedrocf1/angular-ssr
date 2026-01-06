import { Component, input } from '@angular/core';
import { PokemonSprites } from 'pokenode-ts';

@Component({
  standalone: true,
  selector: 'app-pokemon-sprite',
  imports: [],
  templateUrl: './pokemon-sprite.html',
  styleUrl: './pokemon-sprite.scss',
})
export class PokemonSpriteComponent {
  sprites = input<PokemonSprites | null>(null);
}
