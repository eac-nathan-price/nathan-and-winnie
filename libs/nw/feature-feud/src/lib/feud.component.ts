import { Component, computed, effect, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ToolbarService } from '@nathan-and-winnie/toolbar';
import { Team, Round, Question } from './data/_types';
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

  games = [hf24];
  password = '';

  params = toSignal(this.route.params);
  currGame = computed(() => this.games.find(g => g.id === this.params()?.['id']));
  currRound = linkedSignal({
    source: () => this.currGame(),
    computation: () => null as Round | null
  });

  teams: Team[] = [
    { name: 'Team 1', score: 0 },
    { name: 'Team 2', score: 0 }
  ];

  selectedRound?: Round;
  selectedQuestion?: Question;

  // teamsForm = this.fb.group({
  //   teams: this.fb.array(this.initialTeams.map(team => this.createTeamFormGroup(team)))
  // });

  // get teams() {
  //   return this.teamsForm.get('teams') as FormArray;
  // }

  // addTeam() {
  //   this.teams.push(this.createTeamFormGroup({ name: 'New Team', score: 0 }));
  // }

  // removeTeam(index: number) {
  //   this.teams.removeAt(index);
  // }

  createTeamFormGroup(team: Team): FormGroup {
    return this.fb.group({
      name: [team.name],
      score: [team.score]
    });
  }

  get gridRows(): number {
    return this.selectedQuestion ? Math.ceil(this.selectedQuestion.answers.length / 2) : 0;
  }

  popupWindow = signal<Window | null>(null);

  openMirrorWindow() {
    const popup = window.open('', 'Mirror Display', 'width=800,height=600');
    if (popup) {
      // Initialize the popup window with necessary styles and content
      popup.document.write(`
        <html>
          <head>
            <title>Mirror Display</title>
            <style>
              /* Copy your relevant styles here */
            </style>
          </head>
          <body>
            <div id="mirror-container"></div>
          </body>
        </html>
      `);
      this.popupWindow.set(popup);

      // Handle popup close
      popup.onbeforeunload = () => {
        this.popupWindow.set(null);
      };
    }
  }

  constructor() {
    effect(() => {
      const game = this.currGame();
      this.toolbar.patch(2, game ? { label: game.title } : undefined);
    });

    // Add new effect to update mirror
    effect(() => {
      const popup = this.popupWindow();
      if (popup && !popup.closed) {
        const mirrorContent = document.getElementById('mirror-content');
        if (mirrorContent) {
          const mirrorContainer = popup.document.getElementById('mirror-container');
          if (mirrorContainer) {
            mirrorContainer.innerHTML = mirrorContent.innerHTML;
          }
        }
      }
    });
  }
}
