import { Component, ElementRef, inject, OnInit, viewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Voronoi, Vertex, Cell, Edge, Diagram, SiteInput } from './voronoi/voronoi.gemeni';
import { isPlatformBrowser } from '@angular/common';

enum VisualizationMode {
  All,
  None,
  GreenOnly,
  BlackOnly
}

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
  private visualizationMode = VisualizationMode.All;

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

      // Add click handler for canvas
      this.canvas().nativeElement.addEventListener('click', () => {
        this.visualizationMode = (this.visualizationMode + 1) % 4;
        this.render2D();
      });
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
    
    // Increase minimum distance between sites
    this.sites = [];
    const minDistance = 1.0; // Increased from 0.5
    
    while (this.sites.length < 10) {
      const newSite = Random.vector2(-4, 4); // Reduced range to ensure sites aren't too close to boundary
      let tooClose = false;
      
      // Check distance from bbox edges
      if (Math.abs(newSite.x - bbox.xl) < minDistance || 
          Math.abs(newSite.x - bbox.xr) < minDistance ||
          Math.abs(newSite.y - bbox.yt) < minDistance ||
          Math.abs(newSite.y - bbox.yb) < minDistance) {
        continue;
      }
      
      for (const site of this.sites) {
        const dx = site.x - newSite.x;
        const dy = site.y - newSite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        this.sites.push(newSite);
      }
    }

    try {
      this.diagram = voronoi.compute(this.sites, bbox);
      
      if (!this.diagram || !this.diagram.cells || this.diagram.cells.length !== this.sites.length) {
        console.error('Invalid diagram generated:', this.diagram);
        return;
      }

      // Verify each cell has its site and edges
      for (const cell of this.diagram.cells) {
        if (!cell.site) {
          console.error('Cell missing site:', cell);
          continue;
        }

        if (!cell.prepareHalfedges() || cell.halfedges.length < 3) {
          console.error('Cell has invalid edges:', cell);
          continue;
        }

        // Verify cell contains its site
        const bbox = cell.getBbox();
        if (!bbox) {
          console.error('Cell has no bbox:', cell);
          continue;
        }
      }

      // Clear existing meshes
      this.scene.clear();

      // Process each cell in the diagram
      this.diagram.cells.forEach((cell: Cell) => {
        if (!cell.site) return;
        
        cell.prepareHalfedges();
        
        // Get vertices ensuring we have a complete loop
        const cellVertices: Vertex[] = [];
        const halfedges = cell.halfedges;
        
        if (halfedges.length < 3) return;

        // Verify we have a complete loop by checking endpoints match
        let isComplete = true;
        for (let i = 0; i < halfedges.length; i++) {
          const current = halfedges[i];
          const next = halfedges[(i + 1) % halfedges.length];
          
          const endpoint = current.getEndpoint();
          const nextStart = next.getStartpoint();
          
          if (!endpoint || !nextStart || 
              endpoint.x !== nextStart.x || 
              endpoint.y !== nextStart.y) {
            isComplete = false;
            break;
          }
          
          cellVertices.push(current.getStartpoint()!);
        }

        if (!isComplete || cellVertices.length < 3) {
          console.warn('Incomplete cell found:', cell);
          return;
        }

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
    } catch (error) {
      console.error('Error generating Voronoi diagram:', error);
    }
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
    if (this.visualizationMode === VisualizationMode.All || 
        this.visualizationMode === VisualizationMode.BlackOnly) {
      ctx.beginPath();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5 / scale;
      this.diagram.edges.forEach((edge: Edge) => {
        if (!edge.va || !edge.vb) return;
        ctx.moveTo(edge.va.x, edge.va.y);
        ctx.lineTo(edge.vb.x, edge.vb.y);
      });
      ctx.stroke();
    }

    // Draw debug lines from sites to vertices
    if (this.visualizationMode === VisualizationMode.All || 
        this.visualizationMode === VisualizationMode.GreenOnly) {
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
    }

    // Draw cell indices and vertex order
    if (this.visualizationMode === VisualizationMode.All) {
      ctx.font = `${0.3 / scale}px Arial`;
      ctx.fillStyle = 'black';
      
      this.diagram.cells.forEach((cell: Cell, index: number) => {
        // Draw cell index
        ctx.fillText(`${index}`, cell.site.x, cell.site.y);
        
        // Draw vertex order
        cell.halfedges.forEach((halfedge, vIndex) => {
          const vertex = halfedge.getStartpoint();
          if (vertex) {
            ctx.fillText(`${vIndex}`, vertex.x, vertex.y);
          }
        });
      });
    }

    // Always draw vertices and sites
    ctx.beginPath();
    ctx.fillStyle = 'red';
    this.diagram.vertices.forEach((v: Vertex) => {
      ctx.rect(v.x - 0.05, v.y - 0.05, 0.1, 0.1);
    });
    ctx.fill();

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
