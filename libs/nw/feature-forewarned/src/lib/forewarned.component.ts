import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import { evidence, Evidence, mejai, questions, simon, Simon } from './data';

@Component({
  selector: 'lib-forewarned',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './forewarned.component.html',
  styleUrl: './forewarned.component.scss',
})
export class ForewarnedComponent implements OnInit {
  toolbar = inject(ToolbarService);

  evidence = Object.values(evidence);
  mejai = Object.values(mejai);
  filteredMejai = this.mejai;
  questions = questions.sort();
  simon = simon;
  voice = evidence.voice;

  getSrc(icon: string) {
    return `assets/forewarned/${icon}.png`;
  }

  toggleObserved(evidence: Evidence) {
    evidence.observed = !evidence.observed;
    this.update();
  }

  reset() {
    this.evidence.forEach(e => e.observed = false);
    this.update();
  }

  update() {
    // Filter mejai based on observed evidence
    this.filteredMejai = this.mejai.filter(m => {
      // Get all observed evidence
      const observedEvidence = this.evidence.filter(e => e.observed);
      
      // Check if all observed evidence exists in this mejai's evidence list
      return observedEvidence.every(e => 
        m.evidence.some(me => me.label === e.label)
      );
    });

    // Mark evidence as redundant if it's not observed and wouldn't help narrow down results
    this.evidence.forEach(e => {
      if (!e.observed) {
        // Evidence is redundant if all remaining mejai either all have it or all don't have it
        const hasEvidence = this.filteredMejai.map(m => 
          m.evidence.some(me => me.label === e.label)
        );
        e.redundant = hasEvidence.every(h => h === hasEvidence[0]);
      } else {
        e.redundant = false;
      }
    });
  }

  pattern: Simon[] = [];
  addSimon(s: Simon) {
    this.pattern.push(s);
  }
  resetSimon() {
    this.pattern = [];
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Convert key to lowercase to make it case-insensitive
    const pressedKey = event.key.toLowerCase();
    
    // Find evidence with matching hotkey
    const matchingEvidence = this.evidence.find(
      e => e.hotkey.toLowerCase() === pressedKey
    );

    if (matchingEvidence) {
      this.toggleObserved(matchingEvidence);
    }
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'mystery',
      label: 'Forewarned',
      title: 'Forewarned',
      route: '/forewarned',
    });
  }
}
