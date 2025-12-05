import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OutfitsPage } from './outfits.page';

describe('OutfitsPage', () => {
  let component: OutfitsPage;
  let fixture: ComponentFixture<OutfitsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OutfitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
