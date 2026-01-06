import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonDamageRelations } from './pokemon-damage-relations';

describe('PokemonDamageRelations', () => {
  let component: PokemonDamageRelations;
  let fixture: ComponentFixture<PokemonDamageRelations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonDamageRelations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonDamageRelations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
