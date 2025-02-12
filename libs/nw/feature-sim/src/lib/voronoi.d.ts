declare module 'voronoi' {
  export interface Site {
    x: number;
    y: number;
    voronoiId?: number;
  }

  export interface BoundingBox {
    xl: number;  // x left
    xr: number;  // x right
    yt: number;  // y top
    yb: number;  // y bottom
  }

  export interface Vertex {
    x: number;
    y: number;
  }

  export interface Edge {
    lSite: Site;      // left site
    rSite: Site|null; // right site
    va: Vertex;       // start vertex
    vb: Vertex;       // end vertex
  }

  export interface Halfedge {
    site: Site;
    edge: Edge;
    getStartpoint(): Vertex;
    getEndpoint(): Vertex;
    angle: number;
  }

  export interface Cell {
    site: Site;
    halfedges: Halfedge[];
    closeMe: boolean;
    prepareHalfedges(): number;
    getNeighborIds(): number[];
    getBbox(): {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    pointIntersection(x: number, y: number): -1 | 0 | 1;
  }

  export interface VoronoiDiagram {
    cells: Cell[];
    edges: Edge[];
    vertices: Vertex[];
    execTime: number;
  }

  export default class Voronoi {
    constructor();
    
    // Core methods
    compute(sites: Site[], bbox: BoundingBox): VoronoiDiagram;
    recycle(diagram: VoronoiDiagram): void;
    
    // Helper methods
    quantizeSites(sites: Site[]): void;

    // Properties
    readonly ε: number;        // epsilon value
    readonly cells: Cell[];
    readonly edges: Edge[];
    readonly vertices: Vertex[];
    readonly beachline: any;   // Internal RB-tree, not typically needed by users
    readonly circleEvents: any; // Internal RB-tree, not typically needed by users
  }
}
