import React from "react";
import sketches from "../../sketches";
import Preview from "../Preview";
import statefulSketches from "../../stateful-sketches";
import StatefulPreview from "../StatefulPreview";

export function Main() {
  return (
    <>
      <h1 className="text-4xl text-center">Stateless Examples</h1>
      <div className="flex flex-row flex-wrap justify-center container m-auto">
        {sketches.map((s, id) => {
          return (
            <Preview
              sketch={s.sketch}
              name={s.name}
              size={240}
              id={id}
              key={id}
            />
          );
        })}
      </div>
      <h1 className="text-4xl text-center">State(ful) Examples</h1>
      <div className="flex flex-row flex-wrap justify-center container m-auto">
        {statefulSketches.map((s, id) => {
          return (
            <StatefulPreview
              sketch={s}
              name={s.name}
              size={240}
              id={id}
              key={id}
            />
          );
        })}
      </div>
    </>
  );
}
