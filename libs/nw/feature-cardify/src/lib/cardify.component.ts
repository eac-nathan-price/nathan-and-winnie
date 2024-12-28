import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

@Component({
  selector: 'lib-cardify',
  imports: [CommonModule],
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
