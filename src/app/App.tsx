import React, { useState } from "react";
import Canvas from "./Canvas";
import SelectFromChoice from "./SelectFromChoice";

export default function App() {
  const [size, setSize] = useState(1200);
  const [aspectRatio, setAspectRatio] = useState(4 / 3);
  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="bg-gray-400 px-8 py-4">
        <div className="font-bold text-xl mb-2">play-ts</div>
        <p className="text-gray-700 text-base">
          A simple, lightweight but modern TypeScript first Algorithmic Art Tool
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <Canvas
          aspectRatio={aspectRatio}
          sketch={play => {
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
          }}
        />
      </div>

      <div className="bg-gray-300 px-8 py-4 flex flex-row justify-between">
        <SelectFromChoice
          value={size}
          choices={[
            { label: "S", value: 1200 },
            { label: "M", value: 1920 },
            { label: "L", value: 3200 },
            { label: "XL", value: 4096 }
          ]}
          onSelect={setSize}
        />

        <SelectFromChoice
          value={aspectRatio}
          choices={[
            {
              label: "1:1",
              value: 1
            },
            {
              label: "4:3",
              value: 4 / 3
            },
            {
              label: "3:2",
              value: 1.5
            },
            {
              label: "16:9",
              value: 16 / 9
            }
          ]}
          onSelect={setAspectRatio}
        />

        <button className="bg-teal-500 hover:bg-teal-600 focus:outline-none focus:shadow-outline px-2 py-1 rounded">
          Save
        </button>
      </div>
    </div>
  );
}
