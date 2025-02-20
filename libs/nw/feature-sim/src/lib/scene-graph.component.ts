import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
//import { Mesh, BoxGeometry } from 'three';

import { injectStore, extend, NgtArgs } from 'angular-three';
import { OrbitControls } from 'three-stdlib';

import { CubeComponent } from './cube.component';

extend({
  OrbitControls,
});

@Component({
  template: `
    <ngt-orbit-controls *args="[camera(), glDomElement()]" />
    
    <ngt-ambient-light [intensity]="0.5" />
    <ngt-spot-light [position]="10" [intensity]="0.5 * Math.PI" [angle]="0.15" [penumbra]="1" [decay]="0" />
    <ngt-point-light [position]="-10" [intensity]="0.5 * Math.PI" [decay]="0" />

    <lib-cube [position]="[1.5, 0, 0]" />
    <lib-cube [position]="[-1.5, 0, 0]" />

    <ngt-mesh>
      <ngt-box-geometry />
      <ngt-mesh-standard-material />
    </ngt-mesh>
  `,
  imports: [NgtArgs, CubeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneGraphComponent {
  protected readonly Math = Math;

  private store = injectStore();
  protected camera = this.store.select('camera');
  protected glDomElement = this.store.select('gl', 'domElement');
}
