import { Play, Point2D } from "./types/play";
import PlayCanvas from "./lib/play-canvas";
import { Path, SimplePath } from "./lib/path";
import vectors from "./lib/vectors";

const sketch = (play: Play) => {
  const {
    context: c,
    meta: { width, height }
  } = play;

  const pts = new PlayCanvas(c, { width, height });

  const {
    dimensions: { top, left, right, bottom }
  } = pts.meta;
  pts.setFillColour(0, 0, 100);
  pts.fillRect([left, top], [right, bottom]);

  pts.lineStyle = { cap: "round" };

  pts.withRandomOrder(
    pts.forTiling,
    { n: 20, type: "square", margin: 0.1 },
    ([i, j], [di, dj]) => {
      pts.doProportion(0.7, () => {
        pts.setStrokeColour(i * 100, 80, 30 + j * 30, 0.9);
        pts.lineWidth = 0.02 + 0.02 * (1 - i);
        pts.drawLine(
          [i + di / 4, j + dj / 4],
          [
            i + (di * 3 * j * pts.randomPolarity()) / 4,
            j + (dj * 5 * (1 + Math.random())) / 4
          ]
        );
      });
    }
  );
};

const sketch2 = (play: Play) => {
  const {
    context: c,
    meta: { width, height }
  } = play;

  const pts = new PlayCanvas(c, { width, height });

  pts.forHorizontal({ n: 20, margin: 0.1 }, ([x, y], [dX, dY]) => {
    pts.setStrokeColour(x * 360, 90, 40);
    pts.drawLine([x, y], [x + dX, y + dY]);
  });
};

const sketch4 = (play: Play) => {
  const {
    context: c,
    meta: { width, height }
  } = play;

  const p = new PlayCanvas(c, { width, height });

  p.forVertical({ n: 20, margin: 0.1 }, ([x, y], [dX, dY]) => {
    const points = p.build(p.range, { from: x, to: x + dX, steps: 20 }, vX => {
      return vectors.perturb([vX, y + dY / 2], { magnitude: dY / 4 });
    });

    p.setStrokeColour(y * 60, 90, 40);
    p.drawPath(SimplePath.withPoints(points));
  });
};

const sketch3 = (play: Play) => {
  const {
    context: c,
    meta: { width, height }
  } = play;

  const pts = new PlayCanvas(c, { width, height });

  pts.forTiling({ n: 20, margin: 0.1, type: "square" }, ([x, y], [dX, dY]) => {
    pts.lineStyle = { cap: "round" };
    pts.proportionately([
      [
        1,
        () => {
          pts.setStrokeColour(120 + x * 120, 90 - 20 * y, 40);
          pts.drawLine([x, y], [x + dX, y + dY]);
        }
      ],
      [
        2,
        () => {
          pts.setStrokeColour(120 + x * 120, 90 - 20 * y, 40);
          pts.drawLine([x + dX, y], [x, y + dY]);
        }
      ]
    ]);
  });
};

const flower = (play: Play) => {
  const {
    context: c,
    meta: { width, height }
  } = play;

  const p = new PlayCanvas(c, { width, height });
  p.lineStyle = { cap: "round" };

  const {
    dimensions: { right, bottom }
  } = p.meta;

  const midX = right / 2;
  const midY = bottom / 2;
  const ir = midX / 4;
  const da = Math.PI / 10;

  let path = Path.startAt([midX + ir, midY]);
  for (let a = 0; a < Math.PI * 2; a += da) {
    const pt: Point2D = [
      midX + ir * Math.cos(a + da),
      midY + ir * Math.sin(a + da)
    ];

    path.addCurveTo(pt, {
      curveSize: 12,
      bulbousness: 2,
      curveAngle: Math.random() / 8
    });
  }
  p.setFillColour(40, 90, 50);
  p.fillPath(path);
  p.lineWidth = 0.005;
  p.setStrokeColour(20, 90, 50);
  p.drawPath(path);
};

const curves1 = (play: Play) => {
  const {
    context: c,
    meta: { width, height }
  } = play;

  const p = new PlayCanvas(c, { width, height });

  p.lineStyle = { cap: "round" };
  p.forTiling({ n: 12, margin: 0.1 }, ([x, y], [dX, dY]) => {
    p.setStrokeColour(20 + x * 50, 90 - 20 * y, 50);
    p.drawPath(
      Path.startAt([x, y + dY]).addCurveTo([x + dX, y + dY], {
        polarlity: p.randomPolarity(),
        curveSize: x * 2,
        curveAngle: x,
        bulbousness: y
      })
    );
  });
};

const chaiken = (play: Play) => {
  const {
    context: c,
    meta: { width, height }
  } = play;

  const p = new PlayCanvas(c, { width, height });
  const {
    dimensions: { right, bottom }
  } = p.meta;

  p.lineStyle = { cap: "round" };

  const midX = right / 2;
  const midY = bottom / 2;
  const ir = midX / 4;
  const da = Math.PI / 10;

  p.times(30, n => {
    let points: Point2D[] = [];
    for (let a = 0; a < Math.PI * 2; a += da) {
      const rr = 2 * Math.random() + 1;
      points.push([
        midX + ir * rr * Math.cos(a + da),
        midY + ir * rr * Math.sin(a + da)
      ]);
    }
    const sp = SimplePath.startAt(points[0]);
    points.slice(1).forEach(p => sp.addPoint(p));
    sp.close();
    sp.chaiken(4);
    p.lineWidth = 0.005;
    p.setStrokeColour(190 + n, 90, 40, 0.75);
    p.drawPath(sp);
  });
};

const tilesOfChaiken = (play: Play) => {
  const {
    context: c,
    meta: { width, height }
  } = play;

  const p = new PlayCanvas(c, { width, height });
  p.lineStyle = { cap: "round" };

  p.forTiling({ n: 6, type: "square", margin: 0.1 }, ([x, y], [dX, dY]) => {
    const midX = x + dX / 2;
    const midY = y + dY / 2;
    const ir = dX / 4;
    const da = Math.PI / 10;

    p.times(3, n => {
      let points: Point2D[] = [];
      for (let a = 0; a < Math.PI * 2; a += da) {
        const rr = 2 * Math.random() + 1;
        points.push([
          midX + ir * rr * Math.cos(a + da),
          midY + ir * rr * Math.sin(a + da)
        ]);
      }
      const sp = SimplePath.startAt(points[0]);
      points.slice(1).forEach(p => sp.addPoint(p));
      sp.close();
      sp.chaiken(3);
      p.lineWidth = 0.005;
      p.setStrokeColour(190 + x * 100, 90, 40 + y * 10, 0.75);
      p.drawPath(sp);
    });
  });
};

const circle = (play: Play) => {
  const {
    context: c,
    meta: { width, height }
  } = play;

  const p = new PlayCanvas(c, { width, height });
  p.lineStyle = { cap: "round" };

  p.times(10, n => {
    p.setStrokeColour(0, 0, n + 10, (0.75 * (n + 1)) / 10);
    const points = p.build(p.aroundCircle, { n: 20 }, pt =>
      vectors.perturb(pt)
    );
    const sp = SimplePath.withPoints(points)
      .close()
      .chaiken(n);
    p.drawPath(sp);
  });
};

const sketches: { name: string; sketch: (play: Play) => void }[] = [
  { sketch: sketch3, name: "Tiling" },
  { sketch, name: "Rainbow Drips" },
  { sketch: sketch2, name: "Rainbow" },
  { sketch: sketch4, name: "Vertical" },
  { sketch: curves1, name: "Curves Demo" },
  { sketch: flower, name: "Flower" },
  { sketch: chaiken, name: "Chaiken" },
  { sketch: tilesOfChaiken, name: "Tiled Curves" },
  { sketch: circle, name: "Around a Circle" }
];
export default sketches;
