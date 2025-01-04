import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrabbleComponent } from './scrabble.component';

describe('ScrabbleComponent', () => {
  let component: ScrabbleComponent;
  let fixture: ComponentFixture<ScrabbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrabbleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrabbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
