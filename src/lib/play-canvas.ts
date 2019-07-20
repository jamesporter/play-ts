import { Size, Point2D, Vector2D } from "./types/play";
import { hsla } from "./colours";
import { Traceable, TextConfig, Text, Rect } from "./path";
import Prando from "prando";

export interface Gradientable {
  gradient(ctx: CanvasRenderingContext2D): CanvasGradient;
}

export default class PlayCanvas {
  readonly aspectRatio: number;
  readonly originalScale: number;
  readonly rng: Prando;

  constructor(
    private ctx: CanvasRenderingContext2D,
    { width, height }: Size,
    rngSeed?: string | number
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

    this.rng = new Prando(rngSeed);
  }

  get meta() {
    return {
      top: 0,
      bottom: 1 / this.aspectRatio,
      right: 1,
      left: 0,
      aspectRatio: this.aspectRatio,
      center: [0.5, 0.5 / this.aspectRatio] as [number, number]
    };
  }

  set lineWidth(width: number) {
    this.ctx.lineWidth = width;
  }

  set lineStyle({ cap = "round" }: { cap?: "round" | "butt" | "square" }) {
    this.ctx.lineCap = cap;
  }

  background(h: number, s: number, l: number, a: number = 1) {
    this.ctx.fillStyle = hsla(h, s, l, a);
    const { right, bottom } = this.meta;
    this.fill(new Rect({ at: [0, 0], w: right, h: bottom }));
  }

  backgroundGradient(gradient: Gradientable) {
    this.ctx.fillStyle = gradient.gradient(this.ctx);
    const { right, bottom } = this.meta;
    this.fill(new Rect({ at: [0, 0], w: right, h: bottom }));
  }

  setStrokeColour(h: number, s: number, l: number, a: number = 1) {
    this.ctx.strokeStyle = hsla(h, s, l, a);
  }

  setFillColour(h: number, s: number, l: number, a: number = 1) {
    this.ctx.fillStyle = hsla(h, s, l, a);
  }

  setStrokeGradient(gradient: Gradientable) {
    this.ctx.strokeStyle = gradient.gradient(this.ctx);
  }

  setFillGradient(gradient: Gradientable) {
    this.ctx.fillStyle = gradient.gradient(this.ctx);
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

  drawText(config: TextConfig, text: string) {
    new Text({ ...config, kind: "stroke" }, text).textIn(this.ctx);
  }

  fillText(config: TextConfig, text: string) {
    new Text({ ...config, kind: "fill" }, text).textIn(this.ctx);
  }

  forTiling = (
    config: { n: number; type?: "square" | "proportionate"; margin?: number },
    callback: (point: Point2D, delta: Vector2D) => void
  ) => {
    const { n, type = "proportionate", margin = 0 } = config;
    const nY = type === "square" ? Math.floor(n * (1 / this.aspectRatio)) : n;
    const deltaX = (1 - margin * 2) / n;

    const hY =
      type === "square" ? deltaX * nY : 1 / this.aspectRatio - 2 * margin;
    const deltaY = hY / nY;

    const sX = margin;
    const sY = (1 / this.aspectRatio - hY) / 2;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < nY; j++) {
        callback([sX + i * deltaX, sY + j * deltaY], [deltaX, deltaY]);
      }
    }
  };

  forHorizontal = (
    config: {
      n: number;
      margin?: number;
    },
    callback: (point: Point2D, delta: Vector2D, i: number) => void
  ) => {
    const { n, margin = 0 } = config;

    const sX = margin;
    const eX = 1 - margin;
    const sY = margin;
    const dY = 1 / this.aspectRatio - 2 * margin;
    const dX = (eX - sX) / n;

    for (let i = 0; i < n; i++) {
      callback([sX + i * dX, sY], [dX, dY], i);
    }
  };

  forVertical = (
    config: {
      n: number;
      margin?: number;
    },
    callback: (point: Point2D, delta: Vector2D, i: number) => void
  ) => {
    const { n, margin = 0 } = config;

    const sX = margin;
    const eY = 1 / this.aspectRatio - margin;
    const sY = margin;
    const dX = 1 - 2 * margin;
    const dY = (eY - sY) / n;

    for (let i = 0; i < n; i++) {
      callback([sX, sY + i * dY], [dX, dY], i);
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
    this.shuffle(args);

    for (let a of args) {
      cb(...a);
    }
  }

  doProportion(p: number, callback: () => void) {
    if (this.rng.next() < p) {
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
    callback: (point: Point2D, i: number) => void
  ) => {
    const { n, cX = 0.5, cY = 0.5 / this.aspectRatio, radius = 0.25 } = config;
    const da = (Math.PI * 2) / n;

    let a = -Math.PI * 0.5;
    for (let i = 0; i < n; i++) {
      const rr = 2 * this.rng.next() + 1;
      callback(
        [cX + radius * Math.cos(a + da), cY + radius * Math.sin(a + da)],
        i
      );
      a += da;
    }
  };

  proportionately<T>(cases: [number, () => T][]): T {
    const total = cases.map(c => c[0]).reduce((a, b) => a + b, 0);
    if (total <= 0) throw new Error("Must be positive total");
    let r = this.rng.next() * total;

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
    return [this.rng.next(), this.rng.next() / this.aspectRatio];
  }

  range(
    config: { from: number; to: number; n: number; inclusive?: boolean },
    callback: (n: number) => void
  ) {
    const { from = 0, to = 1, n, inclusive = true } = config;

    const di = (to - from) / n;
    const max = inclusive ? n : n - 1;
    for (let i = 0; i <= max; i++) {
      callback(i * di + from);
    }
  }

  inDrawing = (point: Point2D): boolean => {
    const { left, right, top, bottom } = this.meta;
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

  // Transforms

  private pushState() {
    this.ctx.save();
  }

  private popState() {
    this.ctx.restore();
  }

  withRotation = (angle: number, callback: () => void) => {
    this.pushState();
    this.ctx.rotate(angle);
    callback();
    this.popState();
  };

  withScale = (scale: Vector2D, callback: () => void) => {
    this.pushState();
    this.ctx.scale(scale[0], scale[1]);
    callback();
    this.popState();
  };

  withTranslation = (translation: Vector2D, callback: () => void) => {
    this.pushState();
    this.ctx.translate(translation[0], translation[1]);
    callback();
    this.popState();
  };

  withTransform = (
    config: {
      hScale: number;
      hskew: number;
      vSkew: number;
      vScaling: number;
      dX: number;
      dY: number;
    },
    callback: () => void
  ) => {
    this.pushState();
    const { hScale, hskew, vSkew, vScaling, dX, dY } = config;
    this.ctx.transform(hScale, hskew, vSkew, vScaling, dX, dY);
    callback();
    this.popState();
  };

  // Randomness

  random = (): number => {
    return this.rng.next();
  };

  uniformRandomInt = (config: {
    from?: number;
    to: number;
    inclusive?: boolean;
  }) => {
    const { to, from = 0, inclusive = true } = config;
    const d = to - from + (inclusive ? 1 : 0);
    return from + Math.floor(this.rng.next() * d);
  };

  randomPolarity = (): 1 | -1 => {
    return this.rng.next() > 0.5 ? 1 : -1;
  };

  sample = <T>(from: T[]): T => {
    return from[Math.floor(this.rng.next() * from.length)];
  };

  samples = <T>(n: number, from: T[]): T[] => {
    let res: T[] = [];
    for (let i = 0; i < n; i++) {
      res.push(this.sample(from));
    }
    return res;
  };

  shuffle = <T>(items: T[]): T[] => {
    let currentIndex = items.length;
    let temporaryValue: T;
    let randomIndex = 0;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(this.rng.next() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = items[currentIndex];
      items[currentIndex] = items[randomIndex];
      items[randomIndex] = temporaryValue;
    }

    return items;
  };

  perturb = ([x, y]: Point2D, config: { magnitude?: number } = {}): Point2D => {
    const { magnitude = 0.1 } = config;
    return [
      x + magnitude * (this.rng.next() - 0.5),
      y + magnitude * (this.rng.next() - 0.5)
    ];
  };

  gaussian = (config?: { mean?: number; sd?: number }): number => {
    const { mean = 0, sd = 1 } = config || {};
    const a = this.rng.next();
    const b = this.rng.next();
    const n = Math.sqrt(-2.0 * Math.log(a)) * Math.cos(2.0 * Math.PI * b);
    return mean + n * sd;
  };

  poisson = (lambda: number): number => {
    const limit = Math.exp(-lambda);
    let prod = this.rng.next();
    let n = 0;
    while (prod >= limit) {
      n++;
      prod *= this.rng.next();
    }
    return n;
  };
}
