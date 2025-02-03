import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

@Component({
  selector: 'lib-sudoku',
  imports: [CommonModule],
  templateUrl: './sudoku.component.html',
  styleUrl: './sudoku.component.scss',
})
export class SudokuComponent implements OnInit {
  toolbar = inject(ToolbarService);

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'pin',
      label: 'Sudoku',
      title: 'Sudoku',
      route: '/sudoku',
    });
  }
}
