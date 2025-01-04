import { Component, ElementRef, inject, OnInit, viewChild, viewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

@Component({
  selector: 'lib-ricky',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './ricky.component.html',
  styleUrl: './ricky.component.scss',
})
export class RickyComponent implements OnInit {
  toolbar = inject(ToolbarService);

  content = viewChild<ElementRef>('content');
  headings = viewChildren<ElementRef>('heading');

  getOffset(heading: ElementRef) {
    return (heading.nativeElement.tagName[1] - 1) * 16;
  }

  scrollTo(heading: ElementRef, index: number) {
    if (index === 0) {
      this.content()?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      heading.nativeElement.scrollIntoView({behavior: 'smooth'});
    }
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'pets',
      label: 'Ricky',
      title: 'Ricky',
      route: '/ricky',
    });
  }
}
