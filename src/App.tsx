import { sdk } from "@farcaster/miniapp-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

const CANVAS_SIZE = 320;

function App() {
  useEffect(() => {
    // important, never remove this sdk init
    sdk.actions.ready();
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const dprRef = useRef(1);
  const centerRef = useRef<Point>({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 });
  const radiusRef = useRef(CANVAS_SIZE * 0.38);

  const [lastScore, setLastScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [hasAttempt, setHasAttempt] = useState(false);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) {
      return;
    }

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }, []);

  const drawReferenceCircle = useCallback(() => {
    const context = contextRef.current;
    if (!context) {
      return;
    }

    clearCanvas();

    const { x, y } = centerRef.current;
    const radius = radiusRef.current;

    context.save();
    context.strokeStyle = "rgba(148, 163, 184, 0.6)";
    context.lineWidth = 2.5;
    context.setLineDash([10, 12]);
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }, [clearCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    contextRef.current = context;

    const devicePixelRatio = window.devicePixelRatio || 1;
    dprRef.current = devicePixelRatio;

    canvas.width = CANVAS_SIZE * devicePixelRatio;
    canvas.height = CANVAS_SIZE * devicePixelRatio;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";

    centerRef.current = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };
    radiusRef.current = CANVAS_SIZE * 0.38;

    drawReferenceCircle();
  }, [drawReferenceCircle]);

  const getPointerPosition = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const x = (event.clientX - rect.left) * (scale / dprRef.current);
    const y = (event.clientY - rect.top) * (scale / dprRef.current);

    return { x, y };
  }, []);

  const scoreDrawing = useCallback(() => {
    const points = pointsRef.current;
    if (points.length < 6) {
      return 0;
    }

    const { x: cx, y: cy } = centerRef.current;
    const radius = radiusRef.current;
    const circumference = 2 * Math.PI * radius;

    let deviationSum = 0;
    let pathLength = 0;

    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      const distance = Math.hypot(point.x - cx, point.y - cy);
      deviationSum += Math.abs(distance - radius);

      if (i > 0) {
        const prev = points[i - 1];
        pathLength += Math.hypot(point.x - prev.x, point.y - prev.y);
      }
    }

    const avgDeviation = deviationSum / points.length;
    const deviationScore = Math.max(0, 1 - avgDeviation / (radius * 0.6));

    const coverageRatio = Math.min(pathLength / (circumference * 0.9), 1);
    const coverageScore = coverageRatio ** 0.75;

    const finalScore = Math.round((deviationScore * 0.65 + coverageScore * 0.35) * 100);

    return Math.max(0, Math.min(finalScore, 100));
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const context = contextRef.current;
      if (!context) {
        return;
      }

      const position = getPointerPosition(event);
      if (!position) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);

      drawReferenceCircle();

      context.beginPath();
      context.strokeStyle = "#2563eb";
      context.lineWidth = 5.5;
      context.moveTo(position.x, position.y);

      pointsRef.current = [position];
      isDrawingRef.current = true;
    },
    [drawReferenceCircle, getPointerPosition],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) {
        return;
      }

      const context = contextRef.current;
      if (!context) {
        return;
      }

      const position = getPointerPosition(event);
      if (!position) {
        return;
      }

      const points = pointsRef.current;
      const previous = points[points.length - 1];

      context.beginPath();
      context.strokeStyle = "#2563eb";
      context.lineWidth = 5.5;
      context.moveTo(previous.x, previous.y);
      context.lineTo(position.x, position.y);
      context.stroke();

      points.push(position);
    },
    [getPointerPosition],
  );

  const finishDrawing = useCallback(() => {
    if (!isDrawingRef.current) {
      return;
    }

    isDrawingRef.current = false;
    const attemptPoints = pointsRef.current;

    if (attemptPoints.length === 0) {
      return;
    }

    const nextScore = scoreDrawing();
    setLastScore(nextScore);
    setHasAttempt(true);
    setBestScore((prev) => Math.max(prev, nextScore));
    pointsRef.current = [];
  }, [scoreDrawing]);

  const releaseIfCaptured = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      releaseIfCaptured(event);
      finishDrawing();
    },
    [finishDrawing, releaseIfCaptured],
  );

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      releaseIfCaptured(event);
      finishDrawing();
    },
    [finishDrawing, releaseIfCaptured],
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      releaseIfCaptured(event);
      finishDrawing();
    },
    [finishDrawing, releaseIfCaptured],
  );

  return (
    <main className="min-h-dvh bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-8">
        <header className="space-y-3 text-left">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">circle challenge</span>
          <h1 className="text-balance text-3xl font-semibold leading-tight">Draw the smoothest circle you can</h1>
          <p className="text-sm text-slate-400">
            Trace the faint circle in one motion. Lift your finger when you think it is perfect to see your accuracy
            score.
          </p>
        </header>

        <section className="flex flex-1 flex-col justify-between gap-6 rounded-3xl bg-slate-900/50 px-5 py-6 ring-1 ring-slate-800">
          <div className="rounded-3xl bg-slate-900/70 p-4">
            <div className="flex items-center justify-between text-sm font-medium text-slate-300">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Best score</p>
                <p className="text-3xl font-semibold text-slate-100">{hasAttempt ? bestScore : "--"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-500">Last attempt</p>
                <p className="text-3xl font-semibold text-slate-100">
                  {hasAttempt && lastScore !== null ? lastScore : "--"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="rounded-[32px] border border-slate-800/80 bg-slate-900/40 p-4 shadow-inner">
              <canvas
                ref={canvasRef}
                className="h-[320px] w-[320px] touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onPointerLeave={handlePointerLeave}
              />
            </div>
            <div className="w-full rounded-2xl bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              <p className="font-medium text-slate-100">How to play</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Place your finger inside the canvas to start drawing. Keep your circle smooth and close to the
                guideline. Releasing your finger will lock in the score.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
