import { Size, Point2D, Vector2D } from "../types/play";
import { hsla } from "./colours";

export default class PlayCanvas {
  readonly aspectRatio: number;
  readonly originalScale: number;

  constructor(private ctx: CanvasRenderingContext2D, { width, height }: Size) {
    this.aspectRatio = width / height;
    // i.e. size 1 = entire width
    this.originalScale = width;
    // i.e. size 1/100 of width
    ctx.scale(width, width);
    ctx.lineWidth = 0.01;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "gray";
  }

  get meta() {
    return {
      dimensions: {
        top: 0,
        bottom: 1 / this.aspectRatio,
        right: 1,
        left: 0
      }
    };
  }

  set lineWidth(width: number) {
    this.ctx.lineWidth = width;
  }

  setFillColour(h: number, s: number, l: number, a: number = 1) {
    this.ctx.fillStyle = hsla(h, s, l, a);
  }

  setStrokeColour(h: number, s: number, l: number, a: number = 1) {
    this.ctx.strokeStyle = hsla(h, s, l, a);
  }

  pushStyle() {}

  popStyle() {}

  // probably reimplement with other thing... want to minimise actual number of drawing ops
  drawLine(from: Point2D, to: Point2D) {
    this.ctx.beginPath();
    this.ctx.moveTo(...from);
    this.ctx.lineTo(...to);
    this.ctx.stroke();
  }

  drawLines(points: Point2D[]) {
    this.ctx.beginPath();
    this.ctx.moveTo(...points[0]);
    points.slice(1).forEach(p => this.ctx.lineTo(...p));
    this.ctx.stroke();
  }

  drawPoly(points: Point2D[]) {
    this.ctx.beginPath();
    this.ctx.moveTo(...points[0]);
    points.slice(1).forEach(p => this.ctx.lineTo(...p));
    this.ctx.lineTo(...points[0]);
    this.ctx.stroke();
  }

  fillRect(location: Point2D, size: Vector2D) {
    this.ctx.fillRect(location[0], location[1], size[0], size[1]);
  }

  forTiling(
    config: { n: number; type?: "square" | "proportionate"; margin?: number },
    callback: (point: Point2D, delta: Vector2D) => void
  ) {
    const { n, type = "proportionate", margin = 0 } = config;
    const deltaX = 1 / n;
    const deltaY = 1 / (n * (type === "square" ? 1 : this.aspectRatio));
    for (let i = margin; i < 1 - margin; i += deltaX) {
      for (let j = margin; j < 1 / this.aspectRatio - margin; j += deltaY) {
        callback([i, j], [deltaX, deltaY]);
      }
    }
  }

  doProportion(p: number, callback: () => void) {
    if (Math.random() < p) {
      callback();
    }
  }

  get info() {
    return {
      stroke: this.ctx.strokeStyle,
      fill: this.ctx.fillStyle
    };
  }
}
