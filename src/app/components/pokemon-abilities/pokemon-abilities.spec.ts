import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonAbilities } from './pokemon-abilities';

describe('PokemonAbilities', () => {
  let component: PokemonAbilities;
  let fixture: ComponentFixture<PokemonAbilities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonAbilities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonAbilities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
