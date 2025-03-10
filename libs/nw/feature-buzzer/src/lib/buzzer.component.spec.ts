import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuzzerComponent } from './buzzer.component';

describe('BuzzerComponent', () => {
  let component: BuzzerComponent;
  let fixture: ComponentFixture<BuzzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuzzerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BuzzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
