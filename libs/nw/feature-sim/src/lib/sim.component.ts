import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { extend } from 'angular-three';
import { Delaunay } from "d3-delaunay";

extend(THREE);

class Vector2 {
  constructor(
    public x: number,
    public y: number
  ) {}
}

class Vector3 {
  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}
}

type Bounds2 = [
  number, // xMin
  number, // yMin
  number, // xMax
  number  // yMax
];

type Bounds3 = [
  number, // xMin
  number, // yMin
  number, // zMin
  number, // xMax
  number, // yMax
  number  // zMax
];

class Box2 {
  constructor(
    public xMin: number,
    public yMin: number,
    public xMax: number,
    public yMax: number
  ) {}

  bounds() {
    return [
      this.xMin,
      this.yMin,
      this.xMax,
      this.yMax
    ] as Bounds2;
  }
}

class Box3 {
  constructor(
    public xMin: number,
    public yMin: number,
    public zMin: number,
    public xMax: number,
    public yMax: number,
    public zMax: number
  ) {}

  bounds() {
    return [
      this.xMin,
      this.yMin,
      this.zMin,
      this.xMax,
      this.yMax,
      this.zMax
    ] as Bounds3;
  }
}

class Random {
  static float(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  static int(min: number, max: number) {
    return Math.floor(Random.float(min, max));
  }
  
  static vector2(box: Box2) {
    return new Vector2(
      Random.float(box.xMin, box.xMax),
      Random.float(box.yMin, box.yMax)
    );
  }

  static vector3(box: Box3) {
    return new Vector3(
      Random.float(box.xMin, box.xMax),
      Random.float(box.yMin, box.yMax),
      Random.float(box.zMin, box.zMax)
    );
  }
}

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
    const points = new Array(9).map(() => Random.vector2(box));
    const delaunay = Delaunay.from(points, d => d.x, d => d.y);
    const voronoi = delaunay.voronoi(box.bounds());
    console.log(voronoi);
  }

  toolbar = inject(ToolbarService);
}
