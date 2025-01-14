import { inject, OnInit } from '@angular/core';
import { ToolbarService } from './toolbar.service';

export class PageMixin {
  page = {
    icon: 'cards',
    label: 'Cardify',
    title: 'Cardify',
    route: '/cardify',
  };
}

export class ToolbarMixin extends PageMixin implements OnInit {
  toolbar = inject(ToolbarService);

  ngOnInit() {
    this.toolbar.patch(1, this.page);
  }
}
