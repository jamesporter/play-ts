import { Play } from "./types/play";
import PlayCanvas from "./lib/play-canvas";

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

  pts.forTiling({ n: 20, type: "square", margin: 0.1 }, ([i, j], [di, dj]) => {
    pts.doProportion(0.7, () => {
      pts.setStrokeColour(i * 100, 80, 10 + j * 50, 0.9);
      pts.lineWidth = 0.04 * (1 - i);
      pts.drawLine(
        [i + di / 4, j + dj / 4],
        [i + (di * 3) / 4, j + (dj * 10) / 4]
      );
    });
  });
};

export default sketch;
