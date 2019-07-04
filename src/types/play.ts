export type Play = {
  context: CanvasRenderingContext2D;
  meta: {
    width: number;
    height: number;
  };
};

export type Sketch = {
  (play: Play): void;
};

export type Size = { width: number; height: number };

export type Point2D = [number, number];
export type Vector2D = [number, number];
