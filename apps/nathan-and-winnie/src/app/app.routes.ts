import { Route } from '@angular/router';
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
    redirectTo: 'cardify',
  },
];
