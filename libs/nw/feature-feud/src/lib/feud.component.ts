import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
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
  cdr = inject(ChangeDetectorRef);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  toolbar = inject(ToolbarService);

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

  // selectedRound?: Round;
  // selectedQuestion?: Question;

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

  // createTeamFormGroup(team: Team): FormGroup {
  //   return this.fb.group({
  //     name: [team.name],
  //     score: [team.score]
  //   });
  // }

  // get gridRows(): number {
  //   return this.selectedQuestion ? Math.ceil(this.selectedQuestion.answers.length / 2) : 0;
  // }

  // popupWindow: Window | null = null;

  // openPopup() {
  //   const game = this.currGame();
  //   if (!game) return;
  //   this.popupWindow = window.open(
  //     '_blank',
  //     game.title,
  //     'width=1920,height=1080,resizable=yes,scrollbars=yes,status=yes'
  //   );
  //   if (this.popupWindow) {
  //     // Get all font stylesheet links
  //     const fontLinks = Array.from(document.getElementsByTagName('link'))
  //       .filter(link => link.rel === 'stylesheet' || link.rel === 'preconnect')
  //       .map(link => link.outerHTML)
  //       .join('\n');

  //     // Get accessible stylesheet rules
  //     const styles = Array.from(document.styleSheets)
  //       .filter(styleSheet => {
  //         try {
  //           return !!styleSheet.cssRules;
  //         } catch {
  //           return false;
  //         }
  //       })
  //       .map(styleSheet => {
  //         return Array.from(styleSheet.cssRules)
  //           .map(rule => rule.cssText)
  //           .join('\n');
  //       })
  //       .join('\n');

  //     this.popupWindow.document.write(`
  //       <html>
  //         <head>
  //           <title>${game.title}</title>
  //           ${fontLinks}
  //           <style>${styles}</style>
  //           <style>
  //             .admin-only {
  //               display: none;
  //               visibility: hidden;
  //             }
  //           </style>
  //         </head>
  //         <body></body>
  //       </html>
  //     `);

  //     this.popupWindow.onbeforeunload = () => {
  //       this.popupWindow = null;
  //     };

  //     this.syncPopup();
  //   }
  // }

  // syncPopup() {
  //   if (!this.popupWindow) return;
  //   const mirrorContent = document.querySelector('.mirror');
  //   const mirrorContainer = this.popupWindow.document.body;
  //   if (!mirrorContent || !mirrorContainer) return;
  //   mirrorContainer.innerHTML = mirrorContent.innerHTML;
  // }

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

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'co_present',
      label: 'Feud',
      title: 'Feud',
      route: '/feud',
    });
  }

  // ngOnDestroy() {
  //   if (this.popupWindow) {
  //     this.popupWindow.close();
  //     this.popupWindow = null;
  //   }
  // }

  constructor() {
    effect(() => {
      const game = this.currGame();
      this.toolbar.patch(2, game ? { label: game.title } : undefined);
    });
  }

  // ngAfterViewChecked() {
  //   this.syncPopup();
  //   // Prevent potential ExpressionChangedAfterItHasBeenCheckedError
  //   this.cdr.detectChanges();
  // }
}
