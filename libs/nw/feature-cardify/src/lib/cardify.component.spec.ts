import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardifyComponent } from './cardify.component';

describe('CardifyComponent', () => {
  let component: CardifyComponent;
  let fixture: ComponentFixture<CardifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardifyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
