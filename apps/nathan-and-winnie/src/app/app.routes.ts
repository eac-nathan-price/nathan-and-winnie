import { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CardifyComponent } from '@nathan-and-winnie/cardify';
import { FeudComponent } from '@nathan-and-winnie/feud';
import { ContactComponent } from '@nathan-and-winnie/contact';

export type Page = Route & {
  title: string,
  description: string,
  icon: string,
  tags: string[],
  hideToolbar?: boolean,
  hideCard?: boolean;
};

export const pages: Page[] = [
  {
    path: 'cardify',
    component: CardifyComponent,
    title: 'Cardify',
    description: 'Generate printable cards from a spreadsheet',
    icon: 'cards',
    tags: ['tool']
  },
  {
    path: 'contact',
    component: ContactComponent,
    title: 'Contact',
    description: 'Create a digital contact card with QR code',
    icon: 'person',
    tags: ['tool'],
    hideToolbar: true
  },
  {
    path: 'feud',
    component: FeudComponent,
    title: 'Feud',
    description: 'Present custom Feud games',
    icon: 'co_present',
    tags: ['game']
  },
  {
    path: '',
    pathMatch: 'full' as const,
    component: HomeComponent,
    title: 'Nathan & Winnie',
    description: 'Home page',
    icon: 'home',
    tags: [],
    hideCard: true
  }
];

export const appRoutes: Route[] = [
  ...pages
];
