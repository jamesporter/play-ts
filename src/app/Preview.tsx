import React, { useRef, useLayoutEffect } from "react";
import { Sketch } from "../types/play";
import PlayCanvas from "../lib/play-canvas";
import { Link } from "react-router-dom";

type CanvasProps = {
  sketch: Sketch;
  size?: number;
  id: number;
  name: string;
};

export default function Preview({ size = 200, sketch, id, name }: CanvasProps) {
  const canvasRef = useRef(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

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
      ctx.clearRect(0, 0, size, size);
      const pts = new PlayCanvas(
        ctx,
        {
          width: size,
          height: size
        },
        1
      );
      sketch(pts);
    }
  });

  return (
    <div className="m-4">
      <h3 className="text-md text-center font-semibold pb-2">{name}</h3>
      <Link to={`/view/${id}`}>
        <canvas
          width={size}
          height={size}
          ref={canvasRef}
          className="shadow-lg hover:shadow-2xl bg-white"
        />
      </Link>
    </div>
  );
}
