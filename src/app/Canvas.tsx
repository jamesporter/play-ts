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

  let w = null,
    h = null;
  if (width && height) {
    h = height - 20;
    w = h * aspectRatio;
  }

  useLayoutEffect(() => {
    const cvs = canvasRef.current;
    if (cvs) {
      const ctx = cvs.getContext("2d");
      ctx.rect(20, 20, 150, 100);
      ctx.stroke();
    }
  });

  return (
    <div
      className="flex-1 self-stretch flex items-center justify-center"
      ref={ref}
    >
      {w && h && (
        <canvas
          id="myCanvas"
          width={w}
          height={h}
          ref={canvasRef}
          className="shadow-md"
        />
      )}
    </div>
  );
}
