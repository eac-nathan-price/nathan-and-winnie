export type Move = [number, number];

export type Space = {
  x: number,
  y: number,
  data: number,
  moves: Move[]
};

export type Board = {
  name: string,
  pieces: string[],
  spaces: Space[]
};

export type Step = {
  data: number,
  move: Move
};

export type InitMessage = {
  type: 'init',
  board: Board
};

export type TaskMessage = {
  type: 'task',
  state: number[],
  steps: Step[]
}

export type Message = InitMessage | TaskMessage;
