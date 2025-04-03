import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

@Component({
  selector: 'lib-cardify',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSliderModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './cardify.component.html',
  styleUrl: './cardify.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardifyComponent implements OnInit {
  toolbar = inject(ToolbarService);

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'cards',
      label: 'Cardify',
      title: 'Cardify',
      route: '/cardify',
    });
  }
}
