import { Play, Point2D } from "./types/play";
import PlayCanvas from "./lib/play-canvas";
import { Path, SimplePath, Arc, Rect, Text } from "./lib/path";
import vectors, { add, perturb, pointAlong } from "./lib/vectors";
import r, { samples, sample } from "./lib/randomness";
import { perlin2 } from "./lib/noise";

const sketch = (pts: PlayCanvas) => {
  const { top, left, right, bottom } = pts.meta;

  pts.lineStyle = { cap: "round" };
  pts.withRandomOrder(
    pts.forTiling,
    { n: 20, type: "square", margin: 0.1 },
    ([i, j], [di, dj]) => {
      pts.doProportion(0.6, () => {
        pts.setStrokeColour(i * 100, 80, 30 + j * 30, 0.9);
        pts.lineWidth = 0.02 + 0.02 * (1 - i);
        pts.drawLine(
          [i + di / 4, j + dj / 4],
          [
            i + (di * 3 * j * r.randomPolarity()) / 4,
            j + (dj * 5 * (1 + Math.random())) / 4
          ]
        );
      });
    }
  );
};

const horizontal = (pts: PlayCanvas) => {
  pts.forHorizontal({ n: 20, margin: 0.1 }, ([x, y], [dX, dY]) => {
    pts.setStrokeColour(x * 360, 90, 40);
    pts.drawLine([x, y], [x + dX, y + dY]);
  });
};

const vertical = (p: PlayCanvas) => {
  p.forVertical({ n: 20, margin: 0.1 }, ([x, y], [dX, dY]) => {
    const points = p.build(p.range, { from: x, to: x + dX, steps: 20 }, vX => {
      return vectors.perturb([vX, y + dY / 2], { magnitude: dY / 4 });
    });

    p.setStrokeColour(y * 60, 90, 40);
    p.draw(SimplePath.withPoints(points));
  });
};

const tiling = (p: PlayCanvas) => {
  p.forTiling({ n: 20, margin: 0.1, type: "square" }, ([x, y], [dX, dY]) => {
    p.lineStyle = { cap: "round" };
    p.proportionately([
      [
        1,
        () => {
          p.setStrokeColour(120 + x * 120, 90 - 20 * y, 40);
          p.drawLine([x, y], [x + dX, y + dY]);
        }
      ],
      [
        2,
        () => {
          p.setStrokeColour(120 + x * 120, 90 - 20 * y, 40);
          p.drawLine([x + dX, y], [x, y + dY]);
        }
      ]
    ]);
  });
};

const flower = (p: PlayCanvas) => {
  p.lineStyle = { cap: "round" };

  const { right, bottom } = p.meta;

  const midX = right / 2;
  const midY = bottom / 2;
  const ir = Math.random() * 0.025 + midX / 4;
  const da = Math.PI / 10;

  const start = perturb([midX, bottom * 0.95]);
  const end: Point2D = [midX, midY];
  const second = perturb(pointAlong(start, end, 0.4));

  p.setStrokeColour(140, 50, 25);
  p.lineWidth = 0.02;
  p.draw(
    SimplePath.startAt(start)
      .addPoint(second)
      .addPoint(end)
      .chaiken(3)
  );

  p.lineWidth = 0.01;
  let path = Path.startAt([midX + ir, midY]);
  for (let a = 0; a < Math.PI * 2; a += da) {
    const pt: Point2D = [
      midX + ir * Math.cos(a + da),
      midY + ir * Math.sin(a + da)
    ];

    path.addCurveTo(pt, {
      curveSize: 12,
      bulbousness: 2,
      curveAngle: Math.random() / 6
    });
  }
  p.setFillColour(10 + Math.random() * 320, 90, 50, 0.95);
  p.fill(path);
  p.lineWidth = 0.005;

  p.setFillColour(40, 90, 90);
  p.fill(
    new Arc({
      cX: midX,
      cY: midY,
      radius: ir / 1.4,
      startAngle: 0,
      endAngle: Math.PI * 2
    })
  );
};

const curves1 = (p: PlayCanvas) => {
  p.lineStyle = { cap: "round" };
  p.forTiling({ n: 12, margin: 0.1 }, ([x, y], [dX, dY]) => {
    p.setStrokeColour(20 + x * 50, 90 - 20 * y, 50);
    p.draw(
      Path.startAt([x, y + dY]).addCurveTo([x + dX, y + dY], {
        polarlity: r.randomPolarity(),
        curveSize: x * 2,
        curveAngle: x,
        bulbousness: y
      })
    );
  });
};

const chaiken = (p: PlayCanvas) => {
  const { right, bottom } = p.meta;

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
    p.draw(sp);
  });
};

const tilesOfChaiken = (p: PlayCanvas) => {
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
      sp.chaiken(1 + n);
      p.lineWidth = 0.005;
      p.setStrokeColour(190 + x * 100, 90, 40 + y * 10, 0.75 * ((n + 3) / 5));
      p.draw(sp);
    });
  });
};

const circle = (p: PlayCanvas) => {
  p.lineStyle = { cap: "round" };

  p.times(10, n => {
    p.setStrokeColour(0, 0, n + 10, (0.75 * (n + 1)) / 10);
    const points = p.build(p.aroundCircle, { n: 20 }, pt =>
      vectors.perturb(pt)
    );
    const sp = SimplePath.withPoints(points)
      .close()
      .chaiken(n);
    p.draw(sp);
  });
};

const arcs = (p: PlayCanvas) => {
  const { bottom, right } = p.meta;

  const cX = right / 2;
  const cY = bottom / 2;

  p.times(19, n => {
    p.setFillColour(n * 2.5, 90, 50, 0.5);
    p.fill(
      new Arc({
        cX,
        cY,
        radius: (0.3 * Math.sqrt(n + 1)) / 3,
        startAngle: (n * Math.PI) / 10,
        endAngle: ((n + 2) * Math.PI) / 10
      })
    );
  });
};

const noise = (p: PlayCanvas) => {
  p.forTiling({ n: 12, margin: 0.1 }, ([x, y], [dX, dY]) => {
    const v = perlin2(x, y) * Math.PI * 2;
    p.setFillColour(120 + v * 20, 80, 40);
    p.fill(
      new Arc({
        cX: x + dX / 2,
        cY: y + dY / 2,
        radius: dX / 2,
        startAngle: v,
        endAngle: v + Math.PI / 2
      })
    );
  });
};

const noiseField = (p: PlayCanvas) => {
  const delta = 0.01;
  const s = 8;
  p.lineWidth = 0.0025;
  p.setStrokeColour(195, 90, 30, 0.7);

  p.times(200, () => {
    let pt = p.randomPoint;
    const sp = SimplePath.startAt(pt);
    while (true) {
      const a = Math.PI * 2 * perlin2(pt[0] * s, pt[1] * s);
      const nPt = add(pt, [delta * Math.cos(a), delta * Math.sin(a)]);
      if (p.inDrawing(nPt)) {
        pt = nPt;
        sp.addPoint(nPt);
      } else {
        break;
      }
    }
    p.draw(sp);
  });
};

const rectangles = (p: PlayCanvas) => {
  p.lineWidth = 0.005;

  p.forTiling({ n: 12, margin: 0.1 }, ([x, y], [dX, dY]) => {
    p.setFillColour(214 * x, 100, 35 + 10 * y, 0.7);
    p.fill(
      new Rect({
        x: x + dX / 8,
        y: y + dY / 8,
        w: dX * Math.random() * 0.75,
        h: dY * Math.random() * 0.75
      })
    );
  });
};

const rectanglesDivided = (p: PlayCanvas) => {
  p.lineWidth = 0.005;
  const { right, bottom } = p.meta;

  new Rect({ x: 0.1, y: 0.1, w: right - 0.2, h: bottom - 0.2 })
    .split({ orientation: "vertical", split: [1, 1.5, 2, 2.5] })
    .forEach((r, i) => {
      p.setFillColour(i * 10, 80, 40);
      p.fill(r);
      p.draw(r);
    });
};

const mondrian = (p: PlayCanvas) => {
  const { right, bottom } = p.meta;

  let rs = [new Rect({ x: 0.1, y: 0.1, w: right - 0.2, h: bottom - 0.2 })];
  p.times(4, () => {
    rs = rs.flatMap(r => {
      if (r.w > 0.1 && r.h > 0.1) {
        return p.proportionately([
          [0.6, () => [r]],
          [
            1,
            () =>
              r.split({
                orientation: "horizontal",
                split: samples(3, [1, 2, 2.5, 3])
              })
          ],
          [
            1,
            () =>
              r.split({
                orientation: "vertical",
                split: samples(3, [1, 1.2, 1.5, 2])
              })
          ]
        ]);
      } else {
        return [r];
      }
    });
  });

  rs.map(r => {
    p.doProportion(0.3, () => {
      p.setFillColour(sample([10, 60, 200]), 80, 50);
      p.fill(r);
    });
    p.draw(r);
  });
};

const helloWorld = (p: PlayCanvas) => {
  const { bottom, aspectRatio } = p.meta;
  p.range(
    {
      from: 0.1,
      to: bottom - 0.1,
      steps: 10
    },
    n => {
      p.setStrokeColour(n * aspectRatio * 50, 20, 20, 0.75);
      for (let align of ["right", "center", "left"] as const) {
        p.text(
          {
            at: [n * aspectRatio, n],
            size: 0.2,
            sizing: "fixed",
            kind: "stroke",
            align,
            weight: "600"
          },
          "Hello"
        );
      }
      p.setFillColour(n * aspectRatio * 50, 80, 50, 0.9);

      p.text(
        {
          at: [n * aspectRatio, n],
          size: 0.2,
          sizing: "fixed",
          kind: "fill",
          align: "center",
          weight: "600"
        },
        "Hello"
      );
    }
  );
};

const circleText = (p: PlayCanvas) => {
  p.aroundCircle({ radius: 0.25, n: 12 }, ([x, y], i) => {
    p.times(5, n => {
      p.setFillColour(i * 5 + n, 75, 35, 0.2 * n);
      p.text(
        {
          at: perturb([x, y]),
          kind: "fill",
          size: 0.05,
          align: "left"
        },
        (i + 1).toString()
      );
    });
  });
};

const sketches: { name: string; sketch: (p: PlayCanvas) => void }[] = [
  { sketch: tiling, name: "Tiling" },
  { sketch, name: "Rainbow Drips" },
  { sketch: horizontal, name: "Horizontal" },
  { sketch: vertical, name: "Vertical" },
  { sketch: curves1, name: "Curves Demo" },
  { sketch: flower, name: "Flower" },
  { sketch: chaiken, name: "Chaiken" },
  { sketch: tilesOfChaiken, name: "Tiled Curves" },
  { sketch: circle, name: "Around a Circle" },
  { sketch: arcs, name: "Arcs" },
  { sketch: noise, name: "Noise" },
  { sketch: noiseField, name: "Noise Field" },
  { sketch: rectangles, name: "Rectangles" },
  { sketch: rectanglesDivided, name: "Rectangles Divided" },
  { sketch: mondrian, name: "Mondrianish" },
  { sketch: helloWorld, name: "Hello World" },
  { sketch: circleText, name: "Circle Labels" }
];
export default sketches;
