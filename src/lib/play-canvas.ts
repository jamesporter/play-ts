import { Size, Point2D, Vector2D } from "../types/play";
import { hsla } from "./colours";
import { Path, Traceable } from "./path";
import { shuffle } from "./collectionOps";

export default class PlayCanvas {
  readonly aspectRatio: number;
  readonly originalScale: number;

  constructor(
    private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    { width, height }: Size
  ) {
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

  // probably reimplement with other thing... want to minimise actual number of drawing ops
  drawLine(from: Point2D, to: Point2D) {
    this.ctx.beginPath();
    this.ctx.moveTo(...from);
    this.ctx.lineTo(...to);
    this.ctx.stroke();
  }

  draw(traceable: Traceable) {
    this.ctx.beginPath();
    traceable.traceIn(this.ctx);
    this.ctx.stroke();
  }

  fill(traceable: Traceable) {
    this.ctx.beginPath();
    traceable.traceIn(this.ctx);
    this.ctx.fill();
  }

  forTiling = (
    config: { n: number; type?: "square" | "proportionate"; margin?: number },
    callback: (point: Point2D, delta: Vector2D) => void
  ) => {
    // TODO this isn't done yet... need to take margin properly into account, probably add more
    // to allow for square tiling etc
    const { n, type = "proportionate", margin = 0 } = config;
    const deltaX = (1 - margin * 2) / n;
    const deltaY =
      (1 - margin * 2) / (n * (type === "square" ? 1 : this.aspectRatio));
    for (let i = margin; i < 1 - 1.0001 * margin; i += deltaX) {
      for (
        let j = margin;
        j < 1 / this.aspectRatio - 1.0001 * margin;
        j += deltaY
      ) {
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

  forVertical = (
    config: {
      n: number;
      margin?: number;
    },
    callback: (point: Point2D, delta: Vector2D) => void
  ) => {
    const { n, margin = 0 } = config;

    const sX = margin;
    const eY = 1 / this.aspectRatio - margin;
    const sY = margin;
    const dX = 1 - 2 * margin;
    const dY = (eY - sY) / n;

    for (let i = 0; i < n; i++) {
      callback([sX, sY + i * dY], [dX, dY]);
    }
  };

  /*
    Build something using other iteration utlities rather than drawing within callback

    I tried a  curried version with first argument so could compose with random order etc, but TypeScript wasn't figuring out types properly at use site. Would probably require explicit annotation so don't want that.
  */
  build = <C, T extends any[], U>(
    iterFn: (config: C, callback: (...args: T) => void) => void,
    config: C,
    cb: (...args: T) => U
  ): U[] => {
    const res: U[] = [];
    iterFn(config, (...as: T) => {
      res.push(cb(...as));
    });
    return res;
  };

  /*
    Take existing iteration function and apply in random order
  */
  withRandomOrder<C, T extends any[]>(
    iterFn: (config: C, callback: (...args: T) => void) => void,
    config: C,
    cb: (...args: T) => void
  ) {
    const args: T[] = [];
    iterFn(config, (...as: T) => {
      args.push(as);
    });
    shuffle(args);

    for (let a of args) {
      cb(...a);
    }
  }

  doProportion(p: number, callback: () => void) {
    if (Math.random() < p) {
      callback();
    }
  }

  times(n: number, callback: (n: number) => void) {
    for (let i = 0; i < n; i++) {
      callback(i);
    }
  }

  aroundCircle = (
    config: {
      cX?: number;
      cY?: number;
      radius?: number;
      n: number;
    },
    callback: (point: Point2D) => void
  ) => {
    const { n, cX = 0.5, cY = 0.5 / this.aspectRatio, radius = 0.25 } = config;
    const da = (Math.PI * 2) / n;
    for (let a = 0; a < Math.PI * 2; a += da) {
      const rr = 2 * Math.random() + 1;
      callback([
        cX + radius * Math.cos(a + da),
        cY + radius * Math.sin(a + da)
      ]);
    }
  };

  proportionately<T>(cases: [number, () => T][]): T {
    const total = cases.map(c => c[0]).reduce((a, b) => a + b, 0);
    if (total <= 0) throw new Error("Must be positive total");
    let r = Math.random() * total;

    for (let i = 0; i < cases.length; i++) {
      if (cases[i][0] > r) {
        return cases[i][1]();
      } else {
        r -= cases[i][0];
      }
    }
    //fallback *should never happen!*
    return cases[0][1]();
  }

  get randomPoint(): Point2D {
    return [Math.random(), Math.random() / this.aspectRatio];
  }

  range(
    config: { from: number; to: number; steps: number; inclusive?: boolean },
    callback: (n: number) => void
  ) {
    const { from = 0, to = 1, steps, inclusive = true } = config;

    const di = (to - from) / steps;
    const max = inclusive ? steps : steps - 1;
    for (let i = 0; i <= max; i++) {
      callback(i * di + from);
    }
  }

  inDrawing = (point: Point2D): boolean => {
    const {
      dimensions: { left, right, top, bottom }
    } = this.meta;
    return (
      point[0] > left && point[0] < right && point[1] > top && point[1] < bottom
    );
  };

  get info() {
    return {
      stroke: this.ctx.strokeStyle,
      fill: this.ctx.fillStyle
    };
  }
}
