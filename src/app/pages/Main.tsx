import React from "react";
import sketches from "../../sketches";
import Preview from "../Preview";

export function Main() {
  return (
    <div className="flex flex-row flex-wrap justify-center container m-auto">
      {sketches.map((s, id) => {
        return (
          <Preview
            sketch={s.sketch}
            initialState={s.initalState}
            name={s.name}
            size={240}
            id={id}
            key={id}
          />
        );
      })}
    </div>
  );
}
