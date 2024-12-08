import { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CardifyComponent } from '@nathan-and-winnie/cardify';
import { FeudComponent } from '@nathan-and-winnie/feud';

export const pages = [
  {
    path: 'cardify',
    component: CardifyComponent,
    name: 'Cardify',
    description: 'Generate printable cards from a spreadsheet',
  },
  {
    path: 'feud',
    component: FeudComponent,
    name: 'Feud',
    description: 'Present custom Feud games',
  },
];

export const appRoutes: Route[] = [
  ...pages,
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  }
];
