import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonPhysicalStatus } from './pokemon-physical-status';

describe('PokemonPhysicalStatus', () => {
  let component: PokemonPhysicalStatus;
  let fixture: ComponentFixture<PokemonPhysicalStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonPhysicalStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonPhysicalStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
