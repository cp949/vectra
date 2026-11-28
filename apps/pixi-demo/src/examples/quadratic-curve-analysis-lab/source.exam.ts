/**
 * Quadratic Curve Analysis Lab
 *
 * quadratic Bezier 제어점, probe 점, split handle을 드래그하면 closest point, bounds,
 * split/part curve, adaptive flatten/sample marker, length diagnostics, cubic elevation preview가 함께 갱신된다.
 *
 * - Curves.quadraticClosestPoint / quadraticClosestPointInto: probe에서 curve까지의 최근접점 계산
 * - Curves.quadraticBounds / quadraticBoundsInto: extrema 기반 tight bounds 계산
 * - Curves.quadraticSplit / quadraticSplitInto: split handle의 t에서 좌우 sub-curve 계산
 * - Curves.quadraticPart / quadraticPartInto: split t 주변의 부분 curve preview 계산
 * - Curves.quadraticFlatten / quadraticFlattenInto: adaptive polyline 근사 계산
 * - Curves.quadraticSample / quadraticSampleInto: 균등 parameter sample marker 계산
 * - Curves.quadraticLength / quadraticLengthAtT / quadraticTAtLength: 전체 길이와 t별 누적 길이 계산
 * - Curves.quadraticElevateToCubic / quadraticElevateToCubicInto: 같은 curve를 cubic control form으로 변환
 * - Curves.quadraticDerivativeAtInto / quadraticCurvatureAt / quadraticExtrema: parameter diagnostics 계산
 */

import * as Curves from '@cp949/vectra/curve';

type Point = { x: number; y: number };
type Quadratic = { kind: 'quadratic'; x0: number; y0: number; x1: number; y1: number; x2: number; y2: number };
type Cubic = {
  kind: 'cubic';
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
};

const createQuadratic = (): Quadratic => ({ kind: 'quadratic', x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0 });

const createCubic = (): Cubic => ({ kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 });

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

  const p0 = { x: 105, y: 318 };
  const p1 = { x: 360, y: 62 };
  const p2 = { x: 615, y: 318 };
  const probe = { x: 430, y: 205 };
  const splitHandle = { x: 392, y: 398 };

  const leftSplit = createQuadratic();
  const rightSplit = createQuadratic();
  const partInto = createQuadratic();
  const elevatedInto = createCubic();

  const closestInto = { x: 0, y: 0 };
  const boundsInto = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  const derivative = { x: 0, y: 0 };
  const tangent = { x: 0, y: 0 };
  const splitPoint = { x: 0, y: 0 };
  const halfLengthPoint = { x: 0, y: 0 };
  const markerPoint = { x: 0, y: 0 };
  const flattenInto: Point[] = [];
  const sampleInto: Point[] = [];

  const rail = { x0: 96, x1: 624, y: 398 };
  const controls = [p0, p1, p2];
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

  const drawQuadratic = (curve: Quadratic, color: number, width: number, alpha = 1): void => {
    g.moveTo(curve.x0, curve.y0).quadraticCurveTo(curve.x1, curve.y1, curve.x2, curve.y2).stroke({
      color,
      width,
      alpha,
    });
  };

  const drawCubic = (curve: Cubic, color: number, width: number, alpha = 1): void => {
    g.moveTo(curve.x0, curve.y0)
      .bezierCurveTo(curve.x1, curve.y1, curve.x2, curve.y2, curve.x3, curve.y3)
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

  const drawBounds = (
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    color: number,
    alpha = 1
  ): void => {
    g.rect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY).stroke({
      color,
      width: 1.5,
      alpha,
    });
  };

  const drawParameterMarkers = (curve: Quadratic, parameters: readonly number[], color: number): void => {
    for (const t of parameters) {
      Curves.quadraticPointAtTInto(markerPoint, curve, t);
      drawPoint(markerPoint, 4, color);
    }
  };

  const render = (): void => {
    const curve: Quadratic = { kind: 'quadratic', x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
    const t = (splitHandle.x - rail.x0) / (rail.x1 - rail.x0);
    const fromT = Math.max(0, t - 0.18);
    const toT = Math.min(1, t + 0.18);
    const flatness = 2.4;

    const closest = Curves.quadraticClosestPoint(curve, probe, { sampleCount: 17, tolerance: 1e-8, maxIterations: 20 });
    Curves.quadraticClosestPointInto(closestInto, curve, probe, {
      sampleCount: 17,
      tolerance: 1e-8,
      maxIterations: 20,
    });
    const bounds = Curves.quadraticBounds(curve);
    Curves.quadraticBoundsInto(boundsInto, curve);
    const split = Curves.quadraticSplit(curve, t);
    Curves.quadraticSplitInto(leftSplit, rightSplit, curve, t);
    const part = Curves.quadraticPart(curve, fromT, toT);
    Curves.quadraticPartInto(partInto, curve, fromT, toT);
    const coarseFlatten = Curves.quadraticFlatten(curve, { flatness: 13, maxRecursion: 32 });
    Curves.quadraticFlattenInto(flattenInto, curve, { flatness, maxRecursion: 32 });
    const sample = Curves.quadraticSample(curve, { steps: 9 });
    Curves.quadraticSampleInto(sampleInto, curve, { steps: 15 });
    const elevated = Curves.quadraticElevateToCubic(curve);
    Curves.quadraticElevateToCubicInto(elevatedInto, curve);
    const totalLength = Curves.quadraticLength(curve);
    const lengthAtT = Curves.quadraticLengthAtT(curve, t);
    const tAtHalfLength = Curves.quadraticTAtLength(curve, totalLength / 2);
    const curvature = Curves.quadraticCurvatureAt(curve, t);
    const extrema = Curves.quadraticExtrema(curve);

    Curves.quadraticPointAtTInto(splitPoint, curve, t);
    Curves.quadraticPointAtTInto(halfLengthPoint, curve, tAtHalfLength);
    Curves.quadraticDerivativeAtInto(derivative, curve, t);
    Curves.quadraticTangentAtInto(tangent, curve, t);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    g.moveTo(p0.x, p0.y).lineTo(p1.x, p1.y).lineTo(p2.x, p2.y).stroke({ color: 0x64748b, width: 1 });
    g.moveTo(elevatedInto.x0, elevatedInto.y0)
      .lineTo(elevatedInto.x1, elevatedInto.y1)
      .lineTo(elevatedInto.x2, elevatedInto.y2)
      .lineTo(elevatedInto.x3, elevatedInto.y3)
      .stroke({ color: 0xa78bfa, width: 1, alpha: 0.72 });

    drawBounds(bounds, 0x60a5fa, 0.5);
    drawBounds(boundsInto, 0x93c5fd, 0.9);
    strokePolyline(coarseFlatten, 0x334155, 2, 0.8);
    strokePolyline(flattenInto, 0x38bdf8, 2.5);
    drawQuadratic(curve, 0xe2e8f0, 1.25, 0.85);
    drawCubic(elevated, 0xa78bfa, 2, 0.35);

    drawQuadratic(split.left, 0x22c55e, 4, 0.28);
    drawQuadratic(rightSplit, 0xf59e0b, 4, 0.28);
    drawQuadratic(part, 0xf472b6, 4, 0.8);
    drawQuadratic(partInto, 0xfdf2f8, 1.5, 0.8);

    g.moveTo(probe.x, probe.y).lineTo(closestInto.x, closestInto.y).stroke({ color: 0xf97316, width: 2 });
    drawPoint(probe, 7, 0xf97316);
    drawPoint(closest, 6, 0xfacc15);
    drawPoint(closestInto, 3, 0xffffff);

    const derivativeLength = Math.hypot(derivative.x, derivative.y) || 1;
    const dx = derivative.x / derivativeLength;
    const dy = derivative.y / derivativeLength;
    g.moveTo(splitPoint.x - tangent.x * 42, splitPoint.y - tangent.y * 42)
      .lineTo(splitPoint.x + tangent.x * 42, splitPoint.y + tangent.y * 42)
      .stroke({ color: 0x22c55e, width: 2 });
    g.moveTo(splitPoint.x, splitPoint.y)
      .lineTo(splitPoint.x + dx * 34, splitPoint.y + dy * 34)
      .stroke({ color: 0xa78bfa, width: 2 });

    for (const point of sample) drawPoint(point, 3.5, 0x64748b);
    for (const point of sampleInto) drawPoint(point, 2.5, 0x38bdf8);
    drawParameterMarkers(curve, extrema, 0x60a5fa);
    drawPoint(splitPoint, 7, 0x22c55e);
    drawPoint(halfLengthPoint, 5, 0xa78bfa);

    for (const point of controls) {
      drawPoint(point, 8, point === p1 ? 0xfacc15 : 0x4ade80);
    }

    g.moveTo(rail.x0, rail.y).lineTo(rail.x1, rail.y).stroke({ color: 0x475569, width: 2 });
    drawPoint(splitHandle, 7, 0x22c55e);

    label.text =
      `t=${t.toFixed(3)} length=${totalLength.toFixed(1)} lengthAtT=${lengthAtT.toFixed(1)} halfLengthT=${tAtHalfLength.toFixed(3)}` +
      `\nflatten points=${flattenInto.length} coarse=${coarseFlatten.length} sample=${sampleInto.length} extrema=${extrema.map((v) => v.toFixed(2)).join(',') || '-'}` +
      `\ncurvature@t=${curvature.toFixed(4)} bounds=${(bounds.maxX - bounds.minX).toFixed(1)}x${(bounds.maxY - bounds.minY).toFixed(1)}` +
      `\nclosest=(${closestInto.x.toFixed(1)}, ${closestInto.y.toFixed(1)}) elevated cubic p1=(${elevatedInto.x1.toFixed(1)}, ${elevatedInto.y1.toFixed(1)})`;
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
