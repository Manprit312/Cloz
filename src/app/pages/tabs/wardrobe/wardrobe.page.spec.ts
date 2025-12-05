import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WardrobePage } from './wardrobe.page';

describe('WardrobePage', () => {
  let component: WardrobePage;
  let fixture: ComponentFixture<WardrobePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WardrobePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
