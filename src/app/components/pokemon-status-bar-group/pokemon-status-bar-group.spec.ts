import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonStatusBarGroup } from './pokemon-status-bar-group';

describe('PokemonStatusBarGroup', () => {
  let component: PokemonStatusBarGroup;
  let fixture: ComponentFixture<PokemonStatusBarGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonStatusBarGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonStatusBarGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
