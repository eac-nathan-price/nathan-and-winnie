import { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AntComponent } from '@nathan-and-winnie/ant';
import { BuzzerComponent } from '@nathan-and-winnie/buzzer';
import { CardifyComponent } from '@nathan-and-winnie/cardify';
import { ContactComponent } from '@nathan-and-winnie/contact';
import { CountdownComponent } from '@nathan-and-winnie/countdown';
import { DiceComponent } from '@nathan-and-winnie/dice';
import { FeudComponent } from '@nathan-and-winnie/feud';
import { ForewarnedComponent } from '@nathan-and-winnie/forewarned';
import { PdfeedbackComponent } from '@nathan-and-winnie/pdfeedback';
import { PegComponent } from '@nathan-and-winnie/peg';
import { RecipesComponent } from '@nathan-and-winnie/recipes';
import { RewindComponent } from '@nathan-and-winnie/rewind';
import { RickyComponent } from '@nathan-and-winnie/ricky';
import { ScrabbleComponent } from '@nathan-and-winnie/scrabble';
import { TaskmasterComponent } from '@nathan-and-winnie/taskmaster';

export type Page = Route & {
  title: string,
  subtitle?: string,
  description?: string,
  icon: string,
  tags: string[],
  hidden?: boolean,
  disabled?: boolean
};

export const pages: Page[] = [
  {
    path: 'buzzer',
    component: BuzzerComponent,
    title: 'Buzzer',
    subtitle: '2025',
    description: 'Multiplayer wireless trivia buzzer',
    icon: 'communication',
    tags: ['Aid'],
    disabled: true
  },
  {
    path: 'cardify',
    component: CardifyComponent,
    title: 'Cardify',
    subtitle: '2025',
    description: 'Generate printable cards from a spreadsheet',
    icon: 'cards',
    tags: ['Tool'],
    disabled: true
  },
  {
    path: 'rewind',
    component: RewindComponent,
    title: 'Rewind',
    subtitle: 'January 2025',
    description: 'Watching TV like its 2005',
    icon: 'fast_rewind',
    tags: ['Blog'],
    disabled: true
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
    component: ScrabbleComponent,
    title: 'Scrabble',
    subtitle: 'November 2024',
    description: 'Scrabble scorekeeper and timer',
    icon: 'font_download',
    tags: ['Aid'],
    disabled: true
  },
  {
    path: 'countdown',
    component: CountdownComponent,
    title: 'Countdown',
    subtitle: 'October 2024',
    description: 'Anagram and arithmetic game',
    icon: 'search_activity',
    tags: ['Game'],
    disabled: true
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
    component: AntComponent,
    title: 'Ant', //'Dichthadiiformic',
    subtitle: 'August 2024',
    description: 'GMTK game jam: built to scale',
    icon: 'pest_control',
    tags: ['Game', 'Nonsense'],
    disabled: true
  },
  {
    path: 'vcard',
    component: ContactComponent,
    title: 'VCard',
    subtitle: 'July 2024',
    description: 'Create a digital contact card with QR code',
    icon: 'person',
    tags: ['Tool', 'Work']
  },
  {
    path: 'forewarned',
    component: ForewarnedComponent,
    title: 'Forewarned',
    subtitle: 'June 2024',
    description: 'Evidence matrix',
    icon: 'mystery',
    tags: ['Aid']
  },
  {
    path: 'pdfeedback',
    component: PdfeedbackComponent,
    title: 'PDFeedback',
    subtitle: 'May 2024',
    description: 'Highlight & annotate a pdf',
    icon: 'feedback',
    tags: ['Tool', 'Work'],
    disabled: true
  },
  {
    path: 'recipes',
    component: RecipesComponent,
    title: 'Recipes',
    subtitle: 'April 2024',
    description: 'Vegan & gluten-free',
    icon: 'cooking',
    tags: ['Blog'],
    disabled: true
  },
  {
    path: 'taskmaster',
    component: TaskmasterComponent,
    title: 'Taskmaster',
    subtitle: 'March 2024',
    description: 'Timer and tasks',
    icon: 'mail',
    tags: ['Game', 'Aid']
  },
  {
    path: 'dice',
    component: DiceComponent,
    title: 'Dice',
    subtitle: 'February 2024',
    description: 'Rpg dice simulation & stats',
    icon: 'casino',
    tags: ['Tool']
  },
  {
    path: 'ricky',
    component: RickyComponent,
    title: 'Ricky',
    subtitle: 'January 2024',
    description: 'Little Ricky the Dog',
    icon: 'pets',
    tags: ['Blog', 'Nonsense']
  },
  {
    path: '',
    pathMatch: 'full' as const,
    component: HomeComponent,
    title: 'Nathan & Winnie',
    description: 'Home page',
    icon: 'home',
    tags: [],
    hidden: true
  }
];

export const appRoutes: Route[] = [
  ...pages
];
