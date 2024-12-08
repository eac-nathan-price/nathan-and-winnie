import { Route } from '@angular/router';
import { CardifyComponent } from '@nathan-and-winnie/cardify';

export const appRoutes: Route[] = [
  {
    path: 'cardify',
    component: CardifyComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'cardify',
  },
];
