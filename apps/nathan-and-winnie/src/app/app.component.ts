import { Component } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs';
import { pages } from './app.routes';

@Component({
  imports: [RouterModule, MatToolbarModule, MatIconModule, MatButtonModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  currentPage = pages[pages.length - 1]; // Default to home page

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentPage = pages.find(page => event.urlAfterRedirects === '/' + page.path) 
        ?? pages[pages.length - 1];
    });
  }
}
