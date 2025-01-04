/// <reference lib="webworker" />

import { Message } from './data';

//let board: Board;

addEventListener('message', ({ data }: MessageEvent<Message>) => {
  if (data.type === 'task') {
    console.log('task', data);
  } else if (data.type === 'init') {
    console.log('init', data);
  }
  //postMessage(response);
});

// solve() {
//   for (const worker of this.workerPool) worker.postMessage({ type: 'init', board: this.selectedBoard } as InitMessage);
//   const state = this.selectedBoard.spaces.map(x => x.data);
//   this.solved = this.step(state, []);
//   this.ready = true;
// }

// function step(state: number[], steps: Step[]): boolean {
//   const counts = new Array(board.pieces.length).fill(0);
//   for (let i = 0; i < state.length; i++) {
//     const peg = state[i];
//     if (!peg) continue;
//     counts[peg]++;
//     for (const move of board.spaces[i].moves) {
//       if (state[move[0]] !== peg || state[move[1]]) continue;
//       const newState = state.slice();
//       newState[move[1]] = peg;
//       newState[move[0]] = 0;
//       newState[i] = 0;

//       if (this.step(newState, [...steps, { data: peg, move: [i, move[1]] }])) return true;
//     }
//   }
//   if (counts.every(x => x < 2)) {
//     this.solution = steps;
//     return true;
//   }
//   return false;
// }
