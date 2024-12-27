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
  id: string;
  title: string;
  title1: string[];
  title2: string[];
  subtitle?: string[];
  password?: string;
  rounds: Round[];
  notes?: string;
};

export type Team = {
  name: string;
  score: number;
};
