import { Component, inject, OnInit } from '@angular/core';
import { PokeApiService } from '../../services/pokeapi.service';

@Component({
  selector: 'app-about.component',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  pokeApi = inject(PokeApiService);
  ngOnInit(): void {
    this.pokeApi.getPokemonByName('pikachu').then((pokemon) => {
      console.log('Pokemon fetched on About2 component:', pokemon);
    })
  }

}
