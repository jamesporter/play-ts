# 🍽️ play-ts (pronounced 'plates')

## Principles

Opionated, agile (code is easy to change) framework for algorithmic art. See my [essays](https://www.amimetic.co.uk/art/) for research/plans that went into this!

- Sketches always have width 1, height depends on aspect ratio.
- Angles in radians.
- Points are [number, number].
- Colours in hsl(a).
- Leverage TypeScript: you shouldn't need to learn much, autocomplete and type checking should have your back.
- Not for beginners.
- Control flow at level of drawing (tiling, partitions etc).
- Few dependencies/mostly from scratch.
- Performance is not the goal.
- Common algorthmic art things (e.g. randomness) should be easy.
- Should feel fun/powerful.
- Life is too short to compile things.
- Rethink APIs e.g. standard bezier curve APIs make absolutely no sense
- Declarative when possible (especially anything configuration-y), proceedural when pragmatic; make it easy to explore/change your mind.

## Early

Not even packaged nicely as a library yet, but as simple demo using Parcel/React to give UI. [Live Demo](https://focused-agnesi-2a3bda.netlify.com). If you want to play, clone this repo and start 🍽️ by

```
yarn
```

to get dependencies, then:

```
yarn start
```

Open [http://localhost:1234](http://localhost:1234) and in your editor `sketches.ts` and try things out. It does things like the below

![A very early example drawn with tiles](tiles.png)

```typescript
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
```

## Plans (Last updated 14th July 2019)

- [x] Improve App to allow for saving at arbitrary sizes
- [x] Improve App/add show all sketches
- [x] Text with nice api
- [x] Fix tiling to more sensibly support different aspect ratios (i.e. adjust margins)
- [ ] Gradients: linear and radial (given up on svg, so can better cover canvas api!)
- [ ] More randomness (support common probability distributions
- [ ] Seeding for randomness, move into play, initialise
- [ ] Scaling (don't plan to allow the canvas to scale, but will probably build some utilities to perform transformations on paths etc)
- [x] More path classes rect, including subdivision operation on rect
- [ ] More path classes ellipse
- [ ] Add JSON 'canvas' for easy testing
- [ ] Revise/clean up core play-canvas api, drop some references to canvas as only going to support that now(!) etc
- [ ] Publish something to code sandbox that people can try without having to download/install stuff
- [ ] Documentation both in repo and on demo site
- [ ] Figure out nice way to package/publish

## Future (Not currently in scope)

- [ ] better export e.g. common paper/dpi sizes, move existing related stuff to utility
- [ ] 'Play'/time... be able to do dynamic redrawing i.e. requestAnimationFrame, redraw etc
- [ ] Interactions(!)
