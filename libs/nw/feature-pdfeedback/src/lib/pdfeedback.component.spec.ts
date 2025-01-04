import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfeedbackComponent } from './pdfeedback.component';

describe('PdfeedbackComponent', () => {
  let component: PdfeedbackComponent;
  let fixture: ComponentFixture<PdfeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfeedbackComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
