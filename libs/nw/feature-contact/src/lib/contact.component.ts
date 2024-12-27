import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/toolbar';

@Component({
  selector: 'lib-contact',
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit, OnDestroy {
  toolbar = inject(ToolbarService);
  
  ngOnInit() {
    this.toolbar.enabled = false;
  }

  ngOnDestroy() {
    this.toolbar.enabled = true;
  }
}
