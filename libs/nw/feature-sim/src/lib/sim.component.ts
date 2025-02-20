import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { extend } from 'angular-three';
import { Delaunay } from "d3-delaunay";
import { createNoise2D } from 'simplex-noise';
import { Box2, Random, Vector2, Vector3 } from './vector';

extend(THREE);

// function computeVoronoi(points: Vector2[], box: Box2) {
//   const delaunay = Delaunay.from(points, d => d.x, d => d.y);
//   const voronoi = delaunay.voronoi(box.bounds()); // Clipped within bounding box

//   const cells = points.map((site, i) => {
//       const edges = [];
//       const cell = voronoi.cellPolygon(i);

//       if (cell) {
//           for (let j = 0; j < cell.length - 1; j++) {
//               edges.push({ start: { x: cell[j][0], y: cell[j][1] }, end: { x: cell[j + 1][0], y: cell[j + 1][1] } });
//           }
//       }

//       return { site, edges };
//   });

//   return cells;
// }

@Component({
  selector: 'lib-sim',
  imports: [CommonModule],
  templateUrl: './sim.component.html',
  styleUrl: './sim.component.scss',
})
export class SimComponent implements OnInit { 
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'altitude',
      label: 'Sim',
      title: 'Sim',
      route: '/sim',
    });

    if (!isPlatformBrowser(this.platformId)) return;

    const box = new Box2(0, 0, 800, 600);
    const points = Random.vector2s(box, 9);
    const delaunay = Delaunay.from(points, d => d.x, d => d.y);
    const voronoi = delaunay.voronoi(box.bounds());
    console.log(voronoi);

    const noise2D = createNoise2D();
    points.forEach((p, i) => {
      const z = noise2D(p.x, p.y);
      const cell = voronoi.cellPolygon(i).map(c => new Vector2(c[0], c[1]));
      const tcell = cell.map(c => {
        const d = Vector2.distance(p, c);
        if (d < 10) return c.toVector3(z);
        return Vector2.nudge(c, p, Math.min(10, d - 10)).toVector3(z);
      });
      console.log(p, cell, tcell);
    });
  }

  toolbar = inject(ToolbarService);
}
