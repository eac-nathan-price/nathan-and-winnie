import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import { BOARD, BOARDS, InitMessage, Move, Space, Step } from './data';

@Component({
  selector: 'lib-peg',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatSelectModule],
  templateUrl: './peg.component.html',
  styleUrl: './peg.component.scss',
})
export class PegComponent implements OnInit {
  toolbar = inject(ToolbarService);

  public boards = BOARDS;
  public selectedBoard = BOARD.CIRCLE;
  public solution: Step[] = [];
  public solved = false;
  public ready = false;

  private workerPool: Worker[] = [];

  constructor() {
    const maxWorkers = navigator?.hardwareConcurrency || 4;
    for (let i = 0; i < maxWorkers; i++) {
      this.workerPool.push(new Worker('./solver.worker.ts'));
    }
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'tactic',
      label: 'Peg',
      title: 'Peg',
      route: '/peg',
    });
  }

  cycle(space: Space) {
    space.data = (space.data + 1) % this.selectedBoard.pieces.length;
  }

  style(space: Space) {
    return { 'top.px': space.y, 'left.px': space.x, 'background-color': this.selectedBoard.pieces[space.data] };
  }

  path(start: Space, move: Move) {
    const mid = this.selectedBoard.spaces[move[0]];
    const end = this.selectedBoard.spaces[move[1]];
    const cx = 2 * (mid.x + 14) - 0.5 * (start.x + 14) - 0.5 * (end.x + 14);
    const cy = 2 * (mid.y + 14) - 0.5 * (start.y + 14) - 0.5 * (end.y + 14);
    return `M ${start.x + 14} ${start.y + 14} Q ${cx} ${cy} ${end.x + 14} ${end.y + 14}`;
  }

  solve() {
    for (const worker of this.workerPool) worker.postMessage({ type: 'init', board: this.selectedBoard } as InitMessage);
    const state = this.selectedBoard.spaces.map(x => x.data);
    this.solved = this.step(state, []);
    this.ready = true;
  }

  step(state: number[], steps: Step[]): boolean {
    const counts = new Array(this.selectedBoard.pieces.length).fill(0);
    for (let i = 0; i < state.length; i++) {
      const peg = state[i];
      if (!peg) continue;
      counts[peg]++;
      for (const move of this.selectedBoard.spaces[i].moves) {
        if (state[move[0]] !== peg || state[move[1]]) continue;
        const newState = state.slice();
        newState[move[1]] = peg;
        newState[move[0]] = 0;
        newState[i] = 0;

        if (this.step(newState, [...steps, { data: peg, move: [i, move[1]] }])) return true;
      }
    }
    if (counts.every(x => x < 2)) {
      this.solution = steps;
      return true;
    }
    return false;
  }
}
