import React, { useRef, useLayoutEffect } from "react";
import useDimensions from "react-use-dimensions";
import { Sketch } from "../lib/play";

type CanvasProps = {
  sketch: Sketch;
  aspectRatio: number;
};

export default function Canvas({ aspectRatio, sketch }: CanvasProps) {
  const [ref, { width, height }] = useDimensions();
  const canvasRef = useRef();

  console.log(">>", width, height);
  let w: null | number = null,
    h: null | number = null;
  if (width && height) {
    if (width / height > aspectRatio) {
      h = height - 20;
      w = h * aspectRatio;
    } else {
      w = width - 20;
      h = w / aspectRatio;
    }
  }

  useLayoutEffect(() => {
    const cvs = canvasRef.current;
    if (cvs) {
      const ctx = (cvs as HTMLCanvasElement).getContext("2d");
      if (ctx) {
        sketch({
          context: ctx,
          meta: {
            width: w || 100 * aspectRatio,
            height: h || 100
          }
        });
      }
    }
  });

  return (
    <div
      className="flex-1 self-stretch flex items-center justify-center bg-gray-100"
      ref={ref}
    >
      {w && h && (
        <canvas
          id="myCanvas"
          width={w}
          height={h}
          ref={canvasRef}
          className="shadow-md bg-white"
        />
      )}
    </div>
  );
}
