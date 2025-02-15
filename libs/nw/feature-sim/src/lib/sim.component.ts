import { Component, ElementRef, inject, OnInit, viewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Voronoi, Vertex } from './voronoi/voronoi.gemeni';
import { isPlatformBrowser } from '@angular/common';

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
  private platformId = inject(PLATFORM_ID);
  target = viewChild.required<ElementRef>('target');
  scene = new THREE.Scene();
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  customMesh!: THREE.Mesh;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.position.z = 5;
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'altitude',
      label: 'Sim',
      title: 'Sim',
      route: '/sim',
    });

    if (isPlatformBrowser(this.platformId)) {
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setPixelRatio(window.devicePixelRatio);
      
      const container = this.target().nativeElement;
      container.appendChild(this.renderer.domElement);
      this.updateSize();
      
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      
      window.addEventListener('resize', () => this.updateSize());
      this.renderer.setAnimationLoop(this.animate.bind(this));

      this.generateVoronoi();
    }
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

    // Process each cell in the diagram
    diagram.cells.forEach(cell => {
      if (!cell.site) return;
      
      cell.prepareHalfedges();
      const cellVertices: Vertex[] = [];
      cell.halfedges.forEach(halfedge => {
        const vertex = halfedge.getStartpoint();
        if (vertex) {
          cellVertices.push(vertex);
        }
      });

      if (cellVertices.length < 3) return;

      const vertices: number[] = [];
      const indices: number[] = [];
      
      // Add cell center
      vertices.push(cell.site.x, cell.site.y, 0);
      
      // Add boundary vertices
      cellVertices.forEach(vertex => {
        vertices.push(vertex.x, vertex.y, 0);
      });

      // Create triangles fan from center
      for (let i = 0; i < cellVertices.length; i++) {
        indices.push(
          0, // center is always first vertex
          i + 1,
          ((i + 1) % cellVertices.length) + 1
        );
      }

      // Create geometry for this cell
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
      
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        side: THREE.DoubleSide,
        wireframe: true
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);
    });
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
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  toolbar = inject(ToolbarService);
}
