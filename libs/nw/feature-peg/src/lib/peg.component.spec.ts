import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PegComponent } from './peg.component';

describe('PegComponent', () => {
  let component: PegComponent;
  let fixture: ComponentFixture<PegComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PegComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
