import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

@Component({
  selector: 'lib-sudoku',
  imports: [CommonModule],
  templateUrl: './sudoku.component.html',
  styleUrl: './sudoku.component.scss',
})
export class SudokuComponent implements OnDestroy, OnInit {
  platformId = inject(PLATFORM_ID);
  toolbar = inject(ToolbarService);
  
  workers: Worker[] = [];

  ngOnDestroy() {
    while (this.workers.length > 0) this.workers.pop()?.terminate();
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'pin',
      label: 'Sudoku',
      title: 'Sudoku',
      route: '/sudoku',
    });
    
    if (isPlatformBrowser(this.platformId)) {
      // Create a worker for each CPU thread
      const threadCount = navigator.hardwareConcurrency || 4;
      console.log(`Thread count: ${threadCount}`);
      for (let i = 0; i < threadCount; i++) {
        const worker = new Worker(new URL('./workers/sudoku.worker.ts', import.meta.url), { type: 'module' });
        this.workers.push(worker);
        
        // Send initialization message
        worker.postMessage({
          type: 'initRequest',
          data: i
        });
        console.log(`Worker ${i} init requested`);
        
        // Optional: Listen for init response
        worker.addEventListener('message', ({ data }) => {
          if (data.type === 'initResponse') {
            console.log(`Worker ${data.from} initialized`);
          }
        });
      }
    }
  }
}
