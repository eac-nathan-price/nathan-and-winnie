import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { WindowComponent } from '@nathan-and-winnie/ui-window';

@Component({
  selector: 'lib-countdown',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    WindowComponent
  ],
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss',
})
export class CountdownComponent {
  letters: string[] = new Array(9).fill('_');
  numbers: number[] = new Array(6).fill(0);

  consonants = 'BBCCDDDDFFGGGHHJKLLLLMMNNNNNNPPQRRRRRRSSSSTTTTTTVVWWXYYZ'.split('');
  consonantsDeck = [...this.consonants];
  vowels = 'AAAAAAAAAEEEEEEEEEEEEIIIIIIIIIOOOOOOOOUUUUYY'.split('');
  vowelsDeck = [...this.vowels];

  big = [25, 50, 75, 100];
  bigDeck = [...this.big];
  small = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  smallDeck = [...this.small, ...this.small, ...this.small, ...this.small];

  reset() {
    this.letters = new Array(9).fill('_');
    this.numbers = new Array(6).fill(0);
    this.consonantsDeck = [...this.consonants];
    this.vowelsDeck = [...this.vowels];
    this.bigDeck = [...this.big];
    this.smallDeck = [...this.small, ...this.small, ...this.small, ...this.small];
  }

  drawLetter(deck: string[]) {
    const index = this.letters.findIndex(letter => letter === '_');
    if (index === -1) return;
    let letter = this.getRandomItem(deck, true);
    if (this.letters.includes(letter) && this.probability(0.5)) letter = this.getRandomItem(deck, true);
    this.letters[index] = letter;
  }
  drawConsonant() {
    this.drawLetter(this.consonantsDeck);
  }
  drawVowel() {
    this.drawLetter(this.vowelsDeck);
  }

  drawNumber(deck: number[]) {
    const index = this.numbers.findIndex(number => number === 0);
    if (index === -1) return;
    this.numbers[index] = this.getRandomItem(deck, true);
  }
  drawBig() {
    this.drawNumber(this.bigDeck);
  }
  drawSmall() {
    this.drawNumber(this.smallDeck);
  }

  getRandomInt(max: number, min = 0) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  getRandomItem<T>(array: T[], remove = false) {
    const index = this.getRandomInt(array.length);
    if (remove) array.splice(index, 1);
    return array[index];
  }
  probability(p: number) {
    return Math.random() < p;
  }
}
