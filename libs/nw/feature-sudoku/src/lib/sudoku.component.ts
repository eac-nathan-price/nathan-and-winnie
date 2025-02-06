import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

type WorkerWrapper = {
  thread: Worker;
  busy: boolean;
  message: object
}

type Cell = number | null;
const width = 9; // width of main puzzle grid
const height = 9; // height of main puzzle grid
const top = 1; // number of extra rows above the grid
const left = 1; // number of extra columns to the left of the grid
const right = 0; // number of extra columns to the right of the grid
const bottom = 0; // number of extra rows below the grid
const grid: Cell[] = new Array((width+left+right) * (height+top+bottom)).fill(null);

const rows: number[][] = Array(height).fill(0).map((_, row) => 
  Array(width).fill(0).map((_, col) => 
    (row + top) * (width + left + right) + col + left
  )
);

const cols: number[][] = Array(width).fill(0).map((_, col) => 
  Array(height).fill(0).map((_, row) => 
    (row + top) * (width + left + right) + col + left
  )
);

const boxes: number[][] = Array(9).fill(0).map((_, box) => {
  const boxRow = Math.floor(box / 3);
  const boxCol = box % 3;
  return Array(9).fill(0).map((_, index) => {
    const row = boxRow * 3 + Math.floor(index / 3);
    const col = boxCol * 3 + (index % 3);
    return (row + top) * (width + left + right) + col + left;
  });
});

const topRows: number[][] = Array(top).fill(0).map((_, row) =>
  Array(width).fill(0).map((_, col) =>
    row * (width + left + right) + col + left
  )
);

const leftCols: number[][] = Array(left).fill(0).map((_, col) =>
  Array(height).fill(0).map((_, row) =>
    (row + top) * (width + left + right) + col
  )
);

const rightCols: number[][] = Array(right).fill(0).map((_, col) =>
  Array(height).fill(0).map((_, row) =>
    (row + top) * (width + left + right) + col + left + width
  )
);

const bottomRows: number[][] = Array(bottom).fill(0).map((_, row) =>
  Array(width).fill(0).map((_, col) =>
    (row + top + height) * (width + left + right) + col + left
  )
);

for (const tr of topRows) {
  for (const i of tr) {
    grid[i] = 0;
  }
}

for (const lc of leftCols) {
  for (const i of lc) {
    grid[i] = 0;
  }
}

//console.log({grid, rows, cols, boxes, topRows, leftCols, rightCols, bottomRows});

type Constraint = (grid: Cell[]) => boolean;

// function noRepeatsInRow(grid: Cell[]) {
//   return true;
// }

// function noRepeatsInColumn(grid: Cell[]) {
//   return true;
// }

@Component({
  selector: 'lib-sudoku',
  imports: [CommonModule],
  templateUrl: './sudoku.component.html',
  styleUrl: './sudoku.component.scss',
})
export class SudokuComponent implements OnDestroy, OnInit {
  platformId = inject(PLATFORM_ID);
  toolbar = inject(ToolbarService);
  
  workers: WorkerWrapper[] = [];
  queue: object[] = [];

  width = 9;
  height = 9;
  possibleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  grid: Cell[] = [];
  constraints: Constraint[] = [];

  sendWorkerMessage(message?: object, worker?: WorkerWrapper) {
    if (!message) return;
    if (!worker) worker = this.workers.find(w => !w.busy);
    if (!worker) {
      this.queue.push(message);
      return;
    }
    worker.busy = true;
    worker.message = message;
    worker.thread.postMessage(message);
  }

  onWorkerMessage(event: MessageEvent) {
    const message = event.data;
    const worker = this.workers[message.from];
    if (message.done) {
      worker.busy = false;
      worker.message = {};
    }
    switch (message.type) {
      case 'initResponse':
        console.log(`Worker ${message.from} initialized`);
        break;
      default:
        console.log(`Worker ${message.from} ${message.type}:`, message.data);
        break;
    }
    if (!worker.busy && this.queue.length > 0) this.sendWorkerMessage(this.queue.shift(), worker);
  }

  ngOnDestroy() {
    while (this.workers.length > 0) {
      const wrapper = this.workers.pop();
      wrapper?.thread.terminate();
    }
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'pin',
      label: 'Sudoku',
      title: 'Sudoku',
      route: '/sudoku',
    });
    
    // Create a worker for each CPU thread
    if (isPlatformBrowser(this.platformId)) {
      const threadCount = navigator.hardwareConcurrency || 4;
      console.log(`Thread count: ${threadCount}`);
      for (let i = 0; i < threadCount; i++) {
        const thread = new Worker(new URL('./workers/sudoku.worker.ts', import.meta.url), { type: 'module' });
        const worker: WorkerWrapper = { thread, busy: false, message: {} };
        this.workers.push(worker);
        worker.thread.addEventListener('message', this.onWorkerMessage.bind(this));
        this.sendWorkerMessage({ type: 'initRequest', data: i }, worker);       
      }
    }
  }
}
