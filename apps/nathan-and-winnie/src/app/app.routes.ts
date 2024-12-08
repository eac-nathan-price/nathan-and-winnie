import { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CardifyComponent } from '@nathan-and-winnie/cardify';
import { FeudComponent } from '@nathan-and-winnie/feud';

export const pages = [
  {
    path: 'cardify',
    component: CardifyComponent,
    title: 'Cardify',
    description: 'Generate printable cards from a spreadsheet',
    icon: 'cards'
  },
  {
    path: 'feud',
    component: FeudComponent,
    title: 'Feud',
    description: 'Present custom Feud games',
    icon: 'co_present'
  },
  {
    path: '',
    pathMatch: 'full' as const,
    component: HomeComponent,
    title: 'Nathan & Winnie',
    description: 'Home page',
    icon: 'home'
  }
];

export const appRoutes: Route[] = [
  ...pages
];
