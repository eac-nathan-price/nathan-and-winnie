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

class Voronoi {
  vertices: any[] | null;
  edges: any[] | null;
  cells: any[] | null;
  toRecycle: any | null;
  beachsectionJunkyard: any[];
  circleEventJunkyard: any[];
  vertexJunkyard: any[];
  edgeJunkyard: any[];
  cellJunkyard: any[];
  beachline: any;
  circleEvents: any;
  firstCircleEvent: any;

  constructor() {
    this.vertices = null;
    this.edges = null;
    this.cells = null;
    this.toRecycle = null;
    this.beachsectionJunkyard = [];
    this.circleEventJunkyard = [];
    this.vertexJunkyard = [];
    this.edgeJunkyard = [];
    this.cellJunkyard = [];
  }

  reset() {
    if (!this.beachline) {
      this.beachline = new RBTree();
    }
    // Move leftover beachsections to the beachsection junkyard.
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

  sqrt = Math.sqrt;
  abs = Math.abs;
  ε = 1e-9;
  invε = 1.0 / this.ε;

  equalWithEpsilon(a: number, b: number): boolean {
    return this.abs(a - b) < 1e-9;
  }

  greaterThanWithEpsilon(a: number, b: number): boolean {
    return a - b > 1e-9;
  }

  greaterThanOrEqualWithEpsilon(a: number, b: number): boolean {
    return b - a < 1e-9;
  }

  lessThanWithEpsilon(a: number, b: number): boolean {
    return b - a > 1e-9;
  }

  lessThanOrEqualWithEpsilon(a: number, b: number): boolean {
    return a - b < 1e-9;
  }

  // Other methods...

  compute(sites: any[], bbox: any) {
    // to measure execution time
    const startTime = new Date();

    // init internal state
    this.reset();

    // any diagram data available for recycling?
    // I do that here so that this is included in execution time
    if (this.toRecycle) {
      this.vertexJunkyard = this.vertexJunkyard.concat(this.toRecycle.vertices);
      this.edgeJunkyard = this.edgeJunkyard.concat(this.toRecycle.edges);
      this.cellJunkyard = this.cellJunkyard.concat(this.toRecycle.cells);
      this.toRecycle = null;
    }

    // Initialize site event queue
    const siteEvents = sites.slice(0);
    siteEvents.sort((a, b) => {
      const r = b.y - a.y;
      if (r) {
        return r;
      }
      return b.x - a.x;
    });

    // process queue
    let site = siteEvents.pop();
    let siteid = 0;
    let xsitex, xsitey;
    const cells = this.cells;
    let circle;

    // main loop
    for (;;) {
      // we need to figure whether we handle a site or circle event
      // for this we find out if there is a site event and it is
      // 'earlier' than the circle event
      circle = this.firstCircleEvent;

      // add beach section
      if (site && (!circle || site.y < circle.y || (site.y === circle.y && site.x < circle.x))) {
        // only if site is not a duplicate
        if (site.x !== xsitex || site.y !== xsitey) {
          // first create cell for new site
          cells[siteid] = this.createCell(site);
          site.voronoiId = siteid++;
          // then create a beachsection for that site
          this.addBeachsection(site);
          // remember last site coords to detect duplicate
          xsitey = site.y;
          xsitex = site.x;
        }
        site = siteEvents.pop();
      }

      // remove beach section
      else if (circle) {
        this.removeBeachsection(circle.arc);
      }

      // all done, quit
      else {
        break;
      }
    }

    // wrapping-up:
    //   connect dangling edges to bounding box
    //   cut edges as per bounding box
    //   discard edges completely outside bounding box
    //   discard edges which are point-like
    this.clipEdges(bbox);

    //   add missing edges in order to close opened cells
    this.closeCells(bbox);

    // to measure execution time
    const stopTime = new Date();

    // prepare return values
    const diagram = new Diagram();
    diagram.cells = this.cells;
    diagram.edges = this.edges;
    diagram.vertices = this.vertices;
    diagram.execTime = stopTime.getTime() - startTime.getTime();

    // clean up
    this.reset();

    return diagram;
  }

  createCell(site: any): Cell {
    let cell = this.cellJunkyard.pop();
    if (cell) {
      return cell.init(site);
    }
    return new Cell(site);
  }

  addBeachsection(site: any) {
    // Implementation of addBeachsection logic
    // This method should handle the addition of a beach section
    // to the beachline data structure.
  }

  removeBeachsection(arc: any) {
    // Implementation of removeBeachsection logic
    // This method should handle the removal of a beach section
    // from the beachline data structure.
  }

  clipEdges(bbox: any) {
    const edges = this.edges;
    let iEdge = edges.length;
    const abs_fn = Math.abs;

    while (iEdge--) {
      const edge = edges[iEdge];
      if (!this.connectEdge(edge, bbox) ||
          !this.clipEdge(edge, bbox) ||
          (abs_fn(edge.va.x - edge.vb.x) < 1e-9 && abs_fn(edge.va.y - edge.vb.y) < 1e-9)) {
        edge.va = edge.vb = null;
        edges.splice(iEdge, 1);
      }
    }
  }

  closeCells(bbox: any) {
    const xl = bbox.xl,
          xr = bbox.xr,
          yt = bbox.yt,
          yb = bbox.yb;
    const cells = this.cells;
    let iCell = cells.length;
    let cell, iLeft, halfedges, nHalfedges, edge, va, vb, vz, lastBorderSegment;
    const abs_fn = Math.abs;

    while (iCell--) {
      cell = cells[iCell];
      if (!cell.prepareHalfedges()) {
        continue;
      }
      if (!cell.closeMe) {
        continue;
      }
      halfedges = cell.halfedges;
      nHalfedges = halfedges.length;
      iLeft = 0;
      while (iLeft < nHalfedges) {
        va = halfedges[iLeft].getEndpoint();
        vz = halfedges[(iLeft + 1) % nHalfedges].getStartpoint();
        if (abs_fn(va.x - vz.x) >= 1e-9 || abs_fn(va.y - vz.y) >= 1e-9) {
          switch (true) {
            case this.equalWithEpsilon(va.x, xl) && this.lessThanWithEpsilon(va.y, yb):
              lastBorderSegment = this.equalWithEpsilon(vz.x, xl);
              vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) { break; }
              va = vb;
            case this.equalWithEpsilon(va.y, yb) && this.lessThanWithEpsilon(va.x, xr):
              lastBorderSegment = this.equalWithEpsilon(vz.y, yb);
              vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) { break; }
              va = vb;
            case this.equalWithEpsilon(va.x, xr) && this.greaterThanWithEpsilon(va.y, yt):
              lastBorderSegment = this.equalWithEpsilon(vz.x, xr);
              vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) { break; }
              va = vb;
            case this.equalWithEpsilon(va.y, yt) && this.greaterThanWithEpsilon(va.x, xl):
              lastBorderSegment = this.equalWithEpsilon(vz.y, yt);
              vb = this.createVertex(lastBorderSegment ? vz.x : xl, yt);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) { break; }
              va = vb;
            default:
              throw "Voronoi.closeCells() > this makes no sense!";
          }
        }
        iLeft++;
      }
      cell.closeMe = false;
    }
  }

  createVertex(x: number, y: number): Vertex {
    let v = this.vertexJunkyard.pop();
    if (!v) {
      v = new Vertex(x, y);
    } else {
      v.x = x;
      v.y = y;
    }
    this.vertices.push(v);
    return v;
  }

  createEdge(lSite: any, rSite: any, va?: Vertex, vb?: Vertex): Edge {
    let edge = this.edgeJunkyard.pop();
    if (!edge) {
      edge = new Edge(lSite, rSite);
    } else {
      edge.lSite = lSite;
      edge.rSite = rSite;
      edge.va = edge.vb = null;
    }

    this.edges.push(edge);
    if (va) {
      this.setEdgeStartpoint(edge, lSite, rSite, va);
    }
    if (vb) {
      this.setEdgeEndpoint(edge, lSite, rSite, vb);
    }
    this.cells[lSite.voronoiId].halfedges.push(this.createHalfedge(edge, lSite, rSite));
    this.cells[rSite.voronoiId].halfedges.push(this.createHalfedge(edge, rSite, lSite));
    return edge;
  }

  createBorderEdge(lSite: any, va: Vertex, vb: Vertex): Edge {
    let edge = this.edgeJunkyard.pop();
    if (!edge) {
      edge = new Edge(lSite, null);
    } else {
      edge.lSite = lSite;
      edge.rSite = null;
    }
    edge.va = va;
    edge.vb = vb;
    this.edges.push(edge);
    return edge;
  }

  setEdgeStartpoint(edge: Edge, lSite: any, rSite: any, vertex: Vertex) {
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

  setEdgeEndpoint(edge: Edge, lSite: any, rSite: any, vertex: Vertex) {
    this.setEdgeStartpoint(edge, rSite, lSite, vertex);
  }

  createHalfedge(edge: Edge, lSite: any, rSite: any): Halfedge {
    return new Halfedge(edge, lSite, rSite);
  }

  connectEdge(edge: Edge, bbox: any): boolean {
    let vb = edge.vb;
    if (!!vb) { return true; }

    let va = edge.va,
        xl = bbox.xl,
        xr = bbox.xr,
        yt = bbox.yt,
        yb = bbox.yb,
        lSite = edge.lSite,
        rSite = edge.rSite,
        lx = lSite.x,
        ly = lSite.y,
        rx = rSite.x,
        ry = rSite.y,
        fx = (lx + rx) / 2,
        fy = (ly + ry) / 2,
        fm, fb;

    this.cells[lSite.voronoiId].closeMe = true;
    this.cells[rSite.voronoiId].closeMe = true;

    if (ry !== ly) {
      fm = (lx - rx) / (ry - ly);
      fb = fy - fm * fx;
    }

    if (fm === undefined) {
      if (fx < xl || fx >= xr) { return false; }
      if (lx > rx) {
        if (!va || va.y < yt) {
          va = this.createVertex(fx, yt);
        } else if (va.y >= yb) {
          return false;
        }
        vb = this.createVertex(fx, yb);
      } else {
        if (!va || va.y > yb) {
          va = this.createVertex(fx, yb);
        } else if (va.y < yt) {
          return false;
        }
        vb = this.createVertex(fx, yt);
      }
    } else if (fm < -1 || fm > 1) {
      if (lx > rx) {
        if (!va || va.y < yt) {
          va = this.createVertex((yt - fb) / fm, yt);
        } else if (va.y >= yb) {
          return false;
        }
        vb = this.createVertex((yb - fb) / fm, yb);
      } else {
        if (!va || va.y > yb) {
          va = this.createVertex((yb - fb) / fm, yb);
        } else if (va.y < yt) {
          return false;
        }
        vb = this.createVertex((yt - fb) / fm, yt);
      }
    } else {
      if (ly < ry) {
        if (!va || va.x < xl) {
          va = this.createVertex(xl, fm * xl + fb);
        } else if (va.x >= xr) {
          return false;
        }
        vb = this.createVertex(xr, fm * xr + fb);
      } else {
        if (!va || va.x > xr) {
          va = this.createVertex(xr, fm * xr + fb);
        } else if (va.x < xl) {
          return false;
        }
        vb = this.createVertex(xl, fm * xl + fb);
      }
    }
    edge.va = va;
    edge.vb = vb;

    return true;
  }

  clipEdge(edge: Edge, bbox: any): boolean {
    let ax = edge.va.x,
        ay = edge.va.y,
        bx = edge.vb.x,
        by = edge.vb.y,
        t0 = 0,
        t1 = 1,
        dx = bx - ax,
        dy = by - ay;
    let q = ax - bbox.xl;
    if (dx === 0 && q < 0) { return false; }
    let r = -q / dx;
    if (dx < 0) {
      if (r < t0) { return false; }
      if (r < t1) { t1 = r; }
    } else if (dx > 0) {
      if (r > t1) { return false; }
      if (r > t0) { t0 = r; }
    }
    q = bbox.xr - ax;
    if (dx === 0 && q < 0) { return false; }
    r = q / dx;
    if (dx < 0) {
      if (r > t1) { return false; }
      if (r > t0) { t0 = r; }
    } else if (dx > 0) {
      if (r < t0) { return false; }
      if (r < t1) { t1 = r; }
    }
    q = ay - bbox.yt;
    if (dy === 0 && q < 0) { return false; }
    r = -q / dy;
    if (dy < 0) {
      if (r < t0) { return false; }
      if (r < t1) { t1 = r; }
    } else if (dy > 0) {
      if (r > t1) { return false; }
      if (r > t0) { t0 = r; }
    }
    q = bbox.yb - ay;
    if (dy === 0 && q < 0) { return false; }
    r = q / dy;
    if (dy < 0) {
      if (r > t1) { return false; }
      if (r > t0) { t0 = r; }
    } else if (dy > 0) {
      if (r < t0) { return false; }
      if (r < t1) { t1 = r; }
    }

    if (t0 > 0) {
      edge.va = this.createVertex(ax + t0 * dx, ay + t0 * dy);
    }

    if (t1 < 1) {
      edge.vb = this.createVertex(ax + t1 * dx, ay + t1 * dy);
    }

    if (t0 > 0 || t1 < 1) {
      this.cells[edge.lSite.voronoiId].closeMe = true;
      this.cells[edge.rSite.voronoiId].closeMe = true;
    }

    return true;
  }
}

// Define the RBTree class
class RBTree {
  root: any;

  constructor() {
    this.root = null;
  }

  rbInsertSuccessor(node: any, successor: any) {
    let parent;
    if (node) {
      successor.rbPrevious = node;
      successor.rbNext = node.rbNext;
      if (node.rbNext) {
        node.rbNext.rbPrevious = successor;
      }
      node.rbNext = successor;
      if (node.rbRight) {
        node = node.rbRight;
        while (node.rbLeft) {
          node = node.rbLeft;
        }
        node.rbLeft = successor;
      } else {
        node.rbRight = successor;
      }
      parent = node;
    } else if (this.root) {
      node = this.getFirst(this.root);
      successor.rbPrevious = null;
      successor.rbNext = node;
      node.rbPrevious = successor;
      node.rbLeft = successor;
      parent = node;
    } else {
      successor.rbPrevious = successor.rbNext = null;
      this.root = successor;
      parent = null;
    }
    successor.rbLeft = successor.rbRight = null;
    successor.rbRed = true;
    let grandpa, uncle;
    node = successor;
    while (parent && parent.rbRed) {
      grandpa = parent.rbParent;
      if (parent === grandpa.rbLeft) {
        uncle = grandpa.rbRight;
        if (uncle && uncle.rbRed) {
          parent.rbRed = uncle.rbRed = false;
          grandpa.rbRed = true;
          node = grandpa;
        } else {
          if (node === parent.rbRight) {
            this.rbRotateLeft(parent);
            node = parent;
            parent = node.rbParent;
          }
          parent.rbRed = false;
          grandpa.rbRed = true;
          this.rbRotateRight(grandpa);
        }
      } else {
        uncle = grandpa.rbLeft;
        if (uncle && uncle.rbRed) {
          parent.rbRed = uncle.rbRed = false;
          grandpa.rbRed = true;
          node = grandpa;
        } else {
          if (node === parent.rbLeft) {
            this.rbRotateRight(parent);
            node = parent;
            parent = node.rbParent;
          }
          parent.rbRed = false;
          grandpa.rbRed = true;
          this.rbRotateLeft(grandpa);
        }
      }
      parent = node.rbParent;
    }
    this.root.rbRed = false;
  }

  rbRemoveNode(node: any) {
    if (node.rbNext) {
      node.rbNext.rbPrevious = node.rbPrevious;
    }
    if (node.rbPrevious) {
      node.rbPrevious.rbNext = node.rbNext;
    }
    node.rbNext = node.rbPrevious = null;
    let parent = node.rbParent,
      left = node.rbLeft,
      right = node.rbRight,
      next;
    if (!left) {
      next = right;
    } else if (!right) {
      next = left;
    } else {
      next = this.getFirst(right);
    }
    if (parent) {
      if (parent.rbLeft === node) {
        parent.rbLeft = next;
      } else {
        parent.rbRight = next;
      }
    } else {
      this.root = next;
    }
    let isRed;
    if (left && right) {
      isRed = next.rbRed;
      next.rbRed = node.rbRed;
      next.rbLeft = left;
      left.rbParent = next;
      if (next !== right) {
        parent = next.rbParent;
        next.rbParent = node.rbParent;
        node = next.rbRight;
        parent.rbLeft = node;
        next.rbRight = right;
        right.rbParent = next;
      } else {
        next.rbParent = parent;
        parent = next;
        node = next.rbRight;
      }
    } else {
      isRed = node.rbRed;
      node = next;
    }
    if (node) {
      node.rbParent = parent;
    }
    if (isRed) {
      return;
    }
    if (node && node.rbRed) {
      node.rbRed = false;
      return;
    }
    let sibling;
    do {
      if (node === this.root) {
        break;
      }
      if (node === parent.rbLeft) {
        sibling = parent.rbRight;
        if (sibling.rbRed) {
          sibling.rbRed = false;
          parent.rbRed = true;
          this.rbRotateLeft(parent);
          sibling = parent.rbRight;
        }
        if ((sibling.rbLeft && sibling.rbLeft.rbRed) || (sibling.rbRight && sibling.rbRight.rbRed)) {
          if (!sibling.rbRight || !sibling.rbRight.rbRed) {
            sibling.rbLeft.rbRed = false;
            sibling.rbRed = true;
            this.rbRotateRight(sibling);
            sibling = parent.rbRight;
          }
          sibling.rbRed = parent.rbRed;
          parent.rbRed = sibling.rbRight.rbRed = false;
          this.rbRotateLeft(parent);
          node = this.root;
          break;
        }
      } else {
        sibling = parent.rbLeft;
        if (sibling.rbRed) {
          sibling.rbRed = false;
          parent.rbRed = true;
          this.rbRotateRight(parent);
          sibling = parent.rbLeft;
        }
        if ((sibling.rbLeft && sibling.rbLeft.rbRed) || (sibling.rbRight && sibling.rbRight.rbRed)) {
          if (!sibling.rbLeft || !sibling.rbLeft.rbRed) {
            sibling.rbRight.rbRed = false;
            sibling.rbRed = true;
            this.rbRotateLeft(sibling);
            sibling = parent.rbLeft;
          }
          sibling.rbRed = parent.rbRed;
          parent.rbRed = sibling.rbLeft.rbRed = false;
          this.rbRotateRight(parent);
          node = this.root;
          break;
        }
      }
      sibling.rbRed = true;
      node = parent;
      parent = parent.rbParent;
    } while (!node.rbRed);
    if (node) {
      node.rbRed = false;
    }
  }

  rbRotateLeft(node: any) {
    const p = node,
      q = node.rbRight,
      parent = p.rbParent;
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

  rbRotateRight(node: any) {
    const p = node,
      q = node.rbLeft,
      parent = p.rbParent;
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

  getFirst(node: any) {
    while (node.rbLeft) {
      node = node.rbLeft;
    }
    return node;
  }

  getLast(node: any) {
    while (node.rbRight) {
      node = node.rbRight;
    }
    return node;
  }
}

// Define the Diagram class
class Diagram {
  site: any;
  cells: any[];
  edges: any[];
  vertices: any[];
  execTime: number;

  constructor(site?: any) {
    this.site = site;
    this.cells = [];
    this.edges = [];
    this.vertices = [];
    this.execTime = 0;
  }
}

// Define the Cell class
class Cell {
  site: any;
  halfedges: any[];
  closeMe: boolean;

  constructor(site: any) {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
  }

  init(site: any) {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
    return this;
  }

  prepareHalfedges() {
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let edge;
    while (iHalfedge--) {
      edge = halfedges[iHalfedge].edge;
      if (!edge.vb || !edge.va) {
        halfedges.splice(iHalfedge, 1);
      }
    }
    halfedges.sort((a, b) => b.angle - a.angle);
    return halfedges.length;
  }

  getNeighborIds() {
    const neighbors = [];
    let iHalfedge = this.halfedges.length;
    let edge;
    while (iHalfedge--) {
      edge = this.halfedges[iHalfedge].edge;
      if (edge.lSite !== null && edge.lSite.voronoiId != this.site.voronoiId) {
        neighbors.push(edge.lSite.voronoiId);
      } else if (edge.rSite !== null && edge.rSite.voronoiId != this.site.voronoiId) {
        neighbors.push(edge.rSite.voronoiId);
      }
    }
    return neighbors;
  }

  getBbox() {
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let xmin = Infinity,
      ymin = Infinity,
      xmax = -Infinity,
      ymax = -Infinity,
      v,
      vx,
      vy;
    while (iHalfedge--) {
      v = halfedges[iHalfedge].getStartpoint();
      vx = v.x;
      vy = v.y;
      if (vx < xmin) {
        xmin = vx;
      }
      if (vy < ymin) {
        ymin = vy;
      }
      if (vx > xmax) {
        xmax = vx;
      }
      if (vy > ymax) {
        ymax = vy;
      }
    }
    return {
      x: xmin,
      y: ymin,
      width: xmax - xmin,
      height: ymax - ymin,
    };
  }

  pointIntersection(x: number, y: number) {
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let halfedge, p0, p1, r;
    while (iHalfedge--) {
      halfedge = halfedges[iHalfedge];
      p0 = halfedge.getStartpoint();
      p1 = halfedge.getEndpoint();
      r = (y - p0.y) * (p1.x - p0.x) - (x - p0.x) * (p1.y - p0.y);
      if (!r) {
        return 0;
      }
      if (r > 0) {
        return -1;
      }
    }
    return 1;
  }
}

// Define the Vertex class
class Vertex {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// Define the Edge class
class Edge {
  lSite: any;
  rSite: any;
  va: any;
  vb: any;

  constructor(lSite: any, rSite: any) {
    this.lSite = lSite;
    this.rSite = rSite;
    this.va = this.vb = null;
  }
}

// Define the Halfedge class
class Halfedge {
  site: any;
  edge: any;
  angle: number;

  constructor(edge: any, lSite: any, rSite: any) {
    this.site = lSite;
    this.edge = edge;
    if (rSite) {
      this.angle = Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x);
    } else {
      const va = edge.va,
        vb = edge.vb;
      this.angle = edge.lSite === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
    }
  }

  getStartpoint() {
    return this.edge.lSite === this.site ? this.edge.va : this.edge.vb;
  }

  getEndpoint() {
    return this.edge.lSite === this.site ? this.edge.vb : this.edge.va;
  }
}

// Define the Beachsection class
class Beachsection {
  site: any;

  constructor() {}
}

// Define the CircleEvent class
class CircleEvent {
  arc: any;
  rbLeft: any;
  rbNext: any;
  rbParent: any;
  rbPrevious: any;
  rbRed: boolean;
  rbRight: any;
  site: any;
  x: number;
  y: number;
  ycenter: number;

  constructor() {
    this.arc = null;
    this.rbLeft = null;
    this.rbNext = null;
    this.rbParent = null;
    this.rbPrevious = null;
    this.rbRed = false;
    this.rbRight = null;
    this.site = null;
    this.x = this.y = this.ycenter = 0;
  }
}

// Export the Voronoi class
export default Voronoi;
