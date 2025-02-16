import { Component, ElementRef, inject, OnInit, viewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Voronoi, Vertex, Cell, Edge, Diagram, SiteInput } from './voronoi/voronoi.gemeni';
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
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private diagram: Diagram | undefined; // Store the voronoi diagram
  private sites: SiteInput[] = []; // Store the sites

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
      
      window.addEventListener('resize', () => {
        this.updateSize();
        this.render2D(); // Re-render 2D on resize
      });
      this.renderer.setAnimationLoop(this.animate.bind(this));

      this.generateVoronoi();
      this.render2D(); // Add initial 2D render
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
    this.sites = Array.from({ length: 10 }, () => Random.vector2(-5, 5));
    this.diagram = voronoi.compute(this.sites, bbox);

    // Process each cell in the diagram
    this.diagram.cells.forEach((cell: Cell) => {
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
    
    // Update canvas size
    const canvas = this.canvas().nativeElement;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    this.render2D();
  }

  render2D() {
    const canvas = this.canvas();
    const ctx = canvas.nativeElement.getContext('2d');
    if (!ctx || !this.diagram) return;

    // Set canvas size to match container
    const container = canvas.nativeElement;
    canvas.nativeElement.width = container.clientWidth;
    canvas.nativeElement.height = container.clientHeight;

    // Calculate scale and translation to fit the diagram
    const scale = Math.min(container.width / 20, container.height / 20);
    const translateX = container.width / 2;
    const translateY = container.height / 2;

    // Clear background
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, container.width, container.height);
    
    // Transform coordinates - flip Y axis by negating scale.y
    ctx.save();
    ctx.translate(translateX, translateY);
    ctx.scale(scale, -scale); // Negating Y scale to flip the axis

    // Draw edges
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.5 / scale;
    this.diagram.edges.forEach((edge: Edge) => {
      if (!edge.va || !edge.vb) return;
      ctx.moveTo(edge.va.x, edge.va.y);
      ctx.lineTo(edge.vb.x, edge.vb.y);
    });
    ctx.stroke();

    // Draw debug lines from sites to vertices
    ctx.beginPath();
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 0.3 / scale;
    this.diagram.cells.forEach((cell: Cell) => {
      const site = cell.site;
      cell.halfedges.forEach(halfedge => {
        const vertex = halfedge.getStartpoint();
        if (vertex) {
          ctx.moveTo(site.x, site.y);
          ctx.lineTo(vertex.x, vertex.y);
        }
      });
    });
    ctx.stroke();

    // Draw vertices
    ctx.beginPath();
    ctx.fillStyle = 'red';
    this.diagram.vertices.forEach((v: Vertex) => {
      ctx.rect(v.x - 0.05, v.y - 0.05, 0.1, 0.1);
    });
    ctx.fill();

    // Draw sites
    ctx.beginPath();
    ctx.fillStyle = '#44f';
    this.sites.forEach(site => {
      ctx.rect(site.x - 0.05, site.y - 0.05, 0.1, 0.1);
    });
    ctx.fill();

    ctx.restore();
  }

  animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  toolbar = inject(ToolbarService);
}
