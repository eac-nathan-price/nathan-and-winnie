import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RickyComponent } from './ricky.component';

describe('RickyComponent', () => {
  let component: RickyComponent;
  let fixture: ComponentFixture<RickyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RickyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RickyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
