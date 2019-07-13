import React, { useState, useEffect } from "react";
import Canvas from "./../Canvas";
import SelectFromChoice from "./../components/SelectFromChoice";
import SelectFromOptions from "./../components/SelectFromOptions";
import { aspectRatioChoices, defaultAspectRatio } from "./../config";
import sketches from "../../sketches";
import { getNumber, setNumber, getBoolean, setBoolean } from "../../lib/util";
import Spacer, { SpacerSmall } from "../components/Spacer";
import Flex from "../components/Flex";
import { Link } from "react-router-dom";

const INDEX_KEY = "play-ts.index";

export default function ViewSingle({ match }: { match: any }) {
  const idx = getNumber(INDEX_KEY);
  const [sketchNo, setSketchNo] = useState(match.params.id || idx || 0);
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);

  return (
    <>
      <div className="flex-1 flex flex-col">
        <Canvas aspectRatio={aspectRatio} sketch={sketches[sketchNo].sketch} />
      </div>

      <div className="bg-gray-300 px-8 py-4 flex flex-row">
        <button
          className={`bg-gray-500 hover:bg-teal-600 focus:outline-none focus:shadow-outline px-2 py-1 rounded mr-2`}
          onClick={() => {
            let nextNo = sketchNo - 1;
            if (nextNo < 0) nextNo = sketches.length - 1;
            setSketchNo(nextNo);
          }}
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
          onClick={() => {
            let nextNo = sketchNo + 1;
            if (nextNo >= sketches.length) nextNo = 0;
            setSketchNo(nextNo);
          }}
        >
          →
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
