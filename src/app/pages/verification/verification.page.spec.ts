import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificationPage } from './verification.page';

describe('VerificationPage', () => {
  let component: VerificationPage;
  let fixture: ComponentFixture<VerificationPage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: any;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    routeSpy = {
      snapshot: {
        queryParamMap: {
          get: jasmine.createSpy('get').and.returnValue('test@example.com'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [VerificationPage],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

