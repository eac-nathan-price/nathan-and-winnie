import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

type WorkerWrapper = {
  thread: Worker;
  busy: boolean;
  message: object
}

type Params = {
  width: number,
  height: number,
  possibleValues?: number[],
  top?: number,
  left?: number,
  right?: number,
  bottom?: number,
}

class Grid {
  constructor(
    public params: Params = {
      width: 9,
      height: 9,
      possibleValues: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
  ) {}
}

type Constraint = (grid: Grid) => boolean;

function getRows(grid: Grid) {
  return grid;
}

function getColumns(grid: Grid) {
  return grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));
}

function noRepeatsInRow(grid: Grid) {
  return getRows(grid).every(row => {
    const values = row.filter(value => value !== null);
    return new Set(values).size === values.length;
  });
}

function noRepeatsInColumn(grid: Grid) {
  return getColumns(grid).every(column => {
    const values = column.filter(value => value !== null);
    return new Set(values).size === values.length;
  });
}

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
  grid: Grid = [];
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
