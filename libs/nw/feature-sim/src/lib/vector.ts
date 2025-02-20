export class Vector2 {
  constructor(
    public x: number,
    public y: number
  ) {}

  toVector3(z = 0) {
    return new Vector3(this.x, this.y, z);
  }

  static distance(a: Vector2, b: Vector2) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  static lerp(a: Vector2, b: Vector2, t: number) {
    return new Vector2(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t
    );
  }

  static normalize(a: Vector2) {
    const length = Math.sqrt(a.x ** 2 + a.y ** 2);
    return new Vector2(a.x / length, a.y / length);
  }

  static nudge(a: Vector2, b: Vector2, d: number) {
    const direction = Vector2.normalize(Vector2.subtract(b, a));
    return Vector2.add(a, Vector2.multiply(direction, d));
  }

  static add(a: Vector2, b: Vector2) {
    return new Vector2(
      a.x + b.x,
      a.y + b.y
    );
  }

  static subtract(a: Vector2, b: Vector2) {
    return new Vector2(
      a.x - b.x,
      a.y - b.y
    );
  }

  static multiply(v: Vector2, scalar: number) {
    return new Vector2(
      v.x * scalar,
      v.y * scalar
    );
  }

  static divide(v: Vector2, scalar: number) {
    return new Vector2(
      v.x / scalar,
      v.y / scalar
    );
  }
}

export class Vector3 {
  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}

  toVector2() {
    return new Vector2(this.x, this.y);
  }

  static distance(a: Vector3, b: Vector3) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
  }

  static lerp(a: Vector3, b: Vector3, t: number) {
    return new Vector3(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t
    );
  }

  static normalize(a: Vector3) {
    const length = Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2);
    return new Vector3(a.x / length, a.y / length, a.z / length);
  }

  static nudge(a: Vector3, b: Vector3, d: number) {
    const direction = Vector3.normalize(Vector3.subtract(b, a));
    return Vector3.add(a, Vector3.multiply(direction, d));
  }

  static add(a: Vector3, b: Vector3) {
    return new Vector3(
      a.x + b.x,
      a.y + b.y,
      a.z + b.z
    );
  }

  static subtract(a: Vector3, b: Vector3) {
    return new Vector3(
      a.x - b.x,
      a.y - b.y,
      a.z - b.z
    );
  }

  static multiply(v: Vector3, scalar: number) {
    return new Vector3(
      v.x * scalar,
      v.y * scalar,
      v.z * scalar
    );
  }

  static divide(v: Vector3, scalar: number) {
    return new Vector3(
      v.x / scalar,
      v.y / scalar,
      v.z / scalar
    );
  }
}

export type Bounds2 = [
  number, // xMin
  number, // yMin
  number, // xMax
  number  // yMax
];

export type Bounds3 = [
  number, // xMin
  number, // yMin
  number, // zMin
  number, // xMax
  number, // yMax
  number  // zMax
];

export class Box2 {
  constructor(
    public xMin: number,
    public yMin: number,
    public xMax: number,
    public yMax: number
  ) {}

  bounds() {
    return [
      this.xMin,
      this.yMin,
      this.xMax,
      this.yMax
    ] as Bounds2;
  }
}

export class Box3 {
  constructor(
    public xMin: number,
    public yMin: number,
    public zMin: number,
    public xMax: number,
    public yMax: number,
    public zMax: number
  ) {}

  bounds() {
    return [
      this.xMin,
      this.yMin,
      this.zMin,
      this.xMax,
      this.yMax,
      this.zMax
    ] as Bounds3;
  }
}

export class Random {
  static float(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  static int(min: number, max: number) {
    return Math.floor(Random.float(min, max));
  }
  
  static vector2(box: Box2) {
    return new Vector2(
      Random.float(box.xMin, box.xMax),
      Random.float(box.yMin, box.yMax)
    );
  }

  static vector2s(box: Box2, count: number) {
    return Array.from({ length: count }, () => Random.vector2(box));
  }

  static vector3(box: Box3) {
    return new Vector3(
      Random.float(box.xMin, box.xMax),
      Random.float(box.yMin, box.yMax),
      Random.float(box.zMin, box.zMax)
    );
  }

  static vector3s(box: Box3, count: number) {
    return Array.from({ length: count }, () => Random.vector3(box));
  }
}
