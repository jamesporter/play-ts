import React, { useState, useEffect } from "react";
import Canvas from "./../Canvas";
import SelectFromChoice from "./../components/SelectFromChoice";
import SelectFromOptions from "./../components/SelectFromOptions";
import { aspectRatioChoices, defaultAspectRatio } from "./../config";
import sketches from "../../sketches";
import { getNumber, setNumber, getBoolean, setBoolean } from "../../lib/util";
import Spacer from "../components/Spacer";
import Flex from "../components/Flex";
import { Link } from "react-router-dom";

export const INDEX_KEY = "play-ts.index";
export const SEED_KEY = "play-ts.index";

export default function ViewSingle({ match }: { match: any }) {
  const parsedInt = parseInt(match.params.id);
  const idx = getNumber(INDEX_KEY);
  const [sketchNo, setSketchNo] = useState(
    Number.isNaN(parsedInt) ? idx || 0 : parsedInt
  );
  const goToPrev = () => {
    let nextNo = sketchNo - 1;
    if (nextNo < 0) nextNo = sketches.length - 1;
    setSketchNo(nextNo);
  };
  const goToNext = () => {
    let nextNo = sketchNo + 1;
    if (nextNo >= sketches.length) nextNo = 0;
    setSketchNo(nextNo);
  };

  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);

  const [seed, setSeed] = useState(getNumber(SEED_KEY) || 1);
  const updateSeed = () => {
    const newSeed = seed + 1;
    setNumber(SEED_KEY, newSeed);
    setSeed(newSeed);
  };

  return (
    <>
      <div className="flex-1 flex flex-col">
        <Canvas
          aspectRatio={aspectRatio}
          sketch={sketches[sketchNo].sketch}
          seed={seed}
        />
      </div>

      <div className="bg-gray-300 px-8 py-4 flex flex-row">
        <button
          className={`bg-gray-500 hover:bg-teal-600 focus:outline-none focus:shadow-outline px-2 py-1 rounded mr-2`}
          onClick={goToPrev}
        >
          ←
        </button>

        <SelectFromOptions
          options={sketches.map(s => s.name)}
          onSelect={name => {
            const idx = sketches.findIndex(s => s.name === name);
            setNumber(INDEX_KEY, idx);
            if (idx !== null) setSketchNo(idx);
          }}
          selection={sketches[sketchNo].name}
        />

        <button
          className={`bg-gray-500 hover:bg-teal-600 focus:outline-none focus:shadow-outline px-2 py-1 rounded ml-2`}
          onClick={goToNext}
        >
          →
        </button>

        <Spacer />
        <button
          className={`bg-gray-500 hover:bg-teal-600 focus:outline-none focus:shadow-outline px-2 py-1 rounded ml-2`}
          onClick={updateSeed}
        >
          Refresh
        </button>

        <Spacer />

        <SelectFromChoice
          value={aspectRatio}
          choices={aspectRatioChoices}
          onSelect={setAspectRatio}
          tailwindContainerClasses="hidden md:flex"
        />

        <Flex />

        <Link
          to={`/export/${sketchNo}`}
          className="bg-teal-500 hover:bg-teal-600 focus:outline-none focus:shadow-outline px-2 py-3 rounded ml-2"
        >
          Export
        </Link>
      </div>
    </>
  );
}
