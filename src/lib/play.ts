const play = {} as const;

export type Play = typeof play;
export type Sketch = {
  (play: Play): void;
};

export default play;
