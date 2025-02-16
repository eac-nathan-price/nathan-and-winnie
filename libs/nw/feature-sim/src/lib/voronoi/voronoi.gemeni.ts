export class Voronoi {
  vertices: Vertex[] = [];
  edges: Edge[] = [];
  cells: Cell[] = [];
  beachsectionJunkyard: Beachsection[] = [];
  circleEventJunkyard: CircleEvent[] = [];
  vertexJunkyard: Vertex[] = [];
  edgeJunkyard: Edge[] = [];
  cellJunkyard: Cell[] = [];
  private beachline = new RBTree();
  private circleEvents = new RBTree();
  private firstCircleEvent: CircleEvent | null = null;

  static epsilon = 1e-9;
  static invEpsilon = 1.0 / Voronoi.epsilon;
  private sqrt = Math.sqrt;
  private abs = Math.abs;

  reset() {
    this.beachline = new RBTree();

    // Clear existing junkyards.  This is important for correct reuse.
    this.beachsectionJunkyard = [];
    this.circleEventJunkyard = [];
    this.vertexJunkyard = [];
    this.edgeJunkyard = [];
    this.cellJunkyard = [];

    if (this.beachline.root) {
      let beachsection: RBNode | null = this.beachline.getFirst(this.beachline.root);
      while (beachsection) {
        this.beachsectionJunkyard.push(beachsection as Beachsection);
        beachsection = beachsection.rbNext;
      }
    }
    this.beachline.root = null;

    this.circleEvents = new RBTree();
    this.circleEvents.root = this.firstCircleEvent = null;
    this.vertices = [];
    this.edges = [];
    this.cells = [];
  }

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

  RBTree = RBTree;
  Diagram = Diagram;
  Cell = Cell;
  Vertex = Vertex;
  Edge = Edge;
  Halfedge = Halfedge;
  Beachsection = Beachsection;
  CircleEvent = CircleEvent;

  createCell(site: Site) {
    const cell = this.cellJunkyard.pop();
    if (cell) return cell.init(site);
    return new this.Cell(site);
  }

  createHalfedge(edge: Edge, lSite: Site, rSite: Site | null): Halfedge {
    if (!edge || !lSite) {
      throw new Error('createHalfedge requires valid edge and left site');
    }
    try {
      return new this.Halfedge(edge, lSite, rSite);
    } catch (e) {
      console.error('Failed to create halfedge:', e);
      // Create a minimal valid halfedge as fallback
      const halfedge = new this.Halfedge(edge, lSite, null);
      halfedge.angle = 0;
      return halfedge;
    }
  }

  createVertex(x: number, y: number) {
    let v = this.vertexJunkyard.pop();
    if (!v) v = new this.Vertex(x, y);
    else {
      v.x = x;
      v.y = y;
    }
    this.vertices.push(v);
    return v;
  }

  createEdge(lSite: Site | null, rSite: Site | null, va?: Vertex, vb?: Vertex) {
    if (!lSite || !rSite) throw new Error('lSite and rSite must be defined');
    let edge = this.edgeJunkyard.pop();
    if (!edge) edge = new this.Edge(lSite, rSite);
    else {
      edge.lSite = lSite;
      edge.rSite = rSite;
      edge.va = null;
      edge.vb = null;
    }

    this.edges.push(edge);
    if (va) this.setEdgeStartpoint(edge, lSite, rSite, va);
    if (vb) this.setEdgeEndpoint(edge, lSite, rSite, vb);
    this.cells[lSite.voronoiId].halfedges.push(this.createHalfedge(edge, lSite, rSite));
    this.cells[rSite.voronoiId].halfedges.push(this.createHalfedge(edge, rSite, lSite));
    return edge;
  }

  createBorderEdge(lSite: Site, va: Vertex, vb: Vertex): Edge {
    if (!lSite || !va || !vb) {
      throw new Error('createBorderEdge requires valid site and vertices');
    }
    
    const edge = this.edgeJunkyard.pop() || new this.Edge(lSite, null);
    edge.lSite = lSite;
    edge.rSite = null;
    edge.va = va;
    edge.vb = vb;
    this.edges.push(edge);
    return edge;
  }

  setEdgeStartpoint(edge: Edge | null, lSite: Site | null, rSite: Site | null, vertex: Vertex) {
    if (!edge) return;
    if (!edge.va && !edge.vb) {
      edge.va = vertex;
      edge.lSite = lSite;
      edge.rSite = rSite;
    } else if (edge.lSite === rSite) edge.vb = vertex;
    else edge.va = vertex;
  }

  setEdgeEndpoint(edge: Edge | null, lSite: Site | null, rSite: Site | null, vertex: Vertex) {
    if (!edge) return;
    this.setEdgeStartpoint(edge, rSite, lSite, vertex);
  }

  createBeachsection(site: Site) {
    let beachsection = this.beachsectionJunkyard.pop();
    if (!beachsection) beachsection = new this.Beachsection();
    beachsection.site = site;
    return beachsection;
  }

  leftBreakPoint(arc: Beachsection, directrix: number): number {
    let site = arc.site;
    if (!site) return -Infinity;
    const rfocx = site.x;
    const rfocy = site.y;
    const pby2 = rfocy - directrix;
    if (!pby2) return rfocx;
    const lArc = arc.rbPrevious as Beachsection | null; // Type assertion
    if (!lArc || !lArc.site) return -Infinity;
    site = lArc.site; // Correctly gets the Site from lArc
    const lfocx = site.x;
    const lfocy = site.y;
    const plby2 = lfocy - directrix;
    if (!plby2) return lfocx;
    const hl = lfocx - rfocx;
    const aby2 = 1 / pby2 - 1 / plby2;
    const b = hl / plby2;
    if (aby2) return (-b+this.sqrt(b*b-2*aby2*((hl*hl)/(-2*plby2)-lfocy+plby2/2+rfocy-pby2/2)))/aby2+rfocx;
    return (rfocx + lfocx) / 2;
  }

  rightBreakPoint(arc: Beachsection, directrix: number) {
    const rArc = arc.rbNext as Beachsection | null; // Type assertion
    if (rArc) return this.leftBreakPoint(rArc, directrix);
    const site = arc.site;
    if (!site) return Infinity;
    return site.y === directrix ? site.x : Infinity;
  }

  detachBeachsection(beachsection: Beachsection) {
    this.detachCircleEvent(beachsection);
    this.beachline.rbRemoveNode(beachsection);
    this.beachsectionJunkyard.push(beachsection);
  }

  removeBeachsection(beachsection: Beachsection | null) {
    if (!beachsection) return;
    const circle = beachsection.circleEvent;
    if (!circle) return;
    const x = circle.x;
    const y = circle.ycenter;
    const vertex = this.createVertex(x, y);
    let previous = beachsection.rbPrevious as Beachsection;
    let next = beachsection.rbNext as Beachsection;
    const disappearingTransitions = [beachsection];
    const abs_fn = Math.abs;

    this.detachBeachsection(beachsection);

    let lArc = previous;
    while (lArc.circleEvent && abs_fn(x - lArc.circleEvent.x) < 1e-9 && abs_fn(y - lArc.circleEvent.ycenter) < 1e-9) {
      previous = lArc.rbPrevious as Beachsection;
      disappearingTransitions.unshift(lArc);
      this.detachBeachsection(lArc);
      lArc = previous;
    }
    disappearingTransitions.unshift(lArc);
    this.detachCircleEvent(lArc);

    let rArc = next;
    while (rArc.circleEvent && abs_fn(x - rArc.circleEvent.x) < 1e-9 && abs_fn(y - rArc.circleEvent.ycenter) < 1e-9) {
      next = rArc.rbNext as Beachsection;
      disappearingTransitions.push(rArc);
      this.detachBeachsection(rArc);
      rArc = next;
    }
    disappearingTransitions.push(rArc);
    this.detachCircleEvent(rArc);

    const nArcs = disappearingTransitions.length;
    let iArc;
    for (iArc = 1; iArc < nArcs; iArc++) {
      rArc = disappearingTransitions[iArc] as Beachsection;
      lArc = disappearingTransitions[iArc - 1] as Beachsection;
      this.setEdgeStartpoint(rArc.edge, lArc.site, rArc.site, vertex);
    }

    lArc = disappearingTransitions[0] as Beachsection;
    rArc = disappearingTransitions[nArcs - 1] as Beachsection;
    rArc.edge = this.createEdge(lArc.site, rArc.site, undefined, vertex);

    this.attachCircleEvent(lArc);
    this.attachCircleEvent(rArc);
  }

  addBeachsection(site: Site) {
    const x = site.x;
    const directrix = site.y;
    let lArc: Beachsection | null = null;
    let rArc: Beachsection | null = null;
    let dxl, dxr;
    let node = this.beachline.root as Beachsection;

    while (node) {
      dxl = this.leftBreakPoint(node as Beachsection, directrix) - x;
      if (dxl > 1e-9) node = node.rbLeft as Beachsection;
      else {
        dxr = x - this.rightBreakPoint(node as Beachsection, directrix);
        if (dxr > 1e-9) {
          if (!node.rbRight) {
            lArc = node;
            break;
          }
          node = node.rbRight as Beachsection;
        } else {
          if (dxl > -1e-9) {
            lArc = node.rbPrevious as Beachsection;
            rArc = node;
          } else if (dxr > -1e-9) {
            lArc = node;
            rArc = node.rbNext as Beachsection;
          } else lArc = rArc = node;
          break;
        }
      }
    }

    const newArc = this.createBeachsection(site);
    this.beachline.rbInsertSuccessor(lArc, newArc); //lArc might be null

    if (!lArc && !rArc) return;

    if (lArc && rArc && lArc === rArc) {
      this.detachCircleEvent(lArc); //lArc should exist

      rArc = this.createBeachsection(lArc.site as Site);
      this.beachline.rbInsertSuccessor(newArc, rArc); //rArc has just been made.

      newArc.edge = rArc.edge = this.createEdge(lArc.site, newArc.site);

      this.attachCircleEvent(lArc); //lArc should exist here
      this.attachCircleEvent(rArc); //rArc has just been made
      return;
    }

    if (lArc && !rArc) {
      newArc.edge = this.createEdge(lArc.site, newArc.site);
      return;
    }

    if (lArc && rArc && lArc.site && rArc.site && lArc !== rArc) {
      this.detachCircleEvent(lArc as Beachsection); //lArc should exist here
      this.detachCircleEvent(rArc as Beachsection); //rArc should exist here

      const lSite = lArc.site;
      const ax = lSite.x;
      const ay = lSite.y;
      const bx = site.x - ax;
      const by = site.y - ay;
      const rSite = rArc.site;
      const cx = rSite.x - ax;
      const cy = rSite.y - ay;
      const d = 2 * (bx * cy - by * cx);
      const hb = bx * bx + by * by;
      const hc = cx * cx + cy * cy;
      const vertex = this.createVertex(
        (cy * hb - by * hc) / d + ax,
        (bx * hc - cx * hb) / d + ay,
      );

      this.setEdgeStartpoint(rArc.edge, lSite, rSite, vertex);

      newArc.edge = this.createEdge(lSite, site, undefined, vertex);
      rArc.edge = this.createEdge(site, rSite, undefined, vertex);

      this.attachCircleEvent(lArc); //lArc should exist here
      this.attachCircleEvent(rArc); //rArc should exist here
      return;
    }
  }

  attachCircleEvent(arc: Beachsection) {
    const lArc = arc.rbPrevious as Beachsection | null; // Type assertion
    const rArc = arc.rbNext as Beachsection | null; // Type assertion
    if (!lArc || !rArc) return;
    const lSite = lArc.site;
    const cSite = arc.site;
    const rSite = rArc.site;
    if (lSite === rSite || !lSite || !cSite || !rSite) return;
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
    let circleEvent = this.circleEventJunkyard.pop();
    if (!circleEvent) circleEvent = new this.CircleEvent();
    circleEvent.arc = arc;
    circleEvent.site = cSite;
    circleEvent.x = x + bx;
    circleEvent.y = ycenter + this.sqrt(x * x + y * y);
    circleEvent.ycenter = ycenter;
    arc.circleEvent = circleEvent;
    let predecessor: RBNode | null = null;
    let node = this.circleEvents.root as CircleEvent;
    while (node) {
      if (circleEvent.y < node.y || (circleEvent.y === node.y && circleEvent.x <= node.x)) {
        if (node.rbLeft) node = node.rbLeft as CircleEvent;
        else {
          predecessor = node.rbPrevious as CircleEvent;
          break;
        }
      } else {
        if (node.rbRight) node = node.rbRight as CircleEvent;
        else {
          predecessor = node;
          break;
        }
      }
    }
    this.circleEvents.rbInsertSuccessor(predecessor, circleEvent);
    if (!predecessor) this.firstCircleEvent = circleEvent;
  }

  detachCircleEvent(arc: Beachsection) {
    const circleEvent = arc.circleEvent;
    if (circleEvent) {
      if (!circleEvent.rbPrevious) this.firstCircleEvent = circleEvent.rbNext as CircleEvent;
      this.circleEvents.rbRemoveNode(circleEvent);
      this.circleEventJunkyard.push(circleEvent);
      arc.circleEvent = null;
    }
  }

  connectEdge(edge: Edge, bbox: Bbox) {
    let vb = edge.vb;
    if (vb) return true;
    let va = edge.va;
    const xl = bbox.xl;
    const xr = bbox.xr;
    const yt = bbox.yt;
    const yb = bbox.yb;
    const lSite = edge.lSite;
    const rSite = edge.rSite;
    if (!lSite || !rSite) return false;
    const lx = lSite.x;
    const ly = lSite.y;
    const rx = rSite.x;
    const ry = rSite.y;
    const fx = (lx + rx) / 2;
    const fy = (ly + ry) / 2;
    let fm: number | undefined;
    let fb: number | undefined;
    this.cells[lSite.voronoiId].closeMe = true;
    this.cells[rSite.voronoiId].closeMe = true;
    if (ry !== ly) {
      fm = (lx - rx) / (ry - ly);
      fb = fy - fm * fx;
    }

    // Initialize fb to a default value if it wasn't set
    if (fb === undefined) {
      fb = fy;
    }

    if (fm === undefined) {
      if (fx < xl || fx >= xr) return false;
      if (lx > rx) {
        if (!va || va.y < yt) va = this.createVertex(fx, yt);
        else if (va.y >= yb) return false;
        vb = this.createVertex(fx, yb);
      } else {
        if (!va || va.y > yb) va = this.createVertex(fx, yb);
        else if (va.y < yt) return false;
        vb = this.createVertex(fx, yt);
      }
    } else if (fm < -1 || fm > 1) {
      if (lx > rx) {
        if (!va || va.y < yt) va = this.createVertex((yt - fb) / fm, yt);
        else if (va.y >= yb) return false;
        vb = this.createVertex((yb - fb) / fm, yb);
      } else {
        if (!va || va.y > yb) va = this.createVertex((yb - fb) / fm, yb);
        else if (va.y < yt) return false;
        vb = this.createVertex((yt - fb) / fm, yt);
      }
    } else {
      if (ly < ry) {
        if (!va || va.x < xl) va = this.createVertex(xl, fm * xl + fb);
        else if (va.x >= xr) return false;
        vb = this.createVertex(xr, fm * xr + fb);
      } else {
        if (!va || va.x > xr) va = this.createVertex(xr, fm * xr + fb);
        else if (va.x < xl) return false;
        vb = this.createVertex(xl, fm * xl + fb);
      }
    }
    edge.va = va;
    edge.vb = vb;
    return true;
  }

  clipEdge(edge: Edge, bbox: Bbox) {
    if (!edge.va || !edge.vb) return false;
    const ax = edge.va.x; // Added ! operators, we are sure that va, vb are defined.
    const ay = edge.va.y;
    const bx = edge.vb.x;
    const by = edge.vb.y;
    let t0 = 0;
    let t1 = 1;
    const dx = bx - ax;
    const dy = by - ay;

    let q = ax - bbox.xl;
    if (dx === 0 && q < 0) return false;
    let r = -q / dx;
    if (dx < 0) {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    } else if (dx > 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    }

    q = bbox.xr - ax;
    if (dx === 0 && q < 0) return false;
    r = q / dx;
    if (dx < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else if (dx > 0) {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }

    q = ay - bbox.yt;
    if (dy === 0 && q < 0) return false;
    r = -q / dy;
    if (dy < 0) {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    } else if (dy > 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    }

    q = bbox.yb - ay;
    if (dy === 0 && q < 0) return false;
    r = q / dy;
    if (dy < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else if (dy > 0) {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }

    if (t0 > 0) edge.va = this.createVertex(ax + t0 * dx, ay + t0 * dy);
    if (t1 < 1) edge.vb = this.createVertex(ax + t1 * dx, ay + t1 * dy);
    if ((t0 > 0 || t1 < 1) && edge.lSite && edge.rSite) {
      this.cells[edge.lSite.voronoiId].closeMe = true;
      this.cells[edge.rSite.voronoiId].closeMe = true;
    }

    return true;
  }

  clipEdges(bbox: Bbox) {
    const edges = this.edges;
    let iEdge = edges.length;
    let edge;
    const abs_fn = Math.abs;

    while (iEdge--) {
      edge = edges[iEdge];
      if (!edge.va || !edge.vb) continue;
      if (!this.connectEdge(edge, bbox) || !this.clipEdge(edge, bbox) || (abs_fn(edge.va.x - edge.vb.x) < 1e-9 && abs_fn(edge.va.y - edge.vb.y) < 1e-9)) {
        edge.va = edge.vb = null;
        edges.splice(iEdge, 1);
      }
    }
  }

  closeCells(bbox: Bbox) {
    const xl = bbox.xl;
    const xr = bbox.xr;
    const yt = bbox.yt;
    const yb = bbox.yb;
    const cells = this.cells;
    let iCell = cells.length;
    let cell;
    let iLeft;
    let halfedges, nHalfedges;
    let edge;
    let va, vb, vz;
    let lastBorderSegment;
    const abs_fn = Math.abs;

    while (iCell--) {
      cell = cells[iCell];
      if (!cell.prepareHalfedges() || !cell.closeMe) continue;
      halfedges = cell.halfedges;
      nHalfedges = halfedges.length;

      iLeft = 0;
      while (iLeft < nHalfedges) {
        va = halfedges[iLeft].getEndpoint();
        vz = halfedges[(iLeft + 1) % nHalfedges].getStartpoint();
        if (!va || !vz) continue;
        if (abs_fn(va.x - vz.x) >= 1e-9 || abs_fn(va.y - vz.y) >= 1e-9) {
          // Try each border in sequence
          if (this.equalWithEpsilon(va.x, xl) && this.lessThanWithEpsilon(va.y, yb)) {
            // Left border
            lastBorderSegment = this.equalWithEpsilon(vz.x, xl);
            vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
            edge = this.createBorderEdge(cell.site, va, vb);
            iLeft++;
            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
            nHalfedges++;
            if (lastBorderSegment) continue;
            va = vb;
          }
          if (this.equalWithEpsilon(va.y, yb) && this.lessThanWithEpsilon(va.x, xr)) {
            // Bottom border
            lastBorderSegment = this.equalWithEpsilon(vz.y, yb);
            vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
            edge = this.createBorderEdge(cell.site, va, vb);
            iLeft++;
            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
            nHalfedges++;
            if (lastBorderSegment) continue;
            va = vb;
          }
          if (this.equalWithEpsilon(va.x, xr) && this.greaterThanWithEpsilon(va.y, yt)) {
            // Right border
            lastBorderSegment = this.equalWithEpsilon(vz.x, xr);
            vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
            edge = this.createBorderEdge(cell.site, va, vb);
            iLeft++;
            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
            nHalfedges++;
            if (lastBorderSegment) continue;
            va = vb;
          }
          if (this.equalWithEpsilon(va.y, yt) && this.greaterThanWithEpsilon(va.x, xl)) {
            // Top border
            lastBorderSegment = this.equalWithEpsilon(vz.y, yt);
            vb = this.createVertex(lastBorderSegment ? vz.x : xl, yt);
            edge = this.createBorderEdge(cell.site, va, vb);
            iLeft++;
            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
            nHalfedges++;
            if (lastBorderSegment) continue;
            va = vb;
          }

          // Close any remaining gap
          if (va.x !== vz.x || va.y !== vz.y) {
            vb = this.createVertex(va.x, va.y);
            edge = this.createBorderEdge(cell.site, va, vb);
            iLeft++;
            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
            nHalfedges++;
          }
        }
        iLeft++;
      }
      cell.closeMe = false;
    }
  }

  quantizeSites(sites: Site[]) {
    const epsilon = Voronoi.epsilon;
    let n = sites.length;
    let site;
    while (n--) {
      site = sites[n];
      site.x = Math.floor(site.x / epsilon) * epsilon;
      site.y = Math.floor(site.y / epsilon) * epsilon;
    }
  }

  recycle(diagram: Diagram | null) {
    if (diagram) {
      if (diagram instanceof this.Diagram) {
        this.vertexJunkyard = this.vertexJunkyard.concat(diagram.vertices);
        this.edgeJunkyard = this.edgeJunkyard.concat(diagram.edges);
        this.cellJunkyard = this.cellJunkyard.concat(diagram.cells);
        diagram = null;
      } else throw 'Voronoi.recycleDiagram() > Need a Diagram object.';
    }
  }
  compute(sites: SiteInput[], bbox: Bbox) {
    const startTime = new Date();
    this.reset();

    // Validate and normalize input sites
    if (!sites || sites.length === 0) {
      throw new Error('No sites provided');
    }

    // Ensure sites are within bbox
    sites = sites.filter(site => 
      site.x >= bbox.xl && site.x <= bbox.xr && 
      site.y >= bbox.yt && site.y <= bbox.yb
    );

    if (sites.length === 0) {
      throw new Error('No sites within bbox');
    }

    // Quantize sites to prevent floating point issues
    this.quantizeSites(sites as Site[]);

    const siteEvents = sites.slice(0);
    siteEvents.sort((a, b) => {
      const r = b.y - a.y;
      if (r) return r;
      return b.x - a.x;
    });

    let site = siteEvents.pop();
    let siteid = 0;
    let xsitex: number | undefined, xsitey: number | undefined;
    const cells = this.cells;
    let circle;

    // Process all sites and circle events
    while (site || this.firstCircleEvent) {
      circle = this.firstCircleEvent;

      // Handle site or circle event, whichever comes first
      if (site && (!circle || site.y < circle.y || (site.y === circle.y && site.x < circle.x))) {
        // New site event
        if (site.x !== xsitex || site.y !== xsitey) {
          cells[siteid] = this.createCell(site as Site);
          site.voronoiId = siteid++;
          this.addBeachsection(site as Site);
          xsitey = site.y;
          xsitex = site.x;
        }
        site = siteEvents.pop();
      } else if (circle) {
        // Circle event - remove beach section
        this.removeBeachsection(circle.arc);
      } else {
        break;
      }
    }

    // Post-process the diagram
    this.clipEdges(bbox);
    this.closeCells(bbox);

    // Validate the result
    const diagram = new this.Diagram();
    diagram.cells = this.cells;
    diagram.edges = this.edges;
    diagram.vertices = this.vertices;

    // Verify each cell has a complete edge loop
    for (const cell of diagram.cells) {
      if (!cell.prepareHalfedges()) {
        console.error('Cell has incomplete edge loop:', cell);
      }
      
      // Verify cell contains its site
      const bbox = cell.getBbox();
      if (!bbox || cell.pointIntersection(cell.site.x, cell.site.y) <= 0) {
        console.error('Cell does not contain its site:', cell);
      }
    }

    // Verify edges
    for (const edge of diagram.edges) {
      if (!edge.va || !edge.vb) {
        console.error('Edge missing vertices:', edge);
      }
    }

    diagram.execTime = new Date().getTime() - startTime.getTime();
    
    // Reset internal state
    this.reset();
    
    return diagram;
  }
}

export class RBTree {
  root: RBNode | null = null;

  rbInsertSuccessor(node: RBNode | null, successor: RBNode) {
    let parent: RBNode | null;
    if (node) {
      successor.rbPrevious = node;
      successor.rbNext = node.rbNext;
      if (node.rbNext) {
        node.rbNext.rbPrevious = successor;
      }
      node.rbNext = successor;
      if (node.rbRight) {
        node = node.rbRight;
        while (node.rbLeft) node = node.rbLeft;
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
    successor.rbParent = parent;
    successor.rbRed = true;

    // Fix up the modified tree
    let grandpa: RBNode | null;
    let uncle: RBNode | null;
    node = successor;
    while (parent && parent.rbRed) {
      grandpa = parent.rbParent;
      if (!grandpa) break;

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
            if (!parent) break;
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
            if (!parent) break;
          }
          parent.rbRed = false;
          grandpa.rbRed = true;
          this.rbRotateLeft(grandpa);
        }
      }
      parent = node.rbParent;
    }
    if (this.root) {
      this.root.rbRed = false;
    }
  }

  rbRemoveNode(node: RBNode) {
    if (node.rbNext) node.rbNext.rbPrevious = node.rbPrevious;
    if (node.rbPrevious) node.rbPrevious.rbNext = node.rbNext;
    node.rbNext = node.rbPrevious = null;

    let parent = node.rbParent;
    const left = node.rbLeft;
    const right = node.rbRight;
    let next: RBNode | null;
    let isRed: boolean;

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

    if (left && right && next !== right) {
      if (!next) return;
      isRed = next.rbRed;
      next.rbRed = node.rbRed;
      next.rbLeft = left;
      left.rbParent = next;
      if (next !== right) {
        parent = next.rbParent as RBNode;
        next.rbParent = node.rbParent;
        node = next.rbRight as RBNode;
        parent.rbLeft = node;
        if (node) node.rbParent = parent;
        next.rbRight = right;
        right.rbParent = next;
      } else {
        next.rbParent = parent;
        parent = next;
        node = next.rbRight as RBNode;
      }
    } else {
      isRed = node.rbRed;
      node = next as RBNode;
      if (node) node.rbParent = parent;
    }

    if (!isRed) {
      while (parent && (!node || !node.rbRed)) {
        if (node === parent.rbLeft) {
          let sibling = parent.rbRight;
          if (sibling && sibling.rbRed) {
            sibling.rbRed = false;
            parent.rbRed = true;
            this.rbRotateLeft(parent);
            sibling = parent.rbRight;
          }
          if (sibling) {
            const siblingLeftRed = sibling.rbLeft && sibling.rbLeft.rbRed;
            const siblingRightRed = sibling.rbRight && sibling.rbRight.rbRed;
            if (!siblingLeftRed && !siblingRightRed) {
              sibling.rbRed = true;
              node = parent;
              parent = parent.rbParent;
            } else {
              if (!siblingRightRed) {
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
              node = this.root as RBNode;
              parent = null;
            }
          }
        } else {
          let sibling = parent.rbLeft;
          if (sibling && sibling.rbRed) {
            sibling.rbRed = false;
            parent.rbRed = true;
            this.rbRotateRight(parent);
            sibling = parent.rbLeft;
          }
          if (sibling) {
            const siblingLeftRed = sibling.rbLeft && sibling.rbLeft.rbRed;
            const siblingRightRed = sibling.rbRight && sibling.rbRight.rbRed;
            if (!siblingLeftRed && !siblingRightRed) {
              sibling.rbRed = true;
              node = parent;
              parent = parent.rbParent;
            } else {
              if (!siblingLeftRed) {
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
              node = this.root as RBNode;
              parent = null;
            }
          }
        }
      }
      if (node) node.rbRed = false;
    }
  }

  rbRotateLeft(node: RBNode) {
    const p = node;
    const q = node.rbRight;
    if (!q) return;
    const parent = p.rbParent;
    if (parent) {
      if (parent.rbLeft === p) parent.rbLeft = q;
      else parent.rbRight = q;
    } else {
      this.root = q;
    }
    q.rbParent = parent;
    p.rbParent = q;
    p.rbRight = q.rbLeft;
    if (p.rbRight) p.rbRight.rbParent = p;
    q.rbLeft = p;
  }

  rbRotateRight(node: RBNode) {
    const p = node;
    const q = node.rbLeft;
    if (!q) return;
    const parent = p.rbParent;
    if (parent) {
      if (parent.rbLeft === p) parent.rbLeft = q;
      else parent.rbRight = q;
    } else {
      this.root = q;
    }
    q.rbParent = parent;
    p.rbParent = q;
    p.rbLeft = q.rbRight;
    if (p.rbLeft) p.rbLeft.rbParent = p;
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

export interface Site {
  x: number;
  y: number;
  voronoiId: number;
}

export interface SiteInput {
  x: number;
  y: number;
  voronoiId?: number;
}

export interface Bbox {
  xl: number;
  xr: number;
  yt: number;
  yb: number;
}

export class Diagram {
  vertices: Vertex[] = [];
  edges: Edge[] = [];
  cells: Cell[] = [];
  execTime = 0;
}

export class Vertex {
  constructor(
    public x: number,
    public y: number
  ) {}
}

export class Edge {
  va: Vertex | null = null;
  vb: Vertex | null = null;

  constructor(
    public lSite: Site | null = null,
    public rSite: Site | null = null
  ) {}
}

export class Halfedge {
  angle = 0;

  constructor(
    public edge: Edge,
    public site: Site,
    rSite: Site | null
  ) {
    // Safety check for required properties
    if (!edge || !site) {
      throw new Error('Halfedge requires valid edge and site');
    }

    if (rSite) {
      // Calculate angle between sites
      this.angle = Math.atan2(rSite.y - site.y, rSite.x - site.x);
    } else {
      // Calculate angle between vertices
      const va = edge.va;
      const vb = edge.vb;
      
      // Safety check for vertices
      if (!va || !vb) {
        this.angle = 0; // Set default angle
        return;
      }

      // Calculate angle based on edge direction
      this.angle = edge.lSite === site ? 
        Math.atan2(vb.x - va.x, va.y - vb.y) :
        Math.atan2(va.x - vb.x, vb.y - va.y);
    }
  }

  getStartpoint(): Vertex | null {
    if (!this.edge || !this.edge.va || !this.edge.vb) return null;
    return this.edge.lSite === this.site ? this.edge.va : this.edge.vb;
  }

  getEndpoint(): Vertex | null {
    if (!this.edge || !this.edge.va || !this.edge.vb) return null;
    return this.edge.lSite === this.site ? this.edge.vb : this.edge.va;
  }
}

export class Cell {
  halfedges: Halfedge[] = [];
  closeMe = false;

  constructor(
    public site: Site
  ) {}

  init(site: Site) {
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
      if (!edge.vb || !edge.va) halfedges.splice(iHalfedge, 1);
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
      if (edge.lSite !== null && edge.lSite.voronoiId != this.site.voronoiId) neighbors.push(edge.lSite.voronoiId);
      else if (edge.rSite !== null && edge.rSite.voronoiId != this.site.voronoiId) neighbors.push(edge.rSite.voronoiId);
    }
    return neighbors;
  }

  getBbox() {
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let xmin = Infinity;
    let ymin = Infinity;
    let xmax = -Infinity;
    let ymax = -Infinity;
    let v, vx, vy;
    while (iHalfedge--) {
      v = halfedges[iHalfedge].getStartpoint();
      if (!v) continue;
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
      height: ymax - ymin,
    };
  }

  pointIntersection(x: number, y: number) {
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let halfedge;
    let p0, p1, r;
    while (iHalfedge--) {
      halfedge = halfedges[iHalfedge];
      p0 = halfedge.getStartpoint();
      p1 = halfedge.getEndpoint();
      if (!p0 || !p1) continue;
      r = (y - p0.y) * (p1.x - p0.x) - (x - p0.x) * (p1.y - p0.y);
      if (!r) return 0;
      if (r > 0) return -1;
    }
    return 1;
  }
}

export class RBNode {
  rbLeft: RBNode | null = null;
  rbNext: RBNode | null = null;
  rbParent: RBNode | null = null;
  rbPrevious: RBNode | null = null;
  rbRed = false;
  rbRight: RBNode | null = null;
}

export class Beachsection extends RBNode {
  site: Site | null = null;
  circleEvent: CircleEvent | null = null;
  edge: Edge | null = null;
}

export class CircleEvent extends RBNode {
  arc: Beachsection | null = null;
  site: Site | null = null;
  x = 0;
  y = 0;
  ycenter = 0;
}
