import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarService } from '@nathan-and-winnie/toolbar';
import { Team, Round, Question } from './data/_types';
import { hf24 } from './data/hf24';


@Component({
  selector: 'lib-feud',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './feud.component.html',
  styleUrl: './feud.component.scss',
})
export class FeudComponent implements OnInit {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  toolbar = inject(ToolbarService);

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'co_present',
      label: 'Feud',
      title: 'Feud',
      route: '/feud'
    });
  }

  params = toSignal(this.route.params);

  games = [hf24];
  game = computed(() => this.games.find(g => g.id === this.params()?.['id']));
  password = '';

  initialTeams: Team[] = [
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 }
  ];

  selectedRound?: Round;
  selectedQuestion?: Question;

  teamsForm = this.fb.group({
    teams: this.fb.array(this.initialTeams.map(team => this.createTeamFormGroup(team)))
  });

  get teams() {
    return this.teamsForm.get('teams') as FormArray;
  }

  addTeam() {
    this.teams.push(this.createTeamFormGroup({ name: 'New Team', score: 0 }));
  }

  removeTeam(index: number) {
    this.teams.removeAt(index);
  }

  createTeamFormGroup(team: Team): FormGroup {
    return this.fb.group({
      name: [team.name],
      score: [team.score]
    });
  }

  get gridRows(): number {
    return this.selectedQuestion ? Math.ceil(this.selectedQuestion.answers.length / 2) : 0;
  }

  constructor() {
    effect(() => {
      const game = this.game();
      this.toolbar.patch(2, game ? { label: game.title } : undefined);
    });
  }
}
