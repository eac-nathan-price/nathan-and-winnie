import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeudComponent } from './feud.component';

describe('FeudComponent', () => {
  let component: FeudComponent;
  let fixture: ComponentFixture<FeudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeudComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});