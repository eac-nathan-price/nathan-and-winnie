import { Component, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { timer, Subscription } from 'rxjs';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import { WindowComponent, WindowType } from '@nathan-and-winnie/ui-window';

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
export class CountdownComponent implements OnInit {
  toolbar = inject(ToolbarService);

  window = viewChild<WindowComponent>(WindowComponent);

  tabIndex = 0;

  onTabChange(event: MatTabChangeEvent) {
    this.tabIndex = event.index;
    this.reset();
  }

  openWindow(windowType?: WindowType) {
    this.window()?.open(windowType);
  }

  letters: string[] = new Array(9).fill('');
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
    this.letters = new Array(9).fill('');
    this.numbers = new Array(6).fill(0);
    this.consonantsDeck = [...this.consonants];
    this.vowelsDeck = [...this.vowels];
    this.bigDeck = [...this.big];
    this.smallDeck = [...this.small, ...this.small, ...this.small, ...this.small];
  }

  countdown = 0;
  clock = 0;
  percent = 100;
  showClock = false;
  start = null as number | null;

  private timerSubscription?: Subscription;
  private barSubscription?: Subscription;

  play() {
    const audio = new Audio('assets/countdown/clock.mp3');
    audio.play();

    this.showClock = true;
    timer(35000).subscribe(() => {
      this.showClock = false;
    });

    this.countdown = 31;
    this.timerSubscription = timer(2000, 1000).subscribe(() => {
      this.countdown--;
      this.clock = this.countdown;

      if (this.countdown === 0) {
        this.timerSubscription?.unsubscribe();
      }
    });

    this.percent = 0;
    this.start = Date.now() + 2000;
    this.barSubscription = timer(2000, 10).subscribe(() => {
      this.percent = (Date.now() - (this.start ?? 0)) / 300;

      if (this.percent >= 100) {
        this.barSubscription?.unsubscribe();
        this.percent = 100;
      }
    });
  }

  isDisabled<T>(hand: T[], deck: T[]) {
    return hand.every(item => item) || !deck.length;
  }

  drawLetter(deck: string[]) {
    const index = this.letters.findIndex(letter => !letter);
    if (index === -1) return;
    let letter = this.getRandomItem(deck, true);
    if (this.letters.includes(letter) && this.probability(0.33)) letter = this.getRandomItem(deck, true);
    this.letters[index] = letter;
  }
  drawConsonant() {
    this.drawLetter(this.consonantsDeck);
  }
  drawVowel() {
    this.drawLetter(this.vowelsDeck);
  }

  drawNumber(deck: number[]) {
    const index = this.numbers.findIndex(number => !number);
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
    if (remove) return array.splice(index, 1)[0];
    return array[index];
  }
  probability(p: number) {
    return Math.random() < p;
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'search_activity',
      label: 'Countdown',
      title: 'Countdown',
      route: '/countdown'
    });
  }
}
