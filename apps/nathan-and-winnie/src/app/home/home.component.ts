import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { pages } from '../app.routes';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, MatCardModule, MatGridListModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  pages = pages;
}
