import { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CardifyComponent } from '@nathan-and-winnie/cardify';
import { FeudComponent } from '@nathan-and-winnie/feud';
import { ContactComponent } from '@nathan-and-winnie/contact';
import { PegComponent } from '@nathan-and-winnie/peg';
export type Page = Route & {
  title: string,
  subtitle?: string,
  description?: string,
  icon: string,
  tags: string[],
  hideCard?: boolean
};

export const pages: Page[] = [
  {
    path: 'cardify',
    component: CardifyComponent,
    title: 'Cardify',
    subtitle: '2025',
    description: 'Generate printable cards from a spreadsheet',
    icon: 'cards',
    tags: ['tool']
  },
  {
    path: 'feud',
    component: FeudComponent,
    title: 'Feud',
    subtitle: 'December 2024',
    description: 'Present custom Feud games',
    icon: 'co_present',
    tags: ['game']
  },
  {
    path: 'peg',
    component: PegComponent,
    title: 'Peg',
    subtitle: 'September 2024',
    description: 'Peg solitaire solver',
    icon: 'tactic',
    tags: ['tool']
  },
  {
    path: 'vcard',
    component: ContactComponent,
    title: 'VCard',
    subtitle: 'July 2024',
    description: 'Create a digital contact card with QR code',
    icon: 'person',
    tags: ['tool']
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
