/**
 * Cubic Curve Analysis Lab
 *
 * cubic Bezier 제어점, probe 점, split handle을 드래그하면 closest point, split/part curve,
 * adaptive flatten polyline, length/classification diagnostics가 함께 갱신된다.
 *
 * - Curves.cubicClosestPoint / cubicClosestPointInto: probe에서 curve까지의 최근접점 계산
 * - Curves.cubicSplit / cubicSplitInto: split handle의 t에서 좌우 sub-curve 계산
 * - Curves.cubicPart / cubicPartInto: split t 주변의 부분 curve preview 계산
 * - Curves.cubicFlatten / cubicFlattenInto: adaptive polyline 근사 계산
 * - Curves.cubicLength / cubicLengthAtT / cubicTAtLength: 전체 길이와 t별 누적 길이 계산
 * - Curves.cubicClassify / cubicInflections / cubicExtrema: 곡선 형태와 주요 parameter 계산
 */

import * as Curves from '@cp949/vectra/curve';

type Point = { x: number; y: number };
type Cubic = { p0: Point; p1: Point; p2: Point; p3: Point };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 14);
  app.stage.addChild(label);

  const p0 = { x: 100, y: 315 };
  const p1 = { x: 230, y: 75 };
  const p2 = { x: 500, y: 360 };
  const p3 = { x: 630, y: 120 };
  const probe = { x: 350, y: 215 };
  const splitHandle = { x: 380, y: 398 };

  const leftSplit: Cubic = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
  };
  const rightSplit: Cubic = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
  };
  const partInto: Cubic = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
  };

  const closestInto = { x: 0, y: 0 };
  const derivative = { x: 0, y: 0 };
  const secondDerivative = { x: 0, y: 0 };
  const splitPoint = { x: 0, y: 0 };
  const halfLengthPoint = { x: 0, y: 0 };
  const parameterPoint = { x: 0, y: 0 };
  const flattenInto: Point[] = [];
  const markerPoint = { x: 0, y: 0 };

  const rail = { x0: 96, x1: 624, y: 398 };
  const controls = [p0, p1, p2, p3];
  let grabbed: { point: Point; railOnly: boolean } | undefined;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const findGrabTarget = (x: number, y: number): { point: Point; railOnly: boolean } | undefined => {
    const HIT_RADIUS = 18;
    const targets = [
      ...controls.map((point) => ({ point, railOnly: false })),
      { point: probe, railOnly: false },
      { point: splitHandle, railOnly: true },
    ];
    let best: { point: Point; railOnly: boolean } | undefined;
    let bestDistance = HIT_RADIUS;
    for (const target of targets) {
      const distance = Math.hypot(target.point.x - x, target.point.y - y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = target;
      }
    }
    return best;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    grabbed = findGrabTarget(x, y);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const { x, y } = getCanvasXY(e);
    if (grabbed.railOnly) {
      grabbed.point.x = Math.max(rail.x0, Math.min(rail.x1, x));
      grabbed.point.y = rail.y;
      return;
    }
    grabbed.point.x = Math.max(28, Math.min(size.width - 28, x));
    grabbed.point.y = Math.max(58, Math.min(size.height - 54, y));
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawCubic = (curve: Cubic, color: number, width: number, alpha = 1): void => {
    g.moveTo(curve.p0.x, curve.p0.y)
      .bezierCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y, curve.p3.x, curve.p3.y)
      .stroke({ color, width, alpha });
  };

  const strokePolyline = (points: readonly Point[], color: number, width: number, alpha = 1): void => {
    if (points.length < 2) return;
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.stroke({ color, width, alpha });
  };

  const drawPoint = (point: Point, radius: number, color: number): void => {
    g.circle(point.x, point.y, radius).fill({ color });
  };

  const drawParameterMarkers = (parameters: readonly number[], color: number): void => {
    for (const t of parameters) {
      Curves.cubicPointAtTInto(markerPoint, p0, p1, p2, p3, t);
      drawPoint(markerPoint, 4, color);
    }
  };

  const render = (): void => {
    const t = (splitHandle.x - rail.x0) / (rail.x1 - rail.x0);
    const fromT = Math.max(0, t - 0.16);
    const toT = Math.min(1, t + 0.16);
    const flatness = 3.2;

    const closest = Curves.cubicClosestPoint(p0, p1, p2, p3, probe, { sampleCount: 21 });
    Curves.cubicClosestPointInto(closestInto, p0, p1, p2, p3, probe, { sampleCount: 21 });
    const split = Curves.cubicSplit(p0, p1, p2, p3, t);
    Curves.cubicSplitInto(leftSplit, rightSplit, p0, p1, p2, p3, t);
    const part = Curves.cubicPart(p0, p1, p2, p3, fromT, toT);
    Curves.cubicPartInto(partInto, p0, p1, p2, p3, fromT, toT);
    const coarseFlatten = Curves.cubicFlatten(p0, p1, p2, p3, { flatness: 12 });
    Curves.cubicFlattenInto(flattenInto, p0, p1, p2, p3, { flatness });
    const totalLength = Curves.cubicLength(p0, p1, p2, p3);
    const lengthAtT = Curves.cubicLengthAtT(p0, p1, p2, p3, t);
    const tAtHalfLength = Curves.cubicTAtLength(p0, p1, p2, p3, totalLength / 2);
    const curvature = Curves.cubicCurvatureAt(p0, p1, p2, p3, t);
    const classification = Curves.cubicClassify(p0, p1, p2, p3);
    const extrema = Curves.cubicExtrema(p0, p1, p2, p3);
    const inflections = Curves.cubicInflections(p0, p1, p2, p3);
    const flatEnough = Curves.cubicIsFlatEnough(p0, p1, p2, p3, flatness);
    const linear = Curves.cubicIsLinear(p0, p1, p2, p3);
    const straight = Curves.cubicIsStraight(p0, p1, p2, p3);
    const simple = Curves.cubicIsSimple(p0, p1, p2, p3);

    Curves.cubicPointAtTInto(splitPoint, p0, p1, p2, p3, t);
    Curves.cubicPointAtTInto(halfLengthPoint, p0, p1, p2, p3, tAtHalfLength);
    Curves.cubicPointAtTInto(parameterPoint, p0, p1, p2, p3, 0.5);
    Curves.cubicDerivativeAtInto(derivative, p0, p1, p2, p3, t);
    Curves.cubicSecondDerivativeAtInto(secondDerivative, p0, p1, p2, p3, t);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 제어 polygon
    g.moveTo(p0.x, p0.y).lineTo(p1.x, p1.y).lineTo(p2.x, p2.y).lineTo(p3.x, p3.y).stroke({
      color: 0x64748b,
      width: 1,
    });

    strokePolyline(coarseFlatten, 0x334155, 2, 0.8);
    strokePolyline(flattenInto, 0x38bdf8, 2.5);
    drawCubic({ p0, p1, p2, p3 }, 0xe2e8f0, 1.25, 0.8);

    drawCubic(split.left, 0x22c55e, 4, 0.28);
    drawCubic(rightSplit, 0xf59e0b, 4, 0.28);
    drawCubic(part, 0xf472b6, 4, 0.8);
    drawCubic(partInto, 0xfdf2f8, 1.5, 0.8);

    // probe와 closest point
    g.moveTo(probe.x, probe.y).lineTo(closestInto.x, closestInto.y).stroke({ color: 0xf97316, width: 2 });
    drawPoint(probe, 7, 0xf97316);
    drawPoint(closest, 6, 0xfacc15);
    drawPoint(closestInto, 3, 0xffffff);

    // split tangent/second-derivative preview
    const derivativeLength = Math.hypot(derivative.x, derivative.y) || 1;
    const tangentX = derivative.x / derivativeLength;
    const tangentY = derivative.y / derivativeLength;
    const secondLength = Math.hypot(secondDerivative.x, secondDerivative.y) || 1;
    const secondX = secondDerivative.x / secondLength;
    const secondY = secondDerivative.y / secondLength;
    g.moveTo(splitPoint.x - tangentX * 42, splitPoint.y - tangentY * 42)
      .lineTo(splitPoint.x + tangentX * 42, splitPoint.y + tangentY * 42)
      .stroke({ color: 0x22c55e, width: 2 });
    g.moveTo(splitPoint.x, splitPoint.y)
      .lineTo(splitPoint.x + secondX * 34, splitPoint.y + secondY * 34)
      .stroke({ color: 0xa78bfa, width: 2 });

    drawParameterMarkers(extrema, 0x60a5fa);
    drawParameterMarkers(inflections, 0xef4444);
    drawPoint(splitPoint, 7, 0x22c55e);
    drawPoint(halfLengthPoint, 5, 0xa78bfa);
    drawPoint(parameterPoint, 4, 0x94a3b8);

    for (const point of controls) {
      drawPoint(point, 8, point === p0 || point === p3 ? 0x4ade80 : 0xfacc15);
    }

    g.moveTo(rail.x0, rail.y).lineTo(rail.x1, rail.y).stroke({ color: 0x475569, width: 2 });
    drawPoint(splitHandle, 7, 0x22c55e);

    label.text =
      `type=${classification} simple=${simple} linear=${linear} straight=${straight} flatEnough=${flatEnough}` +
      `\nt=${t.toFixed(3)} length=${totalLength.toFixed(1)} lengthAtT=${lengthAtT.toFixed(1)} halfLengthT=${tAtHalfLength.toFixed(3)}` +
      `\nflatten points=${flattenInto.length} coarse=${coarseFlatten.length} extrema=${extrema.map((v) => v.toFixed(2)).join(',') || '-'} inflect=${inflections.map((v) => v.toFixed(2)).join(',') || '-'}` +
      `\ncurvature@t=${curvature.toFixed(4)} closest=(${closestInto.x.toFixed(1)}, ${closestInto.y.toFixed(1)})`;
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    g.destroy();
    label.destroy();
  };
}
