import { Play, Point2D } from "./types/play";
import PlayCanvas from "./lib/play-canvas";
import { Path, SimplePath, Arc, Rect, Text, Ellipse } from "./lib/path";
import vectors, { add, pointAlong, scale } from "./lib/vectors";
import { perlin2 } from "./lib/noise";
import { LinearGradient, RadialGradient } from "./lib/gradient";

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
            i + (di * 3 * j * pts.randomPolarity()) / 4,
            j + (dj * 5 * (1 + pts.random())) / 4
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
      return p.perturb([vX, y + dY / 2], { magnitude: dY / 4 });
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
  const ir = p.random() * 0.025 + midX / 4;
  const da = Math.PI / 10;

  const start = p.perturb([midX, bottom * 0.95]);
  const end: Point2D = [midX, midY];
  const second = p.perturb(pointAlong(start, end, 0.4));

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
      curveAngle: p.random() / 6
    });
  }
  p.setFillColour(10 + p.random() * 320, 90, 50, 0.95);
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
        polarlity: p.randomPolarity(),
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
      const rr = 2 * p.random() + 1;
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
        const rr = 2 * p.random() + 1;
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
    const points = p.build(p.aroundCircle, { n: 20 }, pt => p.perturb(pt));
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
  p.lineStyle = { cap: "round" };

  p.times(250, n => {
    p.setStrokeColour(195 + n / 12.5, 90, 30, 0.7);
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
    p.draw(sp.chaiken(2));
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
        w: dX * p.random() * 0.75,
        h: dY * p.random() * 0.75
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
                split: p.samples(3, [1, 2, 2.5, 3])
              })
          ],
          [
            1,
            () =>
              r.split({
                orientation: "vertical",
                split: p.samples(3, [1, 1.2, 1.5, 2])
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
      p.setFillColour(p.sample([10, 60, 200]), 80, 50);
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
        p.drawText(
          {
            at: [n * aspectRatio, n],
            size: 0.2,
            sizing: "fixed",
            align,
            weight: "600"
          },
          "Hello"
        );
      }
      p.setFillColour(n * aspectRatio * 50, 80, 50, 0.9);

      p.fillText(
        {
          at: [n * aspectRatio, n],
          size: 0.2,
          sizing: "fixed",
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
      p.fillText(
        {
          at: p.perturb([x, y]),
          size: 0.05,
          align: "left"
        },
        (i + 1).toString()
      );
    });
  });
};

const scriptLike = (p: PlayCanvas) => {
  const { bottom, aspectRatio } = p.meta;

  p.range({ from: 0.1, to: bottom - 0.1, steps: 5 }, m => {
    let points: Point2D[] = [];
    p.setStrokeColour(215, 40, 30 - 30 * m);
    p.range({ from: 0.1, to: 0.9, steps: 60 }, n => {
      points.push([
        n + perlin2(n * 45 + m * 67, 20) / 12,
        m + perlin2(n * 100 + m * 100, 0.1) / (6 * aspectRatio)
      ]);
    });
    p.draw(SimplePath.withPoints(points).chaiken(4));
  });
};

const doodles = (p: PlayCanvas) => {
  p.forTiling({ n: 7, type: "square", margin: 0.1 }, ([x, y], [dX, dY]) => {
    const center = add([x, y], scale([dX, dY], 0.5));
    const [cX, cY] = center;
    let path = Path.startAt(center);
    p.setStrokeColour(100 * x + y * 33, 60 + 45 * y, 40);
    p.lineWidth = 0.005;
    p.withRandomOrder(
      p.aroundCircle,
      { cX, cY, radius: dX / 2.8, n: 7 },
      (pt, i) => {
        path.addCurveTo(pt);
      }
    );
    path.addCurveTo(center);
    p.draw(path);
  });
};

const circles = (p: PlayCanvas) => {
  p.forTiling({ n: 10, type: "square", margin: 0.1 }, (pt, delta) => {
    p.setFillColour(pt[0] * 100, 80, 50);
    const r = Math.sqrt(1.2 * pt[0] * pt[1]);
    p.fill(
      new Ellipse({
        at: add(pt, scale(delta, 0.5)),
        align: "center",
        width: delta[1] * r,
        height: delta[1] * r
      })
    );
  });
};

const circles2 = (p: PlayCanvas) => {
  p.withRandomOrder(
    p.forTiling,
    { n: 10, type: "square", margin: 0.1 },
    (pt, delta) => {
      p.setFillColour(150 + pt[0] * 50, 80, 50, 0.9);
      p.setStrokeColour(150, 40, 20);
      p.lineWidth = 0.005;
      const r = Math.sqrt(1.2 * pt[0] * pt[1]) * p.sample([0.7, 1.1, 1.3]);
      const e = new Ellipse({
        at: add(pt, scale(delta, 0.5)),
        align: "center",
        width: delta[1] * r * 2,
        height: delta[1] * r * 2
      });

      p.fill(e);
      p.draw(e);
    }
  );
};

const ellipses = (p: PlayCanvas) => {
  p.background(0, 0, 100);
  p.withRandomOrder(
    p.forTiling,
    { n: 15, type: "square", margin: 0.1 },
    (pt, delta) => {
      const [x, y] = pt;
      p.setFillColour(150 + perlin2(x * 10, 1) * 50, 80, 50, 0.9);
      p.setStrokeColour(150, 40, 100);
      p.lineWidth = 0.005;
      const r = Math.sqrt(
        1.8 * (0.1 + Math.abs(x - 0.5)) * (0.1 + Math.abs(y - 0.5))
      );
      const e = new Ellipse({
        at: add(pt, scale(delta, 0.5)),
        align: "center",
        width: delta[1] * r * 3,
        height: delta[1] * 1.2
      });
      p.fill(e);
      p.draw(e);
    }
  );
};

const gradients1 = (p: PlayCanvas) => {
  const { right, bottom } = p.meta;
  p.setFillGradient(
    new LinearGradient({
      from: [0, 0],
      to: [right, bottom],
      colours: [
        [0, { h: 210, s: 80, l: 60 }],
        [0.5, { h: 250, s: 80, l: 60 }],
        [1.0, { h: 280, s: 80, l: 60 }]
      ]
    })
  );
  p.fill(new Rect({ x: 0, y: 0, w: right, h: bottom }));
};

const gradients2 = (p: PlayCanvas) => {
  const { right, bottom, center } = p.meta;

  p.setFillGradient(
    new RadialGradient({
      start: center,
      end: [right, bottom],
      rStart: 0.0,
      rEnd: 2 * Math.max(bottom, right),
      colours: [
        [0, { h: 0, s: 80, l: 60 }],
        [0.7, { h: 50, s: 80, l: 60 }],
        [1.0, { h: 1000, s: 80, l: 60 }]
      ]
    })
  );
  p.fill(new Rect({ x: 0, y: 0, w: right, h: bottom }));
};

const gradients3 = (p: PlayCanvas) => {
  const { right, bottom, center } = p.meta;
  p.setFillGradient(
    new LinearGradient({
      from: [0, 0],
      to: [0, bottom],
      colours: [
        [0, { h: 215, s: 80, l: 60 }],
        [0.5, { h: 215, s: 80, l: 60 }],
        [0.55, { h: 240, s: 80, l: 60 }],
        [1.0, { h: 240, s: 80, l: 60 }]
      ]
    })
  );
  p.fill(new Rect({ x: 0, y: 0, w: right, h: bottom }));

  p.setFillGradient(
    new RadialGradient({
      start: center,
      end: center,
      rStart: 0.0,
      rEnd: 2 * bottom,
      colours: [
        [0, { h: 0, s: 80, l: 60 }],
        [0.02, { h: 0, s: 80, l: 60 }],
        [0.1, { h: 0, s: 80, l: 60, a: 0.3 }],
        [0.15, { h: 0, s: 80, l: 60, a: 0.05 }],
        [1.0, { h: 0, s: 80, l: 60, a: 0.03 }]
      ]
    })
  );
  p.fill(new Rect({ x: 0, y: 0, w: right, h: bottom }));
};

const randomness1 = (p: PlayCanvas) => {
  const { bottom } = p.meta;
  p.forHorizontal(
    {
      n: 100,
      margin: 0.1
    },
    ([x, y], [dX, dY]) => {
      p.setFillGradient(
        new LinearGradient({
          from: [0, 0],
          to: [0, bottom],
          colours: [
            [0, { h: 245, s: 80, l: 40 }],
            [0.45, { h: 180, s: 80, l: 40 }],
            [0.55, { h: 40, s: 80, l: 40 }],
            [1, { h: 0, s: 80, l: 40 }]
          ]
        })
      );

      const v = p.gaussian();
      p.fill(
        new Rect({
          x,
          y: y + dY / 2,
          w: dX,
          h: (dY * v) / 5
        })
      );
    }
  );
};

const randomness2 = (p: PlayCanvas) => {
  p.forTiling({ n: 50, margin: 0.1 }, (pt, delta) => {
    const v = p.poisson(4);
    p.times(v, n => {
      p.setFillColour(40 - n * 20, 80, 50, 1 / n);
      p.fill(
        new Ellipse({
          at: add(pt, scale(delta, 0.5)),
          width: (n * delta[0]) / 5,
          height: (n * delta[0]) / 5
        })
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
  { sketch: circleText, name: "Circle Labels" },
  { sketch: scriptLike, name: "Script-ish" },
  { sketch: doodles, name: "Doodles" },
  { sketch: circles, name: "Circles" },
  { sketch: circles2, name: "Bubbles" },
  { sketch: ellipses, name: "Ellipses Demo" },
  { sketch: gradients1, name: "Gradient Demo 1" },
  { sketch: gradients2, name: "Gradient Demo 2" },
  { sketch: gradients3, name: "Gradient Demo 3" },
  { sketch: randomness1, name: "Gaussian" },
  { sketch: randomness2, name: "Poisson" }
];
export default sketches;
