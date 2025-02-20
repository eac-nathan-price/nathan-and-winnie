import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { NgtCanvas } from 'angular-three';


import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import { SceneGraphComponent } from './scene-graph.component';

@Component({
  selector: 'lib-sim',
  imports: [CommonModule, NgtCanvas],
  templateUrl: './sim.component.html',
  styleUrl: './sim.component.scss',
})
export class SimComponent implements OnInit { 
  private platformId = inject(PLATFORM_ID);

  sceneGraph = SceneGraphComponent;

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'altitude',
      label: 'Sim',
      title: 'Sim',
      route: '/sim',
    });

    if (!isPlatformBrowser(this.platformId)) return;
  }

  toolbar = inject(ToolbarService);
}
