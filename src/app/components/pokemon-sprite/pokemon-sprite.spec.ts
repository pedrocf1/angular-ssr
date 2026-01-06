import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonSprite } from './pokemon-sprite';

describe('PokemonSprite', () => {
  let component: PokemonSprite;
  let fixture: ComponentFixture<PokemonSprite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonSprite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonSprite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
