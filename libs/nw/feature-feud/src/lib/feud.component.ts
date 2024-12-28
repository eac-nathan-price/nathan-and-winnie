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
import { MatTabsModule } from '@angular/material/tabs';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import { WindowComponent } from '@nathan-and-winnie/ui-window';
import { Team } from './data/_types';
import { hf24 } from './data/hf24';

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
  teams: Team[] = [
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 },
  ];

  params = toSignal(this.route.params);
  currGame = computed(() =>
    this.games.find((g) => g.id === this.params()?.['id']),
  );

  endAudio = new Audio('media/family-feud-end.mp3');
  noAudio = new Audio('media/family-feud-no.mp3');
  yesAudio = new Audio('media/family-feud-yes.mp3');
  nos = signal<number>(0);

  no(num: number) {
    this.noAudio.currentTime = 1;
    this.noAudio.play();
    setTimeout(() => {
      this.nos.set(num);
    }, 200);
    setTimeout(() => {
      this.nos.set(0);
    }, 1500);
  }

  end() {
    this.endAudio.play();
  }

  reopenWindow() {
    this.window()?.reopenWindow();
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
