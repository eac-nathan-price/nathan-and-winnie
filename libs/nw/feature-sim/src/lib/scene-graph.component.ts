import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { injectStore, extend, NgtArgs, NgtThreeEvent } from 'angular-three';
import { OrbitControls } from 'three-stdlib';
import { Delaunay } from "d3-delaunay";
import { createNoise2D } from 'simplex-noise';

// import { CubeComponent } from './cube.component';
import { CellComponent } from './cell.component';
import { Box2, Random, Vector2 } from './vector';

extend(THREE);
extend({
  OrbitControls,
});

interface Cell {
  border: THREE.Vector3[];
  center: THREE.Vector3;
}

@Component({
  template: `
    <ngt-orbit-controls *args="[camera(), glDomElement()]" />
    <ngt-grid-helper (click)="onClick($event)" />
    
    <ngt-ambient-light [intensity]="0.5" />
    <ngt-spot-light [position]="10" [intensity]="0.5 * Math.PI" [angle]="0.15" [penumbra]="1" [decay]="0" />
    <ngt-point-light [position]="-10" [intensity]="0.5 * Math.PI" [decay]="0" />

    @for (cell of cells(); track cell) {
      <lib-cell [borderPoints]="cell.border" [centerPoint]="cell.center" />
    }
  `,
  imports: [NgtArgs, CellComponent, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneGraphComponent {
  noise2D = createNoise2D();
  box = new Box2(-5, -5, 5, 5);
  points = signal<Vector2[]>(Random.vector2s(this.box, 9));

  cells = computed(() => {
    const delaunay = Delaunay.from(this.points(), d => d.x, d => d.y);
    const voronoi = delaunay.voronoi(this.box.bounds());
    return this.points().map((p, i) => {
      const z = this.noise2D(p.x, p.y) * 2;
      const cell = voronoi.cellPolygon(i).map(c => new Vector2(c[0], c[1]));
      return {
        center: new THREE.Vector3(p.x, z, p.y),
        border: cell.map(c => {
          const d = Vector2.distance(p, c);
          if (d < 1) return new THREE.Vector3(c.x, z, c.y);
          const nudged = Vector2.nudge(c, p, Math.min(1, d - 1));
          return new THREE.Vector3(nudged.x, z, nudged.y);
        })
      };
    });
  });

  onClick(event: NgtThreeEvent<MouseEvent>) {
    event.stopPropagation();
    
    switch(event.object.type) {
      case 'GridHelper':
        console.log('Grid clicked at:', event.point);
        this.points.set([...this.points(), new Vector2(event.point.x, event.point.z)]);
        break;
      case 'Mesh':
        console.log('Mesh clicked:', event.object);
        break;
    }
  }

  protected readonly Math = Math;

  private store = injectStore();
  protected camera = this.store.select('camera');
  protected glDomElement = this.store.select('gl', 'domElement');
}
