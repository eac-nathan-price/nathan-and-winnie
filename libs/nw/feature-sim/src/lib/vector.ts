export class Vector2 {
  constructor(
    public x: number,
    public y: number
  ) {}
}

export class Vector3 {
  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}
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

  static vector3(box: Box3) {
    return new Vector3(
      Random.float(box.xMin, box.xMax),
      Random.float(box.yMin, box.yMax),
      Random.float(box.zMin, box.zMax)
    );
  }
}
