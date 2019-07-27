import PlayCanvas from "../play-canvas";

export type Play = {
  context: CanvasRenderingContext2D;
  meta: {
    width: number;
    height: number;
  };
};

export type Sketch<S = undefined> = {
  (play: PlayCanvas<S>): void;
};

// TODO yuck, can we do better? Want flexibility for demos/not reflective of 'real' use?
export type SketchExample = {
  name: string;
  sketch: Sketch<any>;
  initalState?: () => any;
};

export type Size = { width: number; height: number };

export type Point2D = [number, number];
export type Vector2D = [number, number];
