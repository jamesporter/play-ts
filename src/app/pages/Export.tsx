import React, { useState, useRef } from "react";
import {
  aspectRatioChoices,
  defaultAspectRatio,
  defaultSize,
  sizeChoices
} from "../config";
import SelectFromChoice from "../components/SelectFromChoice";
import sketches from "../../sketches";
import PlayCanvas from "../../lib/play-canvas";

export function Export({ match }: { match: any }) {
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);
  const [size, setSize] = useState(defaultSize);
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const sketchNo = match.params.id;
  const sketch = sketches[sketchNo];

  const generate = () => {
    const w = size;
    const h = Math.floor(size / aspectRatio);

    const ctx =
      previewRef.current &&
      (previewRef.current.getContext("2d") as CanvasRenderingContext2D);
    if (ctx) {
      ctx.clearRect(0, 0, w, h);
      const pts = new PlayCanvas(ctx, {
        width: w,
        height: h
      });
      sketch.sketch(pts);
    }
  };

  return (
    <div className="p-4">
      <SelectFromChoice
        value={aspectRatio}
        choices={aspectRatioChoices}
        onSelect={setAspectRatio}
      />

      <SelectFromChoice
        value={size}
        choices={sizeChoices}
        onSelect={setSize}
        tailwindContainerClasses="pt-4"
      />

      <button
        onClick={generate}
        className="bg-teal-500 hover:bg-teal-600 focus:outline-none focus:shadow-outline px-2 py-3 rounded mt-4"
      >
        Generate {size}x{Math.floor(size / aspectRatio)}
      </button>

      <canvas
        width={size}
        height={size / aspectRatio}
        ref={previewRef}
        className="shadow-lg hover:shadow-2xl bg-white my-4"
      />
    </div>
  );
}