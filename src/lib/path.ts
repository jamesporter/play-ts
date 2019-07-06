import { Point2D } from "../types/play";
import v from "./vectors";

export class SimplePath {
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

  chaiken(iterations: number): SimplePath {
    // TODO
    return this;
  }
}

type PathEdge =
  | { kind: "line"; from: Point2D; to: Point2D }
  | { kind: "quad"; from: Point2D; to: Point2D; control: Point2D }
  | {
      kind: "cubic";
      from: Point2D;
      to: Point2D;
      control1: Point2D;
      control2: Point2D;
    };

type CurveConfig =
  | {
      curveSize: number;
    }
  | {
      curveSize: number;
      curveAngle: number;
    }
  | {
      curveSize: number;
      curveAngle: number;
      bulbousness: number;
    }
  | {
      curveSize: number;
      curveAngle: number;
      bulbousness: number;
      twist: number;
    };

export class Path {
  private currentPoint: Point2D;
  private edges: PathEdge[];

  private constructor(path: Point2D) {
    this.currentPoint = path;
  }

  static startAt(point: Point2D): Path {
    return new Path(point);
  }

  addLineTo(point: Point2D): Path {
    this.edges.push({
      kind: "line",
      from: this.currentPoint,
      to: point
    });
    this.currentPoint = point;
    return this;
  }

  addCurveTo(point: Point2D, config: CurveConfig);

  traceIn(ctx: CanvasRenderingContext2D) {
    const { from } = this.edges[0];
    ctx.moveTo(...from);
    for (let edge of this.edges) {
      switch (edge.kind) {
        case "line":
          ctx.lineTo(...edge.to);
          break;
        case "quad": {
          const { to, control } = edge;
          ctx.quadraticCurveTo(to[0], to[1], control[0], control[1]);
          break;
        }
        case "cubic": {
          const { to, control1, control2 } = edge;
          ctx.bezierCurveTo(
            to[0],
            to[1],
            control1[0],
            control1[1],
            control2[0],
            control2[1]
          );
          break;
        }
      }
    }
  }

  get svgPath() {
    return "TODO";
  }
}
