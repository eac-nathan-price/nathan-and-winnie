import { Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import * as THREE from 'three';
import { Voronoi, Vertex } from './voronoi/voronoi.gemeni';

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
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  customMesh!: THREE.Mesh;

  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.position.z = 5;
    this.generateVoronoi();
  }

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
    
    const vertices: number[] = [];
    const indices: number[] = [];
    let vertexIndex = 0;

    // Process each cell in the diagram
    diagram.cells.forEach(cell => {
      if (!cell.site) return;
      
      // Ensure edges are properly ordered
      cell.prepareHalfedges();
      
      // Get ordered vertices around the cell
      const cellVertices: Vertex[] = [];
      cell.halfedges.forEach(halfedge => {
        const vertex = halfedge.getStartpoint();
        if (vertex) {
          cellVertices.push(vertex);
        }
      });

      if (cellVertices.length < 3) return;

      // Add cell center
      const centerX = cell.site.x;
      const centerY = cell.site.y;
      vertices.push(centerX, centerY, 0);
      const centerIndex = vertexIndex++;

      // Add all vertices of the cell boundary
      cellVertices.forEach(vertex => {
        vertices.push(vertex.x, vertex.y, 0);
        vertexIndex++;
      });

      // Create triangles fan from center to each edge
      for (let i = 0; i < cellVertices.length; i++) {
        indices.push(
          centerIndex,
          centerIndex + i + 1,
          centerIndex + ((i + 1) % cellVertices.length) + 1
        );
      }
    });

    // Create and set up geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
    
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      side: THREE.DoubleSide,
      wireframe: true
    });
    
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

    this.renderer.setPixelRatio(window.devicePixelRatio);
    
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
