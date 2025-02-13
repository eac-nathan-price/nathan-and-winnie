/*!
Copyright (C) 2010-2013 Raymond Hill: https://github.com/gorhill/Javascript-Voronoi
MIT License: See https://github.com/gorhill/Javascript-Voronoi/LICENSE.md
*/
/*
Author: Raymond Hill (rhill@raymondhill.net)
Contributor: Jesse Morgan (morgajel@gmail.com)
File: rhill-voronoi-core.js
Version: 0.98
Date: January 21, 2013
Description: This is my personal Javascript implementation of
Steven Fortune's algorithm to compute Voronoi diagrams.

License: See https://github.com/gorhill/Javascript-Voronoi/LICENSE.md
Credits: See https://github.com/gorhill/Javascript-Voronoi/CREDITS.md
History: See https://github.com/gorhill/Javascript-Voronoi/CHANGELOG.md

## Usage:

  var sites = [{x:300,y:300}, {x:100,y:100}, {x:200,y:500}, {x:250,y:450}, {x:600,y:150}];
  // xl, xr means x left, x right
  // yt, yb means y top, y bottom
  var bbox = {xl:0, xr:800, yt:0, yb:600};
  var voronoi = new Voronoi();
  // pass an object which exhibits xl, xr, yt, yb properties. The bounding
  // box will be used to connect unbound edges, and to close open cells
  result = voronoi.compute(sites, bbox);
  // render, further analyze, etc.

Return value:
  An object with the following properties:

  result.vertices = an array of unordered, unique Voronoi.Vertex objects making
    up the Voronoi diagram.
  result.edges = an array of unordered, unique Voronoi.Edge objects making up
    the Voronoi diagram.
  result.cells = an array of Voronoi.Cell object making up the Voronoi diagram.
    A Cell object might have an empty array of halfedges, meaning no Voronoi
    cell could be computed for a particular cell.
  result.execTime = the time it took to compute the Voronoi diagram, in
    milliseconds.

Voronoi.Vertex object:
  x: The x position of the vertex.
  y: The y position of the vertex.

Voronoi.Edge object:
  lSite: the Voronoi site object at the left of this Voronoi.Edge object.
  rSite: the Voronoi site object at the right of this Voronoi.Edge object (can
    be null).
  va: an object with an 'x' and a 'y' property defining the start point
    (relative to the Voronoi site on the left) of this Voronoi.Edge object.
  vb: an object with an 'x' and a 'y' property defining the end point
    (relative to Voronoi site on the left) of this Voronoi.Edge object.

  For edges which are used to close open cells (using the supplied bounding
  box), the rSite property will be null.

Voronoi.Cell object:
  site: the Voronoi site object associated with the Voronoi cell.
  halfedges: an array of Voronoi.Halfedge objects, ordered counterclockwise,
    defining the polygon for this Voronoi cell.

Voronoi.Halfedge object:
  site: the Voronoi site object owning this Voronoi.Halfedge object.
  edge: a reference to the unique Voronoi.Edge object underlying this
    Voronoi.Halfedge object.
  getStartpoint(): a method returning an object with an 'x' and a 'y' property
    for the start point of this halfedge. Keep in mind halfedges are always
    countercockwise.
  getEndpoint(): a method returning an object with an 'x' and a 'y' property
    for the end point of this halfedge. Keep in mind halfedges are always
    countercockwise.

TODO: Identify opportunities for performance improvement.

TODO: Let the user close the Voronoi cells, do not do it automatically. Not only let
      him close the cells, but also allow him to close more than once using a different
      bounding box for the same Voronoi diagram.
*/

/*global Math */

// ---------------------------------------------------------------------------

// Types and interfaces
interface ISite {
  x: number;
  y: number;
  voronoiId?: number;
}

interface IBoundingBox {
  xl: number;
  xr: number;
  yt: number;
  yb: number;
}

interface ICircleEvent {
  arc: RBNode;
  rbLeft: RBNode | null;
  rbNext: RBNode | null;
  rbParent: RBNode | null;
  rbPrevious: RBNode | null;
  rbRed: boolean;
  rbRight: RBNode | null;
  site: ISite | null;
  x: number;
  y: number;
  ycenter: number;
}

interface IDiagram {
  cells: Cell[];
  edges: Edge[];
  vertices: Vertex[];
  execTime?: number;
}

// Add these class definitions after the interfaces

class RBNode {
  rbLeft: RBNode | null = null;
  rbRight: RBNode | null = null;
  rbParent: RBNode | null = null;
  rbPrevious: RBNode | null = null;
  rbNext: RBNode | null = null;
  rbRed = false;
  site: ISite | null = null;
  edge: Edge | null = null;
  circleEvent: ICircleEvent | null = null;

  constructor(site?: ISite) {
    if (site) {
      this.site = site;
    }
  }
}

class RBTree {
  root: RBNode | null = null;

  rbInsertSuccessor(node: RBNode | null, successor: RBNode): void {
    let parent: RBNode | null = null;
    let workingNode: RBNode | null = node;

    if (workingNode) {
      successor.rbPrevious = workingNode;
      successor.rbNext = workingNode.rbNext;
      if (workingNode.rbNext) {
        workingNode.rbNext.rbPrevious = successor;
      }
      workingNode.rbNext = successor;

      if (workingNode.rbRight) {
        workingNode = workingNode.rbRight;
        while (workingNode.rbLeft) {
          workingNode = workingNode.rbLeft;
        }
        workingNode.rbLeft = successor;
      } else {
        workingNode.rbRight = successor;
      }
      parent = workingNode;
    } else if (this.root) {
      workingNode = this.getFirst(this.root);
      successor.rbPrevious = null;
      successor.rbNext = workingNode;
      workingNode.rbPrevious = successor;
      workingNode.rbLeft = successor;
      parent = workingNode;
    } else {
      successor.rbPrevious = successor.rbNext = null;
      this.root = successor;
      parent = null;
    }

    successor.rbLeft = successor.rbRight = null;
    successor.rbParent = parent;
    successor.rbRed = true;

    // Fix RB tree properties
    let grandpa: RBNode | null;
    let uncle: RBNode | null;
    workingNode = successor;
    while (parent && parent.rbRed) {
      grandpa = parent.rbParent;
      if (!grandpa) break;

      if (parent === grandpa.rbLeft) {
        uncle = grandpa.rbRight;
        if (uncle && uncle.rbRed) {
          parent.rbRed = uncle.rbRed = false;
          grandpa.rbRed = true;
          workingNode = grandpa;
        } else {
          if (workingNode === parent.rbRight) {
            this.rbRotateLeft(parent);
            workingNode = parent;
            parent = workingNode.rbParent;
          }
          if (!parent) break;
          parent.rbRed = false;
          if (!grandpa) break;
          grandpa.rbRed = true;
          this.rbRotateRight(grandpa);
        }
      } else {
        uncle = grandpa.rbLeft;
        if (uncle && uncle.rbRed) {
          parent.rbRed = uncle.rbRed = false;
          grandpa.rbRed = true;
          workingNode = grandpa;
        } else {
          if (workingNode === parent.rbLeft) {
            this.rbRotateRight(parent);
            workingNode = parent;
            parent = workingNode.rbParent;
          }
          if (!parent) break;
          parent.rbRed = false;
          if (!grandpa) break;
          grandpa.rbRed = true;
          this.rbRotateLeft(grandpa);
        }
      }
      parent = workingNode.rbParent;
    }
    if (this.root) {
      this.root.rbRed = false;
    }
  }

  rbRemoveNode(node: RBNode): void {
    // Handle linked list
    if (node.rbNext) {
      node.rbNext.rbPrevious = node.rbPrevious;
    }
    if (node.rbPrevious) {
      node.rbPrevious.rbNext = node.rbNext;
    }
    node.rbNext = node.rbPrevious = null;

    // Handle tree structure
    let parent = node.rbParent;
    const left = node.rbLeft;
    const right = node.rbRight;
    let next: RBNode | null;

    if (!left) {
      next = right;
    } else if (!right) {
      next = left;
    } else {
      next = this.getFirst(right);
    }

    if (!next) {
      if (parent) {
        if (parent.rbLeft === node) {
          parent.rbLeft = null;
        } else {
          parent.rbRight = null;
        }
      } else {
        this.root = null;
      }
      return;
    }

    let isRed: boolean;
    let workingNode: RBNode = node;
    
    if (left && right) {
      if (!next) return;  // Early return if no next node
      isRed = next.rbRed;
      next.rbRed = node.rbRed;
      next.rbLeft = left;
      left.rbParent = next;
      if (next !== right) {
        parent = next.rbParent;
        if (parent && next.rbRight) {
          next.rbParent = node.rbParent;
          node = next.rbRight;
          parent.rbLeft = node;
          next.rbRight = right;
          right.rbParent = next;
        }
      } else {
        next.rbParent = parent;
        parent = next;
        if (next.rbRight) {
          node = next.rbRight;
        }
      }
    } else {
      isRed = node.rbRed;
      workingNode = next || node;
    }

    if (!workingNode) return;  // Early return if no working node
    workingNode.rbParent = parent;

    if (isRed) return;
    if (workingNode && workingNode.rbRed) {
      workingNode.rbRed = false;
      return;
    }

    let sibling: RBNode | null;
    do {
      if (!workingNode || workingNode === this.root) break;
      if (!parent) break;

      if (workingNode === parent.rbLeft) {
        sibling = parent.rbRight;
        if (sibling && sibling.rbRed) {
          sibling.rbRed = false;
          parent.rbRed = true;
          this.rbRotateLeft(parent);
          sibling = parent.rbRight;
        }
        if (sibling && ((sibling.rbLeft && sibling.rbLeft.rbRed) || 
            (sibling.rbRight && sibling.rbRight.rbRed))) {
          if (!sibling.rbRight || !sibling.rbRight.rbRed) {
            if (sibling.rbLeft) sibling.rbLeft.rbRed = false;
            sibling.rbRed = true;
            this.rbRotateRight(sibling);
            sibling = parent.rbRight;
          }
          if (sibling) {
            sibling.rbRed = parent.rbRed;
            if (sibling.rbRight) sibling.rbRight.rbRed = false;
          }
          parent.rbRed = false;
          this.rbRotateLeft(parent);
          workingNode = this.root;
          break;
        }
      } else {
        // Symmetric case
        sibling = parent.rbLeft;
        if (sibling && sibling.rbRed) {
          sibling.rbRed = false;
          parent.rbRed = true;
          this.rbRotateRight(parent);
          sibling = parent.rbLeft;
        }
        if (sibling && ((sibling.rbLeft && sibling.rbLeft.rbRed) ||
            (sibling.rbRight && sibling.rbRight.rbRed))) {
          if (!sibling.rbLeft || !sibling.rbLeft.rbRed) {
            if (sibling.rbRight) sibling.rbRight.rbRed = false;
            sibling.rbRed = true;
            this.rbRotateLeft(sibling);
            sibling = parent.rbLeft;
          }
          if (sibling) {
            sibling.rbRed = parent.rbRed;
            if (sibling.rbLeft) sibling.rbLeft.rbRed = false;
          }
          parent.rbRed = false;
          this.rbRotateRight(parent);
          workingNode = this.root;
          break;
        }
      }
      if (sibling) sibling.rbRed = true;
      workingNode = parent;
      parent = parent.rbParent;
    } while (!workingNode?.rbRed);

    if (workingNode) workingNode.rbRed = false;
  }

  private rbRotateLeft(node: RBNode): void {
    const p = node;
    const q = node.rbRight;
    if (!q) return; // Early return if no right child
    const parent = p.rbParent;

    if (parent) {
      if (parent.rbLeft === p) {
        parent.rbLeft = q;
      } else {
        parent.rbRight = q;
      }
    } else {
      this.root = q;
    }

    q.rbParent = parent;
    p.rbParent = q;
    p.rbRight = q.rbLeft;
    if (p.rbRight) {
      p.rbRight.rbParent = p;
    }
    q.rbLeft = p;
  }

  private rbRotateRight(node: RBNode): void {
    const p = node;
    const q = node.rbLeft;
    if (!q) return; // Early return if no left child
    const parent = p.rbParent;

    if (parent) {
      if (parent.rbLeft === p) {
        parent.rbLeft = q;
      } else {
        parent.rbRight = q;
      }
    } else {
      this.root = q;
    }

    q.rbParent = parent;
    p.rbParent = q;
    p.rbLeft = q.rbRight;
    if (p.rbLeft) {
      p.rbLeft.rbParent = p;
    }
    q.rbRight = p;
  }

  getFirst(node: RBNode): RBNode {
    while (node.rbLeft) {
      node = node.rbLeft;
    }
    return node;
  }

  getLast(node: RBNode): RBNode {
    while (node.rbRight) {
      node = node.rbRight;
    }
    return node;
  }
}

// Add these classes after RBTree and before Voronoi class

class Vertex {
  constructor(
    public x: number,
    public y: number
  ) {}
}

class Edge {
  va: Vertex | null = null;
  vb: Vertex | null = null;

  constructor(
    public lSite: ISite | null,
    public rSite: ISite | null
  ) {}
}

class Halfedge {
  angle: number;

  constructor(
    public edge: Edge,
    public site: ISite,
    rSite: ISite | null
  ) {
    if (rSite) {
      this.angle = Math.atan2(rSite.y - site.y, rSite.x - site.x);
    } else {
      const va = edge.va;
      const vb = edge.vb;
      if (!va || !vb) {
        throw new Error("Edge vertices missing");
      }
      this.angle = edge.lSite === site
        ? Math.atan2(vb.x - va.x, va.y - vb.y)
        : Math.atan2(va.x - vb.x, vb.y - va.y);
    }
  }

  getStartpoint(): Vertex {
    const vertex = this.edge.lSite === this.site ? this.edge.va : this.edge.vb;
    if (!vertex) throw new Error("Missing vertex in getStartpoint");
    return vertex;
  }

  getEndpoint(): Vertex {
    const vertex = this.edge.lSite === this.site ? this.edge.vb : this.edge.va;
    if (!vertex) throw new Error("Missing vertex in getEndpoint");
    return vertex;
  }
}

class Cell {
  halfedges: Halfedge[] = [];
  closeMe = false;

  constructor(public site: ISite) {}

  init(site: ISite): Cell {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
    return this;
  }

  prepareHalfedges(): number {
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let edge;

    // Get rid of unused halfedges
    while (iHalfedge--) {
      edge = halfedges[iHalfedge].edge;
      if (!edge.vb || !edge.va) {
        halfedges.splice(iHalfedge, 1);
      }
    }

    // Sort them counterclockwise
    halfedges.sort((a, b) => b.angle - a.angle);
    return halfedges.length;
  }

  getNeighborIds(): number[] {
    const neighbors: number[] = [];
    let iHalfedge = this.halfedges.length;
    let edge;

    while (iHalfedge--) {
      edge = this.halfedges[iHalfedge].edge;
      if (edge.lSite?.voronoiId !== undefined && edge.lSite.voronoiId !== this.site.voronoiId) {
        neighbors.push(edge.lSite.voronoiId);
      } else if (edge.rSite?.voronoiId !== undefined && edge.rSite.voronoiId !== this.site.voronoiId) {
        neighbors.push(edge.rSite.voronoiId);
      }
    }
    return neighbors;
  }

  getBbox(): { x: number; y: number; width: number; height: number } {
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let xmin = Infinity;
    let ymin = Infinity;
    let xmax = -Infinity;
    let ymax = -Infinity;
    let v: Vertex;
    let vx: number;
    let vy: number;

    while (iHalfedge--) {
      v = halfedges[iHalfedge].getStartpoint();
      vx = v.x;
      vy = v.y;
      if (vx < xmin) xmin = vx;
      if (vy < ymin) ymin = vy;
      if (vx > xmax) xmax = vx;
      if (vy > ymax) ymax = vy;
    }

    return {
      x: xmin,
      y: ymin,
      width: xmax - xmin,
      height: ymax - ymin
    };
  }

  pointIntersection(x: number, y: number): -1 | 0 | 1 {
    // Check if point in polygon. Since all polygons of a Voronoi
    // diagram are convex, we can use a simple test
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let halfedge;
    let p0: Vertex;
    let p1: Vertex;
    let r: number;

    while (iHalfedge--) {
      halfedge = halfedges[iHalfedge];
      p0 = halfedge.getStartpoint();
      p1 = halfedge.getEndpoint();
      r = (y - p0.y) * (p1.x - p0.x) - (x - p0.x) * (p1.y - p0.y);
      if (!r) {
        return 0; // point is on the perimeter
      }
      if (r > 0) {
        return -1; // point is outside
      }
    }
    return 1; // point is inside
  }
}

// Main Voronoi class
class Voronoi {
  private vertices: Vertex[] = [];
  private edges: Edge[] = [];
  private cells: Cell[] = [];
  private beachline: RBTree;
  private circleEvents: RBTree;
  private firstCircleEvent: ICircleEvent | null = null;
  private toRecycle: IDiagram | null = null;

  private beachsectionJunkyard: any[] = [];
  private circleEventJunkyard: ICircleEvent[] = [];
  private vertexJunkyard: Vertex[] = [];
  private edgeJunkyard: Edge[] = [];
  private cellJunkyard: Cell[] = [];

  private readonly ε = 1e-9;
  private readonly invε = 1.0 / this.ε;

  constructor() {
    this.beachline = new RBTree();
    this.circleEvents = new RBTree();
  }

  // Helper methods
  private equalWithEpsilon(a: number, b: number): boolean {
    return Math.abs(a - b) < 1e-9;
  }

  private greaterThanWithEpsilon(a: number, b: number): boolean {
    return a - b > 1e-9;
  }

  private greaterThanOrEqualWithEpsilon(a: number, b: number): boolean {
    return b - a < 1e-9;
  }

  private lessThanWithEpsilon(a: number, b: number): boolean {
    return b - a > 1e-9;
  }

  private lessThanOrEqualWithEpsilon(a: number, b: number): boolean {
    return a - b < 1e-9;
  }

  // Main computation method
  public compute(sites: ISite[], bbox: IBoundingBox): IDiagram {
    const startTime = new Date();
    this.reset();

    // Initialize site event queue
    const siteEvents = [...sites].sort((a, b) => {
      const r = b.y - a.y;
      return r || b.x - a.x;
    });

    // Process queue
    let siteid = 0;
    let site = siteEvents.pop();
    let xsitex: number | undefined;
    let xsitey: number | undefined;

    // Main loop
    while (true) {
      const circle = this.firstCircleEvent;

      if (site && (!circle || site.y < circle.y || (site.y === circle.y && site.x < circle.x))) {
        if (site.x !== xsitex || site.y !== xsitey) {
          this.cells[siteid] = this.createCell(site);
          site.voronoiId = siteid++;
          this.addBeachsection(site);
          xsitey = site.y;
          xsitex = site.x;
        }
        site = siteEvents.pop();
      } else if (circle) {
        this.removeBeachsection(circle.arc);
      } else {
        break;
      }
    }

    this.clipEdges(bbox);
    this.closeCells(bbox);

    const stopTime = new Date();

    const diagram: IDiagram = {
      cells: this.cells,
      edges: this.edges,
      vertices: this.vertices,
      execTime: stopTime.getTime() - startTime.getTime()
    };

    this.reset();
    return diagram;
  }

  private createCell(site: ISite): Cell {
    const cell = this.cellJunkyard.pop();
    if (cell) {
      return cell.init(site);
    }
    return new Cell(site);
  }

  private createVertex(x: number, y: number): Vertex {
    const vertex = this.vertexJunkyard.pop();
    if (vertex) {
      vertex.x = x;
      vertex.y = y;
      return vertex;
    }
    return new Vertex(x, y);
  }

  private createEdge(lSite: ISite | null, rSite: ISite | null, va?: Vertex, vb?: Vertex): Edge {
    const edge = this.edgeJunkyard.pop() || new Edge(lSite, rSite);
    edge.lSite = lSite;
    edge.rSite = rSite;
    edge.va = edge.vb = null;

    this.edges.push(edge);
    if (va) {
      this.setEdgeStartpoint(edge, lSite, rSite, va);
    }
    if (vb) {
      this.setEdgeEndpoint(edge, lSite, rSite, vb);
    }

    if (lSite?.voronoiId !== undefined && rSite?.voronoiId !== undefined) {
      this.cells[lSite.voronoiId].halfedges.push(this.createHalfedge(edge, lSite, rSite));
      this.cells[rSite.voronoiId].halfedges.push(this.createHalfedge(edge, rSite, lSite));
    }
    return edge;
  }

  private createBorderEdge(lSite: ISite, va: Vertex, vb: Vertex): Edge {
    const edge = this.edgeJunkyard.pop() || new Edge(lSite, null);
    edge.lSite = lSite;
    edge.rSite = null;
    edge.va = va;
    edge.vb = vb;
    this.edges.push(edge);
    return edge;
  }

  private createHalfedge(edge: Edge, lSite: ISite, rSite: ISite | null): Halfedge {
    return new Halfedge(edge, lSite, rSite);
  }

  private reset(): void {
    if (!this.beachline) {
      this.beachline = new RBTree();
    }
    // Move leftover beachsections to the beachsection junkyard
    if (this.beachline.root) {
      let beachsection = this.beachline.getFirst(this.beachline.root);
      while (beachsection) {
        this.beachsectionJunkyard.push(beachsection); // mark for reuse
        beachsection = beachsection.rbNext;
      }
    }
    this.beachline.root = null;

    if (!this.circleEvents) {
      this.circleEvents = new RBTree();
    }
    this.circleEvents.root = this.firstCircleEvent = null;
    this.vertices = [];
    this.edges = [];
    this.cells = [];
  }

  // Beach line methods
  private leftBreakPoint(arc: RBNode, directrix: number): number {
    const site = arc.site!;
    const rfocx = site.x;
    const rfocy = site.y;
    const pby2 = rfocy - directrix;

    // Parabola in degenerate case where focus is on directrix
    if (!pby2) {
      return rfocx;
    }

    const lArc = arc.rbPrevious;
    if (!lArc) {
      return -Infinity;
    }

    const site2 = lArc.site!;
    const lfocx = site2.x;
    const lfocy = site2.y;
    const plby2 = lfocy - directrix;

    // Parabola in degenerate case where focus is on directrix
    if (!plby2) {
      return lfocx;
    }

    const hl = lfocx - rfocx;
    const aby2 = 1/pby2 - 1/plby2;
    const b = hl/plby2;

    if (aby2) {
      return (-b + Math.sqrt(b*b - 2*aby2*(hl*hl/(-2*plby2) - lfocy + plby2/2 + rfocy - pby2/2)))/aby2 + rfocx;
    }

    // Both parabolas have same distance to directrix, thus break point is midway
    return (rfocx + lfocx)/2;
  }

  private rightBreakPoint(arc: RBNode, directrix: number): number {
    const rArc = arc.rbNext;
    if (rArc) {
      return this.leftBreakPoint(rArc, directrix);
    }
    const site = arc.site!;
    return site.y === directrix ? site.x : Infinity;
  }

  private detachBeachsection(beachsection: RBNode): void {
    this.detachCircleEvent(beachsection); // detach potentially attached circle event
    this.beachline.rbRemoveNode(beachsection); // remove from RB-tree
    this.beachsectionJunkyard.push(beachsection); // mark for reuse
  }

  // Circle event methods
  private attachCircleEvent(arc: RBNode): void {
    const lArc = arc.rbPrevious;
    const rArc = arc.rbNext;
    if (!lArc || !rArc) return;

    const lSite = lArc.site!;
    const cSite = arc.site!;
    const rSite = rArc.site!;

    // If site of left beachsection is same as site of
    // right beachsection, there can't be convergence
    if (lSite === rSite) return;

    // Find the circumscribed circle
    const bx = cSite.x;
    const by = cSite.y;
    const ax = lSite.x - bx;
    const ay = lSite.y - by;
    const cx = rSite.x - bx;
    const cy = rSite.y - by;

    const d = 2 * (ax * cy - ay * cx);
    if (d >= -2e-12) return;

    const ha = ax * ax + ay * ay;
    const hc = cx * cx + cy * cy;
    const x = (cy * ha - ay * hc) / d;
    const y = (ax * hc - cx * ha) / d;
    const ycenter = y + by;

    const circleEvent = this.circleEventJunkyard.pop() || {
      arc: null,
      rbLeft: null,
      rbNext: null,
      rbParent: null,
      rbPrevious: null,
      rbRed: false,
      rbRight: null,
      site: null,
      x: 0,
      y: 0,
      ycenter: 0
    };

    circleEvent.arc = arc;
    circleEvent.site = cSite;
    circleEvent.x = x + bx;
    circleEvent.y = ycenter + Math.sqrt(x * x + y * y); // y bottom
    circleEvent.ycenter = ycenter;
    arc.circleEvent = circleEvent;

    // Insert circle event in RB-tree
    let predecessor = null;
    let node = this.circleEvents.root;
    while (node) {
      if (circleEvent.y < node.y || (circleEvent.y === node.y && circleEvent.x <= node.x)) {
        if (node.rbLeft) {
          node = node.rbLeft;
        } else {
          predecessor = node.rbPrevious;
          break;
        }
      } else {
        if (node.rbRight) {
          node = node.rbRight;
        } else {
          predecessor = node;
          break;
        }
      }
    }

    this.circleEvents.rbInsertSuccessor(predecessor, circleEvent);
    if (!predecessor) {
      this.firstCircleEvent = circleEvent;
    }
  }

  private detachCircleEvent(arc: RBNode): void {
    const circle = arc.circleEvent;
    if (circle) {
      if (!circle.rbPrevious) {
        this.firstCircleEvent = circle.rbNext;
      }
      this.circleEvents.rbRemoveNode(circle);
      this.circleEventJunkyard.push(circle);
      arc.circleEvent = null;
    }
  }

  // Add these methods to the Voronoi class

  private connectEdge(edge: Edge, bbox: IBoundingBox): boolean {
    // Skip if end point already connected
    const vb = edge.vb;
    if (vb) return true;

    const va = edge.va;
    const xl = bbox.xl;
    const xr = bbox.xr;
    const yt = bbox.yt;
    const yb = bbox.yb;
    const lSite = edge.lSite!;
    const rSite = edge.rSite!;
    const lx = lSite.x;
    const ly = lSite.y;
    const rx = rSite.x;
    const ry = rSite.y;
    const fx = (lx + rx) / 2;
    const fy = (ly + ry) / 2;
    let fm: number;
    let fb: number;

    // Cells that use this edge will need to be closed
    this.cells[lSite.voronoiId!].closeMe = true;
    this.cells[rSite.voronoiId!].closeMe = true;

    // Get the line equation of the bisector if line is not vertical
    if (ry !== ly) {
      fm = (lx - rx) / (ry - ly);
      fb = fy - fm * fx;
    }

    // Special case: vertical line
    if (fm === undefined) {
      // Doesn't intersect with viewport
      if (fx < xl || fx >= xr) return false;
      // Downward
      if (lx > rx) {
        if (!va || va.y < yt) {
          va = this.createVertex(fx, yt);
        } else if (va.y >= yb) {
          return false;
        }
        edge.va = va;
        edge.vb = this.createVertex(fx, yb);
      }
      // Upward
      else {
        if (!va || va.y > yb) {
          va = this.createVertex(fx, yb);
        } else if (va.y < yt) {
          return false;
        }
        edge.va = va;
        edge.vb = this.createVertex(fx, yt);
      }
    }
    // Closer to vertical than horizontal, connect start point to the
    // top or bottom side of the bounding box
    else if (fm < -1 || fm > 1) {
      // Downward
      if (lx > rx) {
        if (!va || va.y < yt) {
          va = this.createVertex((yt - fb) / fm, yt);
        } else if (va.y >= yb) {
          return false;
        }
        edge.va = va;
        edge.vb = this.createVertex((yb - fb) / fm, yb);
      }
      // Upward
      else {
        if (!va || va.y > yb) {
          va = this.createVertex((yb - fb) / fm, yb);
        } else if (va.y < yt) {
          return false;
        }
        edge.va = va;
        edge.vb = this.createVertex((yt - fb) / fm, yt);
      }
    }
    // Closer to horizontal than vertical, connect start point to the
    // left or right side of the bounding box
    else {
      // Rightward
      if (ly < ry) {
        if (!va || va.x < xl) {
          va = this.createVertex(xl, fm * xl + fb);
        } else if (va.x >= xr) {
          return false;
        }
        edge.va = va;
        edge.vb = this.createVertex(xr, fm * xr + fb);
      }
      // Leftward
      else {
        if (!va || va.x > xr) {
          va = this.createVertex(xr, fm * xr + fb);
        } else if (va.x < xl) {
          return false;
        }
        edge.va = va;
        edge.vb = this.createVertex(xl, fm * xl + fb);
      }
    }

    return true;
  }

  private clipEdge(edge: Edge, bbox: IBoundingBox): boolean {
    const ax = edge.va!.x;
    const ay = edge.va!.y;
    const bx = edge.vb!.x;
    const by = edge.vb!.y;
    let t0 = 0;
    let t1 = 1;
    const dx = bx - ax;
    const dy = by - ay;

    // Left
    const q = ax - bbox.xl;
    if (dx === 0 && q < 0) return false;
    const r = -q / dx;
    if (dx < 0) {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    } else if (dx > 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    }

    // Right
    const q2 = bbox.xr - ax;
    if (dx === 0 && q2 < 0) return false;
    const r2 = q2 / dx;
    if (dx < 0) {
      if (r2 > t1) return false;
      if (r2 > t0) t0 = r2;
    } else if (dx > 0) {
      if (r2 < t0) return false;
      if (r2 < t1) t1 = r2;
    }

    // Top
    const q3 = ay - bbox.yt;
    if (dy === 0 && q3 < 0) return false;
    const r3 = -q3 / dy;
    if (dy < 0) {
      if (r3 < t0) return false;
      if (r3 < t1) t1 = r3;
    } else if (dy > 0) {
      if (r3 > t1) return false;
      if (r3 > t0) t0 = r3;
    }

    // Bottom
    const q4 = bbox.yb - ay;
    if (dy === 0 && q4 < 0) return false;
    const r4 = q4 / dy;
    if (dy < 0) {
      if (r4 > t1) return false;
      if (r4 > t0) t0 = r4;
    } else if (dy > 0) {
      if (r4 < t0) return false;
      if (r4 < t1) t1 = r4;
    }

    // If we reach here, Voronoi edge is within bbox
    // Update edge's endpoints
    if (t0 > 0) {
      edge.va = this.createVertex(ax + t0 * dx, ay + t0 * dy);
    }
    if (t1 < 1) {
      edge.vb = this.createVertex(ax + t1 * dx, ay + t1 * dy);
    }

    // Edge was clipped, need to close cells
    if (t0 > 0 || t1 < 1) {
      this.cells[edge.lSite!.voronoiId!].closeMe = true;
      this.cells[edge.rSite!.voronoiId!].closeMe = true;
    }

    return true;
  }

  private clipEdges(bbox: IBoundingBox): void {
    // Connect all dangling edges to bounding box
    // or get rid of them if it can't be done
    let iEdge = this.edges.length;
    let edge: Edge;

    // Iterate backward so we can splice safely
    while (iEdge--) {
      edge = this.edges[iEdge];
      // Edge is removed if:
      // - it's wholly outside the bounding box
      // - it's looking more like a point than a line
      if (!this.connectEdge(edge, bbox) ||
          !this.clipEdge(edge, bbox) ||
          (Math.abs(edge.va!.x - edge.vb!.x) < 1e-9 && 
           Math.abs(edge.va!.y - edge.vb!.y) < 1e-9)) {
        edge.va = edge.vb = null;
        this.edges.splice(iEdge, 1);
      }
    }
  }

  private closeCells(bbox: IBoundingBox): void {
    const xl = bbox.xl;
    const xr = bbox.xr;
    const yt = bbox.yt;
    const yb = bbox.yb;
    let iCell = this.cells.length;
    let cell: Cell;
    let iLeft: number;
    let halfedges: Halfedge[];
    let nHalfedges: number;
    let edge: Edge;
    let va: Vertex;
    let vb: Vertex;
    let vz: Vertex;
    let lastBorderSegment: boolean;

    while (iCell--) {
      cell = this.cells[iCell];
      // Skip if cell is already properly closed
      if (!cell.prepareHalfedges()) continue;
      if (!cell.closeMe) continue;

      // Find first 'unclosed' point
      halfedges = cell.halfedges;
      nHalfedges = halfedges.length;
      iLeft = 0;

      while (iLeft < nHalfedges) {
        va = halfedges[iLeft].getEndpoint();
        vz = halfedges[(iLeft + 1) % nHalfedges].getStartpoint();

        // If end point is not equal to start point, we need to add missing halfedges
        if (Math.abs(va.x - vz.x) >= 1e-9 || Math.abs(va.y - vz.y) >= 1e-9) {
          // Find entry point
          switch (true) {
            // Walk downward along left side
            case this.equalWithEpsilon(va.x, xl) && this.lessThanWithEpsilon(va.y, yb):
              lastBorderSegment = this.equalWithEpsilon(vz.x, xl);
              vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) break;
              va = vb;
              // Fall through

            // Walk rightward along bottom side
            case this.equalWithEpsilon(va.y, yb) && this.lessThanWithEpsilon(va.x, xr):
              lastBorderSegment = this.equalWithEpsilon(vz.y, yb);
              vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) break;
              va = vb;
              // Fall through

            // Walk upward along right side
            case this.equalWithEpsilon(va.x, xr) && this.greaterThanWithEpsilon(va.y, yt):
              lastBorderSegment = this.equalWithEpsilon(vz.x, xr);
              vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) break;
              va = vb;
              // Fall through

            // Walk leftward along top side
            case this.equalWithEpsilon(va.y, yt) && this.greaterThanWithEpsilon(va.x, xl):
              lastBorderSegment = this.equalWithEpsilon(vz.y, yt);
              vb = this.createVertex(lastBorderSegment ? vz.x : xl, yt);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) break;
              va = vb;
              // Fall through to next case

            default:
              throw new Error("Voronoi.closeCells() > this makes no sense!");
          }
        }
        iLeft++;
      }
      cell.closeMe = false;
    }
  }

  // Helper method for recycling diagrams
  public recycle(diagram: IDiagram): void {
    if (diagram) {
      this.toRecycle = diagram;
      this.vertexJunkyard = this.vertexJunkyard.concat(diagram.vertices);
      this.edgeJunkyard = this.edgeJunkyard.concat(diagram.edges);
      this.cellJunkyard = this.cellJunkyard.concat(diagram.cells);
    }
  }

  // Helper method for quantizing sites
  public quantizeSites(sites: ISite[]): void {
    const ε = this.ε;
    let n = sites.length;
    while (n--) {
      const site = sites[n];
      site.x = Math.floor(site.x / ε) * ε;
      site.y = Math.floor(site.y / ε) * ε;
    }
  }

  private setEdgeStartpoint(edge: Edge, lSite: ISite | null, rSite: ISite | null, vertex: Vertex): void {
    if (!edge.va && !edge.vb) {
      edge.va = vertex;
      edge.lSite = lSite;
      edge.rSite = rSite;
    } else if (edge.lSite === rSite) {
      edge.vb = vertex;
    } else {
      edge.va = vertex;
    }
  }

  private setEdgeEndpoint(edge: Edge, lSite: ISite | null, rSite: ISite | null, vertex: Vertex): void {
    this.setEdgeStartpoint(edge, rSite, lSite, vertex);
  }

  private addBeachsection(site: ISite): void {
    const x = site.x;
    const directrix = site.y;

    // Find the left and right beach sections which will surround the newly created beach section
    let lArc: RBNode | null = null;
    let rArc: RBNode | null = null;
    let node = this.beachline.root;

    while (node) {
      const dxl = this.leftBreakPoint(node, directrix) - x;
      if (dxl > 1e-9) {
        node = node.rbLeft;
      } else {
        const dxr = x - this.rightBreakPoint(node, directrix);
        if (dxr > 1e-9) {
          if (!node.rbRight) {
            lArc = node;
            break;
          }
          node = node.rbRight;
        } else {
          if (dxl > -1e-9) {
            lArc = node.rbPrevious;
            rArc = node;
          } else if (dxr > -1e-9) {
            lArc = node;
            rArc = node.rbNext;
          } else {
            lArc = rArc = node;
          }
          break;
        }
      }
    }

    // Create new beach section
    const newArc = this.createBeachsection(site);
    this.beachline.rbInsertSuccessor(lArc, newArc);

    // Handle different cases
    if (!lArc && !rArc) {
      return;
    }

    if (lArc === rArc) {
      // Split existing beach section
      this.detachCircleEvent(lArc);
      rArc = this.createBeachsection(lArc.site!);
      this.beachline.rbInsertSuccessor(newArc, rArc);
      newArc.edge = rArc.edge = this.createEdge(lArc.site!, newArc.site!);
      this.attachCircleEvent(lArc);
      this.attachCircleEvent(rArc);
      return;
    }

    if (lArc && !rArc) {
      newArc.edge = this.createEdge(lArc.site!, newArc.site!);
      return;
    }

    // lArc !== rArc
    if (lArc !== rArc) {
      this.detachCircleEvent(lArc!);
      this.detachCircleEvent(rArc!);

      const lSite = lArc!.site!;
      const ax = lSite.x;
      const ay = lSite.y;
      const bx = site.x - ax;
      const by = site.y - ay;
      const rSite = rArc!.site!;
      const cx = rSite.x - ax;
      const cy = rSite.y - ay;
      const d = 2 * (bx * cy - by * cx);
      const hb = bx * bx + by * by;
      const hc = cx * cx + cy * cy;
      const vertex = this.createVertex(
        (cy * hb - by * hc) / d + ax,
        (bx * hc - cx * hb) / d + ay
      );

      this.setEdgeStartpoint(rArc!.edge!, lSite, rSite, vertex);
      newArc.edge = this.createEdge(lSite, site, undefined, vertex);
      rArc!.edge = this.createEdge(site, rSite, undefined, vertex);
      this.attachCircleEvent(lArc!);
      this.attachCircleEvent(rArc!);
    }
  }

  private removeBeachsection(beachsection: RBNode): void {
    const circle = beachsection.circleEvent!;
    const x = circle.x;
    const y = circle.ycenter;
    const vertex = this.createVertex(x, y);
    const previous = beachsection.rbPrevious;
    const next = beachsection.rbNext;
    const disappearingTransitions = [beachsection];

    this.detachBeachsection(beachsection);

    let lArc = previous;
    while (lArc.circleEvent && 
           Math.abs(x - lArc.circleEvent.x) < 1e-9 && 
           Math.abs(y - lArc.circleEvent.ycenter) < 1e-9) {
      previous = lArc.rbPrevious;
      disappearingTransitions.unshift(lArc);
      this.detachBeachsection(lArc);
      lArc = previous;
    }
    disappearingTransitions.unshift(lArc);
    this.detachCircleEvent(lArc);

    let rArc = next;
    while (rArc.circleEvent && 
           Math.abs(x - rArc.circleEvent.x) < 1e-9 && 
           Math.abs(y - rArc.circleEvent.ycenter) < 1e-9) {
      next = rArc.rbNext;
      disappearingTransitions.push(rArc);
      this.detachBeachsection(rArc);
      rArc = next;
    }
    disappearingTransitions.push(rArc);
    this.detachCircleEvent(rArc);

    const nArcs = disappearingTransitions.length;
    for (let iArc = 1; iArc < nArcs; iArc++) {
      rArc = disappearingTransitions[iArc];
      lArc = disappearingTransitions[iArc - 1];
      this.setEdgeStartpoint(rArc.edge!, lArc.site!, rArc.site!, vertex);
    }

    lArc = disappearingTransitions[0];
    rArc = disappearingTransitions[nArcs - 1];
    rArc.edge = this.createEdge(lArc.site!, rArc.site!, undefined, vertex);
    this.attachCircleEvent(lArc);
    this.attachCircleEvent(rArc);
  }

  private createBeachsection(site: ISite): RBNode {
    const beachsection = this.beachsectionJunkyard.pop() || new RBNode(site);
    beachsection.site = site;
    return beachsection;
  }
}

export { Voronoi, type ISite as Site, type IBoundingBox as BoundingBox, type IDiagram as Diagram };
