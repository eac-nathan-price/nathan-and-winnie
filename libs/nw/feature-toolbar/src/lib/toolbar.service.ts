import { Injectable } from '@angular/core';

export type ToolbarItem = {
  icon: string,
  label: string,
  title: string,
  route: string
}

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  items: ToolbarItem[] = [];
  hide = false;
}
