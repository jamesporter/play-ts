import { Point2D } from "../types/play";
import v from "./vectors";

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

  addPoint(point: Point2D): SimplePath {
    this.points.push(point);
    return this;
  }

  close(): SimplePath {
    if (this.points[0]) this.points.push(this.points[0]);
    return this;
  }

  chaiken(iterations: number = 1): SimplePath {
    // TODO
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

    console.log({
      u,
      d,
      m,
      perp,
      rotatedPerp
    });

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
    console.log(this.edges[this.edges.length - 1]);
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
