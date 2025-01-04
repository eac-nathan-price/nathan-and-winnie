import { Component, inject, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToolbarComponent } from '@nathan-and-winnie/feature-toolbar';

type Mode = 'dark' | 'light';

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
export class AppComponent {
  renderer = inject(Renderer2);

  mode: Mode = 'dark';

  public setMode(mode: Mode) {
    this.mode = mode;
    if (mode === 'dark') this.renderer.addClass(document.body, 'dark');
    else this.renderer.removeClass(document.body, 'dark');
  }
  public toggleMode() {
    this.setMode(this.mode === 'dark' ? 'light' : 'dark');
  }
}
