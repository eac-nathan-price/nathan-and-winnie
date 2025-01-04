import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskmasterComponent } from './taskmaster.component';

describe('TaskmasterComponent', () => {
  let component: TaskmasterComponent;
  let fixture: ComponentFixture<TaskmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskmasterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
