export type Question = {
  text: string;
  answers: Answer[];
  notes?: string;
};

export type Answer = {
  text: string;
  points: number;
  notes?: string;
};

export type Round = {
  title: string;
  type: 'tossup' | 'rapid' | 'tiebreak';
  questions: Question[];
  multiplier: number;
  notes?: string;
};

export type Game = {
  title: string;
  rounds: Round[];
  notes?: string;
};

export type Team = {
  name: string;
  score: number;
};
