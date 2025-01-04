import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { pages } from '../app.routes';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

type s2s = Record<string, string>;

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  toolbar = inject(ToolbarService);

  cards = pages.filter((page) => !page.hideCard);
  tags = [...new Set(pages.flatMap((page) => page.tags))].sort();
  palette = this.tags.map((_, i) => `hsl(${i * 360 / this.tags.length} 50 50 / 0.5)`);
  bg: s2s = this.tags.reduce((a, x, i) => Object.assign(a, { [x]: this.palette[i] }), {});

  search = '';
  filteredCards = this.cards;

  ngOnInit() {
    this.toolbar.patch(1, {
      label: 'Nathan & Winnie',
    });
  }

  getStripes(tags: string[]): string {
    const stripeWidth = 100 / tags.length;
    return `linear-gradient(135deg, ${
      tags.map((tag, i) => 
        `${this.bg[tag]} ${i * stripeWidth}%, ${this.bg[tag]} ${(i + 1) * stripeWidth}%`
      ).join(', ')
    })`;
  }

  onSearch() {
    const search = this.search.toLowerCase();
    this.filteredCards = this.cards.filter((card) => {
      return card.title.toLowerCase().includes(search)
        || card.subtitle?.toLowerCase().includes(search)
        || card.description?.toLowerCase().includes(search)
        || card.tags.some((tag) => tag.toLowerCase().includes(search));
    });
  }
  onClear() {
    this.search = '';
    this.filteredCards = this.cards;
  }
}
