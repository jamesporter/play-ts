import { Point2D } from "./lib/types/play";
import PlayCanvas from "./lib/play-canvas";
import {
  Path,
  SimplePath,
  Arc,
  Rect,
  Ellipse,
  RoundedRect,
  RegularPolygon,
  Star
} from "./lib/path";
import { add, pointAlong, scale } from "./lib/vectors";
import { perlin2 } from "./lib/noise";
import { LinearGradient, RadialGradient } from "./lib/gradient";
import { zip2, sum } from "./lib/collectionOps";
import { parsePath } from "history";

const rainbow = (p: PlayCanvas) => {
  p.lineStyle = { cap: "round" };
  p.withRandomOrder(
    p.forTiling,
    { n: 20, type: "square", margin: 0.1 },
    ([i, j], [di, dj]) => {
      p.doProportion(0.6, () => {
        p.setStrokeColour(i * 100, 80, 30 + j * 30, 0.9);
        p.lineWidth = 0.02 + 0.02 * (1 - i);
        p.drawLine(
          [i + di / 4, j + dj / 4],
          [
            i + (di * 3 * j * p.randomPolarity()) / 4,
            j + (dj * 5 * (1 + p.random())) / 4
          ]
        );
      });
    }
  );
};

const horizontal = (p: PlayCanvas) => {
  p.backgroundGradient(
    new LinearGradient({
      from: [0, 0],
      to: [1, 0],
      colours: [[0, { h: 0, s: 0, l: 95 }], [1, { h: 0, s: 0, l: 85 }]]
    })
  );
  p.forHorizontal({ n: 20, margin: 0.1 }, ([x, y], [dX, dY]) => {
    p.setStrokeColour(x * 360, 90, 40);
    p.drawLine([x, y], [x + dX, y + dY]);
  });
};

const vertical = (p: PlayCanvas) => {
  p.backgroundGradient(
    new LinearGradient({
      from: [0, 0],
      to: [0, 1],
      colours: [[0, { h: 50, s: 40, l: 95 }], [1, { h: 30, s: 40, l: 90 }]]
    })
  );
  p.forVertical({ n: 20, margin: 0.1 }, ([x, y], [dX, dY]) => {
    const points = p.build(p.range, { from: x, to: x + dX, n: 20 }, vX => {
      return p.perturb([vX, y + dY / 2], { magnitude: dY / 4 });
    });
    p.lineWidth = 0.01 / p.meta.aspectRatio;
    p.setStrokeColour(y * 60, 90, 40);
    p.draw(SimplePath.withPoints(points));
  });
};

const tiling = (p: PlayCanvas) => {
  p.forTiling({ n: 20, margin: 0.1, type: "square" }, ([x, y], [dX, dY]) => {
    p.lineStyle = { cap: "round" };
    p.setStrokeColour(120 + x * 120 + p.t * 50, 90 - 20 * y, 40);
    p.proportionately([
      [1, () => p.drawLine([x, y], [x + dX, y + dY])],
      [2, () => p.drawLine([x + dX, y], [x, y + dY])]
    ]);
  });
};

const flower = (p: PlayCanvas) => {
  const horizonOffset = p.random() * 0.25;
  p.backgroundGradient(
    new LinearGradient({
      from: [0, 0],
      to: [0, p.meta.bottom],
      colours: [
        [0, { h: 215, s: 90, l: 90 }],
        [0.59 + horizonOffset, { h: 215, s: 100, l: 70 }],
        [0.61 + horizonOffset, { h: 150, s: 90, l: 30 }],
        [1, { h: 140, s: 90, l: 40 }]
      ]
    })
  );
  p.lineStyle = { cap: "round" };

  const { right, bottom } = p.meta;

  const midX = right / 2;
  const midY = bottom / 2;
  const ir = p.random() * 0.025 + midX / 5;
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
  const baseHue = p.random() * 290;
  p.setFillGradient(
    new RadialGradient({
      start: [midX, midY],
      end: [midX, midY],
      rStart: 0,
      rEnd: 2,
      colours: [
        [0, { h: 10 + baseHue, s: 90, l: 50, a: 0.95 }],
        [0.3, { h: 70 + baseHue, s: 90, l: 40, a: 0.95 }]
      ]
    })
  );
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
  p.backgroundGradient(
    new LinearGradient({
      from: [0, 0],
      to: [0, 1],
      colours: [[0, { h: 215, s: 20, l: 90 }], [1, { h: 140, s: 20, l: 90 }]]
    })
  );
  p.lineStyle = { cap: "round" };
  p.forTiling({ n: 12, margin: 0.1 }, ([x, y], [dX, dY]) => {
    p.setStrokeColour(20 + x * 40, 90 - 20 * y, 50);
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
        at: [x + dX / 8, y + dY / 8],
        w: dX * p.random() * 0.75,
        h: dY * p.random() * 0.75
      })
    );
  });
};

const rectanglesDivided = (p: PlayCanvas) => {
  p.lineWidth = 0.005;
  const { right, bottom } = p.meta;

  new Rect({ at: [0.1, 0.1], w: right - 0.2, h: bottom - 0.2 })
    .split({ orientation: "vertical", split: [1, 1.5, 2, 2.5] })
    .forEach((r, i) => {
      p.setFillGradient(
        new LinearGradient({
          from: r.at,
          to: [r.at[0], r.at[1] + r.h],
          colours: [
            [0, { h: i * 10, s: 90, l: 60 }],
            [1, { h: i * 10, s: 60, l: 40 }]
          ]
        })
      );
      p.fill(r);
      p.draw(r);
    });
};

const mondrian = (p: PlayCanvas) => {
  const { right, bottom } = p.meta;

  let rs = [new Rect({ at: [0.1, 0.1], w: right - 0.2, h: bottom - 0.2 })];
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
      n: 10
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

  p.range({ from: 0.1, to: bottom - 0.1, n: 5 }, m => {
    let points: Point2D[] = [];
    p.setStrokeColour(215, 40, 30 - 30 * m);
    p.range({ from: 0.1, to: 0.9, n: 60 }, n => {
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
  p.background(120, 5, 95);
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
  p.background(220, 30, 90);
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
        [0, { h: 210 + p.t * 100, s: 80, l: 60 }],
        [0.5, { h: 250 + p.t * 100, s: 80, l: 60 }],
        [1.0, { h: 280 + p.t * 100, s: 80, l: 60 }]
      ]
    })
  );
  p.fill(new Rect({ at: [0, 0], w: right, h: bottom }));
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
        [0, { h: 0 + p.t * 40, s: 80, l: 60 }],
        [0.7, { h: 50 + p.t * 20, s: 90, l: 60 }],
        [1.0, { h: 1000 + p.t * 20, s: 80, l: 60 }]
      ]
    })
  );
  p.fill(new Rect({ at: [0, 0], w: right, h: bottom }));
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
  p.fill(new Rect({ at: [0, 0], w: right, h: bottom }));

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
  p.fill(new Rect({ at: [0, 0], w: right, h: bottom }));
};

const gradients4 = (p: PlayCanvas) => {
  const { right, bottom } = p.meta;
  const corners: Point2D[] = [[0, 0], [right, 0], [right, bottom], [0, bottom]];
  const hues = [10, 215, 50, 190];

  p.background(0, 0, 5);
  for (let i = 0; i < 4; i++) {
    const from = corners[i];
    const to = corners[(i + 2) % 4];

    p.setFillGradient(
      new LinearGradient({
        from,
        to,
        colours: [
          [0, { h: hues[i], s: 90, l: 90, a: 0.01 }],
          [0.4, { h: hues[i], s: 90, l: 90, a: 0.1 }],
          [0.5, { h: hues[i], s: 90, l: 90, a: 0.9 }],
          [0.5, { h: hues[i], s: 90, l: 90, a: 0.1 }],
          [1, { h: hues[i], s: 90, l: 90, a: 0.01 }]
        ]
      })
    );
    p.fill(new Rect({ at: [0, 0], w: right, h: bottom }));
  }
};

const gradients5 = (p: PlayCanvas) => {
  const { right, bottom } = p.meta;
  const corners: Point2D[] = [[0, 0], [right, 0], [right, bottom], [0, bottom]];
  const hues = [10, 215, 50, 190];

  p.background(0, 0, 5);
  p.forHorizontal({ n: 30 }, (from, [dX, _]) => {
    const to = add(from, [dX * p.poisson(3), 0]);
    const l = 60;
    p.setFillGradient(
      new LinearGradient({
        from,
        to,
        colours: [
          [0, { h: 40, s: 90, l, a: 0.0 }],
          [0, { h: 40, s: 90, l, a: 0.7 }],
          [1, { h: 0, s: 80, l, a: 0.01 }],
          [1, { h: 0, s: 90, l, a: 0.0 }]
        ]
      })
    );
    p.fill(new Rect({ at: [0, 0], w: right, h: bottom }));
  });
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
          at: [x, y + dY / 2],
          w: dX,
          h: (dY * v) / 5
        })
      );
    }
  );
};

const randomness1b = (p: PlayCanvas) => {
  p.times(25, n => {
    p.setFillColour(175 + n, 80, 50, 0.4);
    const values = p
      .build(p.times, 50, () => p.gaussian())
      .sort((a, b) => (a > b ? -1 : 1));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    p.forHorizontal(
      {
        n: values.length,
        margin: 0.1
      },
      ([x, y], [dX, dY], i) => {
        const h = dY * ((values[i] - min) / range);
        p.fill(
          new Rect({
            at: [x + n * 0.04 * dX, y + dY / 2 - h / 2],
            w: dX * 0.2,
            h
          })
        );
      }
    );
  });
};

const randomness2 = (p: PlayCanvas) => {
  p.background(320, 10, 90);
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

const sunsetThroughBlinds = (p: PlayCanvas) => {
  const { right, bottom, center } = p.meta;

  p.setFillGradient(
    new RadialGradient({
      start: add(center, [0, 0.2]),
      end: add(center, [0, 0.4]),
      rStart: 0.0,
      rEnd: 2 * bottom * right,
      colours: [
        [0, { h: 0, s: 80, l: 60 }],
        [0.6, { h: 215, s: 80, l: 60 }],
        [1.0, { h: 230, s: 80, l: 60 }]
      ]
    })
  );
  p.fill(new Rect({ at: [0, 0], w: right, h: bottom }));

  p.forVertical({ n: 15 }, (pt, [w, h]) => {
    p.setFillGradient(
      new LinearGradient({
        from: pt,
        to: add(pt, [0, h]),
        colours: [
          [0, { h: 40, s: 40, l: 90, a: 0.9 }],
          [0.5, { h: 40, s: 40, l: 50, a: 0.8 }],
          [0.55, { h: 40, s: 40, l: 50, a: 0.1 }],
          [1, { h: 40, s: 40, l: 90, a: 0.1 }]
        ]
      })
    );
    p.fill(new Rect({ at: pt, w, h }));
  });
};

const curves = (p: PlayCanvas) => {
  p.background(215, 30, 20);
  p.forHorizontal({ n: 75 }, ([x, y], [dX, dY]) => {
    const vPts = [0, 0, 0, 0].map(_ => p.poisson(5) + 2);
    const total = sum(vPts);
    let nVPts = vPts.map(p => (dY * p) / total);
    nVPts = [y - 0.1].concat(
      [3, 2, 1, 0].map(i => y + 1.2 * sum(nVPts.slice(i)))
    );
    const nHPts = nVPts.map(p => x + dX * 12 * perlin2(10 + p * 60, x * 20));
    const points = zip2(nHPts, nVPts);
    const path = SimplePath.withPoints(points);
    path.chaiken(4);
    p.setStrokeColour(p.uniformRandomInt({ from: -40, to: 60 }), 90, 60, 0.95);
    p.draw(path);
  });
};

const transforms = (p: PlayCanvas) => {
  p.forTiling({ n: 8, type: "square", margin: 0.1 }, ([x, y], [dX, dY]) => {
    p.setFillColour(120 + x * 100, 90, 50);
    p.withTranslation([x + dX / 2, y + dY / 2], () =>
      p.withRotation(x + y + p.t, () => {
        p.fill(new Rect({ at: [-dX / 4, -dY / 4], w: dX / 2, h: dY / 2 }));
      })
    );
  });
};

const transforms2 = (p: PlayCanvas) => {
  p.background(0, 0, 0);
  const baseSize = (1 + Math.sin(2 * p.t)) / 2;
  const { bottom: h } = p.meta;
  p.forTiling({ n: 32, type: "square" }, ([x, y], [dX, dY]) => {
    p.setFillColour(320 - x * 100 + p.t * 10, 90, 50, 0.8);
    p.withTranslation([x + dX / 2, y + dY / 2], () =>
      p.withRotation(x + y + p.t * 2, () =>
        p.withScale(
          [
            baseSize + 6 * Math.abs(0.5 - x),
            baseSize + 12 * Math.abs(0.5 - y / h)
          ],
          () => {
            p.fill(new Rect({ at: [-dX / 4, -dY / 4], w: dX / 2, h: dY / 2 }));
          }
        )
      )
    );
  });
};

const transforms3 = (p: PlayCanvas) => {
  const { bottom: h } = p.meta;
  const a = Math.sin(p.t);
  p.forHorizontal({ n: 20, margin: 0.3 }, ([x, y], [dX, dY]) => {
    p.range({ from: 0, to: 2 * Math.PI, n: 12 }, n =>
      p.withTranslation([x + dX / 2, (h * n) / 6 + dY / 6], () => {
        p.withRotation(x - n + a, () => {
          p.setFillColour(360 - n * 20, 90, 30, 0.5);
          p.fill(new Rect({ at: [-dX / 2, -dY / 2], w: dX / 4, h: 2 * dY }));
        });
      })
    );
  });
};

const time = (p: PlayCanvas) => {
  p.background(50, 20, 90);
  const times = 4;
  p.forHorizontal({ n: 20, margin: 0.1 }, ([x, y], [dX, dY]) => {
    p.times(times, n => {
      const h = dY * 0.5 * (1 + perlin2(x, 100 + n + p.t / 4));
      p.setFillColour((n * 60) / times, 80, 60);
      p.fill(
        new Rect({
          at: [x + (dX / times) * n, y + dY - h],
          h,
          w: dX / times
        })
      );
    });
  });
};

const clipping = (p: PlayCanvas) => {
  const { center, bottom, right } = p.meta;
  const size = Math.min(bottom, right) * 0.8;
  p.background(120 + p.t * 50, 40, 90);
  p.lineWidth = 0.005;
  p.range({ from: 1, to: 4, n: 4 }, n =>
    p.withTranslation([0.037 * n * n, bottom * 0.037 * n * n], () =>
      p.withScale([0.1 * n, 0.1 * n], () =>
        p.withClipping(
          new Ellipse({ at: center, width: size, height: size }),
          () =>
            p.forTiling(
              { n: 60 / (8 - n), type: "square" },
              ([x, y], [dX, dY]) => {
                p.lineStyle = { cap: "round" };
                p.setStrokeColour(120 + x * 120 + p.t * 50, 90 - 20 * y, 40);
                p.proportionately([
                  [1, () => p.drawLine([x, y], [x + dX, y + dY])],
                  [2, () => p.drawLine([x + dX, y], [x, y + dY])],
                  [1, () => p.drawLine([x, y], [x, y + dY])]
                ]);
              }
            )
        )
      )
    )
  );
};

const roundedRects = (p: PlayCanvas) => {
  p.forTiling(
    { n: 5, type: "proportionate", margin: 0.1 },
    ([x, y], [dX, dY]) => {
      p.setFillColour(p.t * 50 + 150 + x * 100, y * 40 + 60, 40);
      p.fill(
        new RoundedRect({
          at: [x + dX / 6, y + dY / 6],
          w: (dX * 2) / 3,
          h: (dY * 2) / 3,
          r: dX / 8
        })
      );
    }
  );
};

const cards = (p: PlayCanvas) => {
  p.forTiling({ n: 6, type: "square", margin: 0.05 }, ([x, y], [dX, dY]) => {
    p.withClipping(
      new RoundedRect({
        at: [x + dX / 6, y + dX / 4],
        w: (dX * 2) / 3,
        h: dY / 2,
        r: dX / 12
      }),
      () => {
        p.setFillColour(175 + x * 60 + y * 100, y * 40 + 60, 40);
        p.fill(
          new Rect({
            at: [x + dX / 6, y + dX / 4],
            w: (dX * 2) / 3,
            h: dY / 2
          })
        );

        p.setFillColour(0, 0, 100, 0.4);
        p.times(5, () =>
          p.fill(
            new Ellipse({
              at: p.perturb([x + dX / 2, y + dY / 2]),
              width: dX / 2,
              height: dX / 2
            })
          )
        );
      }
    );
  });
};

const polygons = (p: PlayCanvas) => {
  p.background(330, 70, 30);
  let n = 3;
  p.forTiling({ n: 4, type: "square", margin: 0.1 }, ([x, y], [dX, dY]) => {
    p.setFillColour(180 + 40 * x, 50 + 50 * y, 60);
    p.fill(
      new RegularPolygon({
        at: [x + dX / 2, y + dY / 2],
        n,
        r: dX / 2.1,
        startAngle: p.t
      })
    );
    n++;
  });
};

const stars = (p: PlayCanvas) => {
  let n = 3;
  p.background(30, 20, 80);
  p.forTiling({ n: 4, type: "square", margin: 0.1 }, ([x, y], [dX, dY]) => {
    p.setFillColour(20 + 30 * x, 25 + 75 * y, 45 + 5 * (1 + Math.sin(p.t + x)));
    p.fill(
      new Star({
        at: [x + dX / 2, y + dY / 2],
        n,
        r: (dX * (2.2 + Math.cos(x + y + p.t))) / 6.1,
        startAngle: p.t
      })
    );
    n++;
  });
};

const sketches: { name: string; sketch: (p: PlayCanvas) => void }[] = [
  { sketch: tiling, name: "Tiling" },
  { sketch: rainbow, name: "Rainbow Drips" },
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
  { sketch: gradients4, name: "Gradient Demo 4" },
  { sketch: gradients5, name: "Gradient Demo 5" },
  { sketch: sunsetThroughBlinds, name: "Gradient Demo 6" },
  { sketch: randomness1, name: "Gaussian" },
  { sketch: randomness1b, name: "Gaussian 2" },
  { sketch: randomness2, name: "Poisson" },
  { sketch: curves, name: "Curves" },
  { sketch: transforms, name: "Transforms Demo" },
  { sketch: transforms2, name: "Transforms Demo 2" },
  { sketch: transforms3, name: "Transforms Demo 3" },
  { sketch: time, name: "Time" },
  { sketch: clipping, name: "Clipping Demo" },
  { sketch: roundedRects, name: "Rounded Rectangles Demo" },
  { sketch: cards, name: "Cards" },
  { sketch: polygons, name: "Polygons" },
  { sketch: stars, name: "Stars" }
];
export default sketches;
