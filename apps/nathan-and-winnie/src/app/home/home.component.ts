import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { pages } from '../app.routes';
import { ToolbarService } from '@nathan-and-winnie/toolbar';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatGridListModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  toolbar = inject(ToolbarService);

  cards = pages.filter(page => !page.hideCard);

  ngOnInit() {
    this.toolbar.patch(1, {
      label: 'Nathan & Winnie'
    });
  }
}
