import React, { useState, useEffect } from "react";
import Canvas from "./Canvas";
import SelectFromChoice from "./components/SelectFromChoice";
import SelectFromOptions from "./components/SelectFromOptions";
import {
  sizeChoices,
  aspectRatioChoices,
  defaultSize,
  defaultAspectRatio
} from "./config";
import sketches from "../sketches";
import { getNumber, setNumber } from "../lib/util";

const INDEX_KEY = "play-ts.index";

export default function App() {
  const [playing, setPlaying] = useState(true);
  const idx = getNumber(INDEX_KEY);
  const [sketchNo, setSketchNo] = useState(idx || 0);
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);

  // Obviously this isn't optimal, but I don't care
  useEffect(() => {
    const iv = setInterval(() => {
      if (playing) {
        let nextSketch = sketchNo + 1;
        if (nextSketch >= sketches.length) nextSketch = 0;
        setSketchNo(nextSketch);
      }
    }, 2000);
    return () => {
      if (iv) clearInterval(iv);
    };
  });
  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="bg-gray-400 px-8 py-4">
        <div className="font-bold text-xl mb-2">play-ts</div>
        <p className="text-gray-700 text-base">
          A simple, modern TypeScript-first Algorithmic Art Tool
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <Canvas aspectRatio={aspectRatio} sketch={sketches[sketchNo].sketch} />
      </div>

      <div className="bg-gray-300 px-8 py-4 flex flex-row justify-between">
        {/* <SelectFromChoice
          value={size}
          choices={sizeChoices}
          onSelect={setSize}
        /> */}

        <SelectFromOptions
          options={sketches.map(s => s.name)}
          onSelect={name => {
            const idx = sketches.findIndex(s => s.name === name);
            setNumber(INDEX_KEY, idx);
            if (idx !== null) setSketchNo(idx);
          }}
          selection={sketches[sketchNo].name}
        />

        <SelectFromChoice
          value={aspectRatio}
          choices={aspectRatioChoices}
          onSelect={setAspectRatio}
        />

        <button
          className={`${
            playing ? "bg-teal-500" : "bg-gray-500"
          } hover:bg-teal-600 focus:outline-none focus:shadow-outline px-2 py-1 rounded`}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}
