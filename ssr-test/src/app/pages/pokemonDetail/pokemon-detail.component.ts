import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokeApiService } from '../../services/pokeapi.service';
import { Pokemon } from 'pokenode-ts';

@Component({
  selector: 'pokemon-detail.component',
  imports: [],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
})
export class PokemonDetailComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private pokeApiService = inject(PokeApiService);
  
  pokemon = signal<Pokemon | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const name = this.activatedRoute.snapshot.paramMap.get('name');
    if (name) {
      this.loading.set(true);
      this.pokeApiService
        .getPokemonByName(name)
        .then((data) => {
          this.pokemon.set(data);
          console.log('Pokemon fetched:', data);
          this.loading.set(false);
        })
        .catch((err: any) => {
          this.error.set(`Failed to load pokemon: ${err?.message || 'Unknown error'}`);
          this.loading.set(false);
        });
    }
  }
}
