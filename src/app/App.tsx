import React, { useState } from "react";
import Canvas from "./Canvas";
import SelectFromChoice from "./components/SelectFromChoice";
import {
  sizeChoices,
  aspectRatioChoices,
  defaultSize,
  defaultAspectRatio
} from "./config";
import sketch from "../sketch";

export default function App() {
  const [size, setSize] = useState(defaultSize);
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);
  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="bg-gray-400 px-8 py-4">
        <div className="font-bold text-xl mb-2">play-ts</div>
        <p className="text-gray-700 text-base">
          A simple, lightweight but modern TypeScript first Algorithmic Art Tool
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <Canvas aspectRatio={aspectRatio} sketch={sketch} />
      </div>

      <div className="bg-gray-300 px-8 py-4 flex flex-row justify-between">
        <SelectFromChoice
          value={size}
          choices={sizeChoices}
          onSelect={setSize}
        />

        <SelectFromChoice
          value={aspectRatio}
          choices={aspectRatioChoices}
          onSelect={setAspectRatio}
        />

        <button className="bg-teal-500 hover:bg-teal-600 focus:outline-none focus:shadow-outline px-2 py-1 rounded">
          Save
        </button>
      </div>
    </div>
  );
}
