import { Component, input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import * as THREE from 'three';
import { extend, NgtArgs } from 'angular-three';

extend(THREE);

@Component({
  selector: 'lib-cell',
  standalone: true,
  template: `
    <ngt-mesh>
      <ngt-buffer-geometry>
        <ngt-float32-buffer-attribute
          *args="['position', positions, 3]"
          attach="attributes.position"
        />
      </ngt-buffer-geometry>
      <ngt-mesh-basic-material [wireframe]="true" color="white" />
    </ngt-mesh>
    @for (point of borderPoints(); track point) {
      <ngt-mesh
        [position]="point"
        [scale]="0.25"
      >
        <ngt-box-geometry />
        <ngt-mesh-standard-material [color]="color" />
      </ngt-mesh>
    }
    <ngt-mesh
      [position]="centerPoint()"
      [scale]="0.5"
    >
      <ngt-box-geometry />
      <ngt-mesh-standard-material [color]="color" />
    </ngt-mesh>
  `,
  imports: [NgtArgs],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CellComponent {
  borderPoints = input<THREE.Vector3[]>([]);
  centerPoint = input.required<THREE.Vector3>();
  color = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

  protected get positions() {
    return new Float32Array(this.borderPoints().flatMap(p => [p.x, p.y, p.z]));
  }
}
