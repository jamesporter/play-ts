import React, { useRef, useLayoutEffect } from "react";
import useDimensions from "react-use-dimensions";
import { Sketch } from "../types/play";

type CanvasProps = {
  sketch: Sketch;
  aspectRatio: number;
};

export default function Canvas({ aspectRatio, sketch }: CanvasProps) {
  const [ref, { width, height }] = useDimensions();
  const canvasRef = useRef(null);
  // seems to be way more performant to re-use context
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

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
    let ctx;
    if (!ctxRef.current) {
      const cvs = canvasRef.current;
      if (cvs) {
        ctx = (cvs as HTMLCanvasElement).getContext("2d");
      }
    } else {
      ctx = ctxRef.current;
    }

    if (ctx) {
      ctx.clearRect(0, 0, w, h);
      sketch({
        context: ctx,
        meta: {
          width: w || 100 * aspectRatio,
          height: h || 100
        }
      });
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
