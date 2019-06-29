import React from "react";
import Canvas from "./Canvas";

export default function App() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="bg-gray-400 px-8 py-4">
        <div className="font-bold text-xl mb-2">play-ts</div>
        <p className="text-gray-700 text-base">
          A simple, lightweight but modern TypeScript first Algorithmic Art Tool
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <Canvas aspectRatio={1.3333333333} sketch={play => {}} />
      </div>

      <div className="bg-gray-300 px-8 py-4 flex flex-row justify-between">
        <div className="flex flex-row mr-4">
          {["S", "M", "L", "XL"].map((s, i) => {
            const colour = i == 1 ? "teal" : "gray";
            return (
              <button
                key={i}
                className={`bg-${colour}-500 hover:bg-${colour}-600 focus:outline-none focus:shadow-outline px-2 py-1 rounded mx-1`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="flex flex-row mr-4">
          {["1:1", "4:3", "3:2", "16:9"].map((s, i) => {
            const colour = i == 1 ? "teal" : "gray";
            return (
              <button
                key={i}
                className={`bg-${colour}-500 hover:bg-${colour}-600 focus:outline-none focus:shadow-outline px-2 py-1 rounded mx-1`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <button className="bg-teal-500 hover:bg-teal-600 focus:outline-none focus:shadow-outline px-2 py-1 rounded">
          Save
        </button>
      </div>
    </div>
  );
}
