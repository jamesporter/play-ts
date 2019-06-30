import { Play } from "./lib/play";

const sketch = (play: Play) => {
  const {
    context: c,
    meta: { width, height }
  } = play;

  for (let i = 50; i < width; i += 50) {
    for (let j = 50; j < height; j += 50) {
      if (Math.random() > 0.2) {
        c.strokeStyle = `hsl(${i / 5}, ${80}%, ${j / 20}%)`;
        c.strokeRect(i, j, i / 10, j / 10);
      }
    }
  }
};

export default sketch;
