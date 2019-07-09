import { Point2D } from "../types/play";
import v from "./vectors";
import { tripleWise } from "./collectionOps";

export interface Traceable {
  traceIn(ctx: CanvasRenderingContext2D);
}

export interface SVGPathable {
  svgPath: string;
}

export class SimplePath implements Traceable {
  private constructor(private points: Point2D[] = []) {}

  static startAt(point: Point2D): SimplePath {
    return new SimplePath([point]);
  }

  static withPoints(points: Point2D[]): SimplePath {
    return new SimplePath(points);
  }

  addPoint(point: Point2D): SimplePath {
    this.points.push(point);
    return this;
  }

  close(): SimplePath {
    if (this.points[0]) this.points.push(this.points[0]);
    return this;
  }

  chaiken(iterations: number = 1): SimplePath {
    for (let i = 0; i < iterations; i++) {
      this.points = this.points
        .slice(0, 1)
        .concat(
          tripleWise(this.points).flatMap(([a, b, c]) => [
            v.pointAlong(b, a, 0.25),
            v.pointAlong(b, c, 0.25)
          ])
        )
        .concat(this.points.slice(this.points.length - 1));
    }
    return this;
  }

  traceIn = (ctx: CanvasRenderingContext2D) => {
    const from = this.points[0];
    ctx.moveTo(...from);
    for (let point of this.points.slice(1)) {
      ctx.lineTo(...point);
    }
  };
}

type PathEdge =
  | { kind: "line"; from: Point2D; to: Point2D }
  | {
      kind: "cubic";
      from: Point2D;
      to: Point2D;
      control1: Point2D;
      control2: Point2D;
    };

type CurveConfig = {
  polarlity?: 1 | -1;
  curveSize?: number;
  curveAngle?: number;
  bulbousness?: number;
  twist?: number;
};

export class Path implements Traceable, SVGPathable {
  private currentPoint: Point2D;
  private edges: PathEdge[] = [];

  private constructor(path: Point2D) {
    this.currentPoint = path;
  }

  static startAt(point: Point2D): Path {
    return new Path(point);
  }

  addLineTo = (point: Point2D): Path => {
    this.edges.push({
      kind: "line",
      from: this.currentPoint,
      to: point
    });
    this.currentPoint = point;
    return this;
  };

  addCurveTo = (point: Point2D, config: CurveConfig = {}): Path => {
    const {
      curveSize = 1,
      polarlity = 1,
      bulbousness = 1,
      curveAngle = 0,
      twist = 0
    } = config;

    const u = v.subtract(point, this.currentPoint);
    const d = v.magnitude(u);
    const m = v.add(this.currentPoint, v.scale(u, 0.5));
    const perp = v.normalise(v.rotate(u, -Math.PI / 2));
    const rotatedPerp = v.rotate(perp, curveAngle);
    const controlMid = v.add(
      m,
      v.scale(rotatedPerp, curveSize * polarlity * d * 0.5)
    );
    const perpOfRot = v.normalise(v.rotate(rotatedPerp, -Math.PI / 2 - twist));

    const control1 = v.add(
      controlMid,
      v.scale(perpOfRot, (bulbousness * d) / 2)
    );
    const control2 = v.add(
      controlMid,
      v.scale(perpOfRot, (-bulbousness * d) / 2)
    );

    this.edges.push({
      kind: "cubic",
      control1,
      control2,
      to: point,
      from: this.currentPoint
    });
    this.currentPoint = point;
    return this;
  };

  traceIn = (ctx: CanvasRenderingContext2D) => {
    const { from } = this.edges[0];
    ctx.moveTo(...from);
    for (let edge of this.edges) {
      switch (edge.kind) {
        case "line":
          ctx.lineTo(...edge.to);
          break;
        case "cubic": {
          const { to, control1, control2 } = edge;
          ctx.bezierCurveTo(
            control1[0],
            control1[1],
            control2[0],
            control2[1],
            to[0],
            to[1]
          );
          break;
        }
      }
    }
  };

  get svgPath(): string {
    return "TODO";
  }
}

export class Arc implements Traceable {
  readonly cX: number;
  readonly cY: number;
  readonly radius: number;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly antiClockwise: boolean;

  constructor(config: {
    cX: number;
    cY: number;
    radius: number;
    startAngle: number;
    endAngle: number;
  }) {
    const { cX, cY, radius, startAngle, endAngle } = config;
    const antiClockwise = startAngle > endAngle;

    this.cX = cX;
    this.cY = cY;
    this.radius = radius;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.antiClockwise = antiClockwise;
  }
  traceIn = (ctx: CanvasRenderingContext2D) => {
    if (Math.abs(this.startAngle - this.endAngle) > 0.0001)
      ctx.moveTo(this.cX, this.cY);

    ctx.arc(
      this.cX,
      this.cY,
      this.radius,
      this.startAngle,
      this.endAngle,
      this.antiClockwise
    );
    if (this.startAngle - this.endAngle > 0.0001) ctx.lineTo(this.cX, this.cX);
  };
}

export class Rect implements Traceable {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;

  constructor(config: { x: number; y: number; w: number; h: number }) {
    const { x, y, w, h } = config;

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  traceIn = (ctx: CanvasRenderingContext2D) => {
    ctx.rect(this.x, this.y, this.w, this.h);
  };

  split = (config: {
    orientation: "vertical" | "horizontal";
    split?: number | number[];
  }): Rect[] => {
    let { orientation, split } = config;
    split = split || 0.5;

    if (orientation === "horizontal") {
      if (typeof split === "number") {
        return [
          new Rect({ x: this.x, y: this.y, w: this.w / 2, h: this.h }),
          new Rect({
            x: this.x + this.w / 2,
            y: this.y,
            w: this.w / 2,
            h: this.h
          })
        ];
      } else {
        const total = split.reduce((a, b) => a + b, 0);
        const proportions = split.map(s => s / total);
        let xDxs: [number, number][] = [];
        let c = 0;
        proportions.forEach(p => {
          xDxs.push([c, p * this.w]);
          c += p * this.w;
        });

        return xDxs.map(
          ([x, dX], i) =>
            new Rect({
              x: this.x + x,
              y: this.y,
              w: dX,
              h: this.h
            })
        );
      }
    } else {
      if (typeof split === "number") {
        return [
          new Rect({ x: this.x, y: this.y, w: this.w, h: this.h / 2 }),
          new Rect({
            x: this.x,
            y: this.y + this.h / 2,
            w: this.w,
            h: this.h / 2
          })
        ];
      } else {
        const total = split.reduce((a, b) => a + b, 0);
        const proportions = split.map(s => s / total);
        let yDys: [number, number][] = [];
        let c = 0;
        proportions.forEach(p => {
          yDys.push([c, p * this.h]);
          c += p * this.h;
        });

        return yDys.map(
          ([y, dY], i) =>
            new Rect({
              x: this.x,
              y: this.y + y,
              w: this.w,
              h: dY
            })
        );
      }
    }
  };
}
