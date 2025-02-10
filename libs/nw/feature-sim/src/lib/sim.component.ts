import { Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import * as THREE from 'three';

@Component({
  selector: 'lib-sim',
  imports: [CommonModule],
  templateUrl: './sim.component.html',
  styleUrl: './sim.component.scss',
})
export class SimComponent implements OnInit { 
  target = viewChild.required<ElementRef>('target');

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  geometry = new THREE.BoxGeometry( 1, 1, 1 );
  material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  cube = new THREE.Mesh( this.geometry, this.material );

  constructor() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene.add( this.cube );
    this.camera.position.z = 5;
  }

  toolbar = inject(ToolbarService);
  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'altitude',
      label: 'Sim',
      title: 'Sim',
      route: '/sim',
    });

    const container = this.target().nativeElement;
    container.appendChild(this.renderer.domElement);
    
    this.updateSize();
    
    window.addEventListener('resize', () => this.updateSize());
    
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  private updateSize() {
    const container = this.target().nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  }
}
