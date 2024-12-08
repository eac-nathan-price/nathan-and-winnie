import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { hf24 } from '../data/hf24';

type Team = {
  name: string;
  score: number;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  game = hf24;
  team1: Team = { name: 'Team 1', score: 0 };
  team2: Team = { name: 'Team 2', score: 0 };
}
