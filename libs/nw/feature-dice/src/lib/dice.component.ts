import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

interface DiceRoll {
  timestamp: Date;
  dice: Die[];
  total: number;
}

interface Die {
  sides: number;
  result?: number;
}

@Component({
  selector: 'lib-dice',
  imports: [CommonModule, FormsModule, ScrollingModule],
  templateUrl: './dice.component.html',
  styleUrl: './dice.component.scss',
})
export class DiceComponent implements OnInit {
  toolbar = inject(ToolbarService);
  
  dicePool: Die[] = [];
  availableDice = [4, 6, 8, 10, 12, 20, 100];
  total = 0;
  rollHistory: DiceRoll[] = [];
  movingAverage = 0;

  addDie(sides: number) {
    this.dicePool.push({ sides });
  }

  removeDie(index: number) {
    this.dicePool.splice(index, 1);
  }

  rollDice() {
    this.total = 0;
    this.dicePool = this.dicePool.map(die => {
      const result = Math.floor(Math.random() * die.sides) + 1;
      this.total += result;
      return { ...die, result };
    });

    // Add roll to history
    this.rollHistory.push({
      timestamp: new Date(),
      dice: [...this.dicePool],
      total: this.total
    });

    // Calculate moving average
    this.movingAverage = this.rollHistory.reduce((sum, roll) => sum + roll.total, 0) / this.rollHistory.length;
  }

  clearPool() {
    this.dicePool = [];
    this.total = 0;
    this.rollHistory = [];
    this.movingAverage = 0;
  }

  bulkRoll(count: number) {
    for (let i = 0; i < count; i++) {
      this.rollDice();
    }
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'casino',
      label: 'Dice',
      title: 'Dice',
      route: '/dice',
    });
  }
}
