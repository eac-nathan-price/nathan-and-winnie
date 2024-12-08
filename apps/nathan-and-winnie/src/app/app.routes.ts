import { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CardifyComponent } from '@nathan-and-winnie/cardify';
import { FeudComponent } from '@nathan-and-winnie/feud';

export const appRoutes: Route[] = [
  {
    path: 'cardify',
    component: CardifyComponent,
  },
  {
    path: 'feud',
    component: FeudComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  }
];
