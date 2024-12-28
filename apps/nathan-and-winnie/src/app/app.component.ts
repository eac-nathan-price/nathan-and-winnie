import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToolbarComponent } from '@nathan-and-winnie/feature-toolbar';

@Component({
  imports: [
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    ToolbarComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
