type Size = { width: number; height: number };

type Point2D = [number, number];
type Vector2D = [number, number];

class PlayCanvas {
  readonly aspectRatio: number;
  readonly originalScale: number;

  constructor(private ctx: CanvasRenderingContext2D, { width, height }: Size) {
    this.aspectRatio = width / height;
    // i.e. size 1 = entire width
    this.originalScale = width;
    // i.e. size 1/100 of width
    ctx.lineWidth = 0.01;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "gray";
  }

  // probably reimplement with other thing... want to minimise actual number of drawing ops
  drawLine(from: Point2D, to: Point2D) {
    this.ctx.moveTo(...from);
    this.ctx.lineTo(...to);
    this.ctx.stroke();
  }

  drawLines(points: Point2D[]) {
    this.ctx.moveTo(...points[0]);
    points.slice(1).forEach(p => this.ctx.lineTo(...p));
    this.ctx.stroke();
  }

  drawPoly(points: Point2D[]) {
    this.ctx.moveTo(...points[0]);
    points.slice(1).forEach(p => this.ctx.lineTo(...p));
    this.ctx.lineTo(...points[0]);
    this.ctx.stroke();
  }

  // TODO move these out of here or mixin somehow... very general/utility things, but is some convenience stuff?
  forTiling(n: number, callback: (point: Point2D, delta: Vector2D) => void) {
    const deltaX = 1 / n;
    const deltaY = 1 / (n * this.aspectRatio);
    for (let i = 0; i < 1; i += deltaX) {
      for (let j = 0; j < 1 / this.aspectRatio; i += deltaY) {
        callback([i, j], [deltaX, deltaY]);
      }
    }
  }
}
