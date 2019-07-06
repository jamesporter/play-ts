import { Size, Point2D, Vector2D } from "../types/play";
import { hsla } from "./colours";

export default class PlayCanvas {
  readonly aspectRatio: number;
  readonly originalScale: number;

  constructor(private ctx: CanvasRenderingContext2D, { width, height }: Size) {
    ctx.resetTransform();
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

  set lineStyle({ cap = "round" }: { cap?: "round" | "butt" | "square" }) {
    this.ctx.lineCap = cap;
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

  forTiling = (
    config: { n: number; type?: "square" | "proportionate"; margin?: number },
    callback: (point: Point2D, delta: Vector2D) => void
  ) => {
    const { n, type = "proportionate", margin = 0 } = config;
    const deltaX = 1 / n;
    const deltaY = 1 / (n * (type === "square" ? 1 : this.aspectRatio));
    for (let i = margin; i < 1 - margin; i += deltaX) {
      for (let j = margin; j < 1 / this.aspectRatio - margin; j += deltaY) {
        callback([i, j], [deltaX, deltaY]);
      }
    }
  };

  forHorizontal = (
    config: {
      n: number;
      margin?: number;
    },
    callback: (point: Point2D, delta: Vector2D) => void
  ) => {
    const { n, margin = 0 } = config;

    const sX = margin;
    const eX = 1 - margin;
    const sY = margin;
    const dY = 1 / this.aspectRatio - 2 * margin;
    const dX = (eX - sX) / n;

    for (let i = 0; i < n; i++) {
      callback([sX + i * dX, sY], [dX, dY]);
    }
  };

  withRandomOrder<C, T extends any[]>(
    iterFn: (config: C, callback: (...args: T) => void) => void,
    config: C,
    cb: (...T) => void
  ) {
    const args: T[] = [];
    iterFn(config, (...as: T) => {
      args.push(as);
    });
    this.shuffle(args);

    for (let a of args) {
      cb(...a);
    }
  }

  shuffle<T>(items: T[]): T[] {
    let currentIndex = items.length;
    let temporaryValue: T;
    let randomIndex = 0;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = items[currentIndex];
      items[currentIndex] = items[randomIndex];
      items[randomIndex] = temporaryValue;
    }

    return items;
  }

  doProportion(p: number, callback: () => void) {
    if (Math.random() < p) {
      callback();
    }
  }

  proportionately(cases: [number, () => void][]) {
    const total = cases.map(c => c[0]).reduce((a, b) => a + b, 0);
    if (total <= 0) throw new Error("Must be positive total");
    let r = Math.random() * total;

    for (let i = 0; i < cases.length; i++) {
      if (cases[i][0] > r) {
        cases[i][1]();
        return;
      } else {
        r -= cases[i][0];
      }
    }
  }

  get info() {
    return {
      stroke: this.ctx.strokeStyle,
      fill: this.ctx.fillStyle
    };
  }
}
