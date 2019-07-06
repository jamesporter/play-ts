import { Play } from "./types/play";
import PlayCanvas from "./lib/play-canvas";

const sketch = (play: Play) => {
  console.log("calling sketch");
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

  pts.withRandomOrder(
    pts.forTiling,
    { n: 20, type: "square", margin: 0.1 },
    ([i, j], [di, dj]) => {
      pts.doProportion(0.7, () => {
        pts.setStrokeColour(i * 100, 80, 10 + j * 50);
        pts.lineWidth = 0.04 * (1 - i);
        pts.drawLine(
          [i + di / 4, j + dj / 4],
          [i + (di * 3) / 4, j + (dj * 10) / 4]
        );
      });
    }
  );
};

const sketch2 = (play: Play) => {
  console.log("calling sketch 2");
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

const sketches: { name: string; sketch: (play: Play) => void }[] = [
  { sketch, name: "Rainbow Drips" },
  { sketch: sketch2, name: "Rainbow" }
];
export default sketches;
