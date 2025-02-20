import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { injectStore, extend, NgtArgs } from 'angular-three';
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
    
    <ngt-ambient-light [intensity]="0.5" />
    <ngt-spot-light [position]="10" [intensity]="0.5 * Math.PI" [angle]="0.15" [penumbra]="1" [decay]="0" />
    <ngt-point-light [position]="-10" [intensity]="0.5 * Math.PI" [decay]="0" />

    @for (cell of cells; track cell) {
      <lib-cell [borderPoints]="cell.border" [centerPoint]="cell.center" />
    }
  `,
  imports: [NgtArgs, CellComponent, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneGraphComponent {
  cells: Cell[] = [];
  
  constructor() {
    const box = new Box2(-5, -5, 5, 5);
    const points = Random.vector2s(box, 9);
    const delaunay = Delaunay.from(points, d => d.x, d => d.y);
    const voronoi = delaunay.voronoi(box.bounds());

    const noise2D = createNoise2D();
    this.cells = points.map((p, i) => {
      const z = noise2D(p.x, p.y) * 2;
      const cell = voronoi.cellPolygon(i).map(c => new Vector2(c[0], c[1]));
      return {
        center: new THREE.Vector3(p.x, p.y, z),
        border: cell.map(c => {
          const d = Vector2.distance(p, c);
          if (d < 1) return new THREE.Vector3(c.x, c.y, z);
          const nudged = Vector2.nudge(c, p, Math.min(1, d - 1));
          return new THREE.Vector3(nudged.x, nudged.y, z);
        })
      };
    });
  }

  protected readonly Math = Math;

  private store = injectStore();
  protected camera = this.store.select('camera');
  protected glDomElement = this.store.select('gl', 'domElement');
}
