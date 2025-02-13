import { Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import * as THREE from 'three';
import { Voronoi } from './voronoi/voronoi';

class Random {
  static float(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  static int(min: number, max: number) {
    return Math.floor(Random.float(min, max));
  }
  
  static vector2(min: number, max: number) {
    return {
      x: Random.float(min, max),
      y: Random.float(min, max)
    };
  }

  static vector3(min: number, max: number) {
    return {
      x: Random.float(min, max),
      y: Random.float(min, max),
      z: Random.float(min, max)
    };
  }
}

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
  
  // Remove the cube-related properties and add custom mesh
  customMesh: THREE.Mesh;

  generateVoronoi() {
    const voronoi = new Voronoi();
    const bbox = {
      xl: -5,
      xr: 5,
      yt: -5,
      yb: 5
    };
    const sites = Array.from({ length: 10 }, () => Random.vector2(-5, 5));
    const diagram = voronoi.compute(sites, bbox);
    console.log(diagram);
  }
  

  constructor() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.position.z = 5;

    console.log('Generating voronoi');
    this.generateVoronoi();
    
    // Define unique vertices
    const vertices = new Float32Array([
      -1.0, -1.0, 0.0,  // vertex 0
       1.0, -1.0, 0.0,  // vertex 1
       0.0,  1.0, 0.0,  // vertex 2
       2.0,  1.0, 0.0   // vertex 3
    ]);

    // Define indices to form triangles
    const indices = new Uint16Array([
      0, 1, 2,  // first triangle
      2, 3, 1   // second triangle
    ]);

    // Create buffer geometry
    const geometry = new THREE.BufferGeometry();
    
    // Add vertices and indices
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    
    // Create material
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      side: THREE.DoubleSide,
      wireframe: true
    });
    
    // Create mesh and add to scene
    this.customMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.customMesh);
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
    // Update rotation of custom mesh instead of cube
    this.customMesh.rotation.x += 0.01;
    this.customMesh.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  }
}
