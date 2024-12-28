import { Injectable } from '@angular/core';

export type ToolbarItem = {
  icon?: string;
  label: string;
  title?: string;
  route?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  items: ToolbarItem[] = [
    {
      icon: 'home',
      label: 'Home',
      title: 'Home',
      route: '/',
    },
  ];

  enabled = true;

  public patch(index: number, item?: ToolbarItem) {
    this.items.splice(
      index,
      this.items.length - index,
      ...(item ? [item] : []),
    );
  }
}
