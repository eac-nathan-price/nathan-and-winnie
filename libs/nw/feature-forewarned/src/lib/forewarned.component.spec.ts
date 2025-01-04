import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForewarnedComponent } from './forewarned.component';

describe('ForewarnedComponent', () => {
  let component: ForewarnedComponent;
  let fixture: ComponentFixture<ForewarnedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForewarnedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ForewarnedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
