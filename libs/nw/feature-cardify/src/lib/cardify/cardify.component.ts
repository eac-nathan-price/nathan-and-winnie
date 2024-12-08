import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-cardify',
  imports: [CommonModule],
  templateUrl: './cardify.component.html',
  styleUrl: './cardify.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardifyComponent {}
