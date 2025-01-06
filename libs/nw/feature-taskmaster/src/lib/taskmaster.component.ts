import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

@Component({
  selector: 'lib-taskmaster',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taskmaster.component.html',
  styleUrl: './taskmaster.component.scss',
})
export class TaskmasterComponent implements OnInit, OnDestroy {
  private toolbar = inject(ToolbarService);

  minutes = 0;
  seconds = 0;
  isRunning = false;
  private timerInterval!: ReturnType<typeof setInterval>;

  protected Math = Math;

  // Define which segments should be active for each digit
  private readonly digitPatterns = {
    0: [true, true, true, true, true, true, false],
    1: [false, true, true, false, false, false, false],
    2: [true, true, false, true, true, false, true],
    3: [true, true, true, true, false, false, true],
    4: [false, true, true, false, false, true, true],
    5: [true, false, true, true, false, true, true],
    6: [true, false, true, true, true, true, true],
    7: [true, true, true, false, false, false, false],
    8: [true, true, true, true, true, true, true],
    9: [true, true, true, true, false, true, true],
  };

  getSegments(digit: number): boolean[] {
    return this.digitPatterns[digit as keyof typeof this.digitPatterns] || this.digitPatterns[0];
  }

  startStop() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  private start() {
    this.isRunning = true;
    this.timerInterval = setInterval(() => {
      this.seconds++;
      if (this.seconds >= 60) {
        this.seconds = 0;
        this.minutes++;
      }
    }, 1000);
  }

  private stop() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
  }

  reset() {
    this.stop();
    this.minutes = 0;
    this.seconds = 0;
  }

  ngOnDestroy() {
    this.stop();
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'mail',
      label: 'Taskmaster',
      title: 'Taskmaster',
      route: '/taskmaster',
    });
  }
}
