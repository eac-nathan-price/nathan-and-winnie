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
    path: 'buzzer',
    component: HomeComponent,
    title: 'Buzzer',
    subtitle: '2025',
    description: 'Multiplayer wireless trivia buzzer',
    icon: 'communication',
    tags: ['Aid']
  },
  {
    path: 'cardify',
    component: CardifyComponent,
    title: 'Cardify',
    subtitle: '2025',
    description: 'Generate printable cards from a spreadsheet',
    icon: 'cards',
    tags: ['Tool']
  },
  {
    path: 'rewind',
    component: HomeComponent,
    title: 'Rewind',
    subtitle: 'January 2025',
    description: 'Watching TV like its 2005',
    icon: 'fast_rewind',
    tags: ['Blog']
  },
  {
    path: 'feud',
    component: FeudComponent,
    title: 'Feud',
    subtitle: 'December 2024',
    description: 'Present custom Feud games',
    icon: 'co_present',
    tags: ['Game']
  },
  {
    path: 'scrabble',
    component: HomeComponent,
    title: 'Scrabble',
    subtitle: 'November 2024',
    description: 'Scrabble scorekeeper and timer',
    icon: 'font_download',
    tags: ['Aid']
  },
  {
    path: 'countdown',
    component: HomeComponent,
    title: 'Countdown',
    subtitle: 'October 2024',
    description: 'Anagram and arithmetic game',
    icon: 'search_activity',
    tags: ['Game']
  },
  {
    path: 'peg',
    component: PegComponent,
    title: 'Peg',
    subtitle: 'September 2024',
    description: 'Peg solitaire solver',
    icon: 'tactic',
    tags: ['Aid']
  },
  {
    path: 'gmtk24',
    component: HomeComponent,
    title: 'Dichthadiiformic',
    subtitle: 'August 2024',
    description: 'GMTK game jam: built to scale',
    icon: 'pest_control',
    tags: ['Game']
  },
  {
    path: 'vcard',
    component: ContactComponent,
    title: 'VCard',
    subtitle: 'July 2024',
    description: 'Create a digital contact card with QR code',
    icon: 'person',
    tags: ['Tool']
  },
  {
    path: 'forewarned',
    component: HomeComponent,
    title: 'Forewarned',
    subtitle: 'June 2024',
    description: 'Evidence matrix',
    icon: 'mystery',
    tags: ['Aid']
  },
  {
    path: 'pdfeedback',
    component: HomeComponent,
    title: 'PDFeedback',
    subtitle: 'May 2024',
    description: 'Highlight & annotate a pdf',
    icon: 'feedback',
    tags: ['Tool']
  },
  {
    path: 'recipes',
    component: HomeComponent,
    title: 'Recipes',
    subtitle: 'April 2024',
    description: 'Vegan & gluten-free',
    icon: 'cooking',
    tags: ['Blog']
  },
  {
    path: 'taskmaster',
    component: HomeComponent,
    title: 'Taskmaster',
    subtitle: 'March 2024',
    description: 'Timer and tasks',
    icon: 'mail',
    tags: ['Game']
  },
  {
    path: 'dice',
    component: HomeComponent,
    title: 'Dice',
    subtitle: 'February 2024',
    description: 'Rpg dice simulation & stats',
    icon: 'casino',
    tags: ['Tool']
  },
  {
    path: 'ricky',
    component: HomeComponent,
    title: 'Ricky',
    subtitle: 'January 2024',
    description: 'Little Ricky the Dog',
    icon: 'pets',
    tags: ['Blog']
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
