import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import { WindowComponent, WindowType } from '@nathan-and-winnie/ui-window';
import { Question, Round, Team } from './data/_types';
import { hf24 } from './data/hf24';

type RapidReveal = {
  answer: string;
  points: number;
  revealed: boolean;
}

@Component({
  selector: 'lib-feud',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTabsModule,
    ReactiveFormsModule,
    RouterModule,
    WindowComponent,
  ],
  templateUrl: './feud.component.html',
  styleUrl: './feud.component.scss',
})
export class FeudComponent implements OnInit {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  toolbar = inject(ToolbarService);

  window = viewChild<WindowComponent>(WindowComponent);

  games = [hf24];
  password = '';
  potEnabled = true;
  tabIndex = 0;
  teams: Team[] = [
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 },
  ];
  rapid: RapidReveal[] = new Array(99).fill({}).map(() => ({ answer: '', points: 0, revealed: false }));
  
  activeAnswers: boolean[] = [];
  activePot = 0;
  activeRound: Round | null = null;
  activeTeam: Team | null = null;
  activeQuestion: Question | null = null;

  params = toSignal(this.route.queryParams);
  currGame = computed(() =>
    this.games.find((g) => g.id === this.params()?.['id']),
  );
  rapidRound = computed(() => this.currGame()?.rounds.find((r) => r.type === 'rapid'));

  playEnd() {
    const audio = new Audio('assets/feud/end.mp3');
    audio.play();
  }
  playNo() {
    const audio = new Audio('assets/feud/no.mp3');
    audio.currentTime = 1;
    audio.play();
  }
  playYes() {
    const audio = new Audio('assets/feud/yes.mp3');
    audio.play();
  }
  nos = signal<number>(0);
  noTimeout: ReturnType<typeof setTimeout> | null = null;

  no(num: number) {
    if (this.noTimeout) clearTimeout(this.noTimeout);
    this.playNo();
    setTimeout(() => {
      this.nos.set(num);
    }, 200);
    this.noTimeout = setTimeout(() => {
      this.nos.set(0);
    }, 1700);
  }

  end() {
    this.playEnd();
  }

  openWindow(windowType?: WindowType) {
    this.window()?.open(windowType);
  }

  deactivate(event?: MatTabChangeEvent) {
    if (event) this.tabIndex = event.index;
    this.activeQuestion = null;
    this.activeAnswers = [];
    this.activeRound = null;
    this.activeTeam = null;
    this.activePot = 0;
  }

  activate(round: Round, question: Question, team: Team | null = null) {
    this.activeAnswers = question.answers.map(() => false);
    this.activeQuestion = question;
    this.activeRound = round;
    this.activeTeam = team;
    this.activePot = 0;
    this.potEnabled = true;
  }

  toggleAnswer(i: number) {
    if (!this.activeQuestion || !this.activeRound) return;
    if (!this.activeAnswers[i]) this.playYes();
    this.activeAnswers[i] = !this.activeAnswers[i];
    if (!this.potEnabled) return;
    this.activePot += (this.activeAnswers[i] ? 1 : -1) * this.activeQuestion.answers[i].points * this.activeRound.multiplier;
  }

  award(team: Team) {
    team.score += this.activePot;
    this.playYes();
  }

  makeTitle(round: Round) {
    if (round.type === 'tiebreak') return `${round.title} - Highest Score Wins`;
    else if (round.type !== 'tossup') return round.title;
    const words = ['', 'Normal', 'Double', 'Triple', 'Quadruple', 'Quintuple'];
    if (Number.isInteger(round.multiplier) && words[round.multiplier]) return `${round.title} - ${words[round.multiplier]} Points`;
    return `${round.title} - ${round.multiplier}x Points`;
  }

  reveal(i: number) {
    this.rapid[i].revealed = true;
    this.activePot += this.rapid[i].points;
    if (this.rapid[i].points === 0) this.no(1);
    else this.playYes();
  }

  getRapidPoints() {
    return this.rapid.reduce((sum, answer) => sum + answer.points, 0);
  }

  getBestAnswer(question: Question) {
    return question.answers.reduce((best, answer) => answer.points > best.points ? answer : best, question.answers[0]).text;
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'co_present',
      label: 'Feud',
      title: 'Feud',
      route: '/feud',
    });
  }

  constructor() {
    effect(() => {
      const game = this.currGame();
      this.toolbar.patch(2, game ? { label: game.title } : undefined);
    });
  }
}
