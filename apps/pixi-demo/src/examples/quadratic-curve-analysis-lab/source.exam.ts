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
type Quadratic = { p0: Point; p1: Point; p2: Point };
type Cubic = { p0: Point; p1: Point; p2: Point; p3: Point };

const createQuadratic = (): Quadratic => ({
  p0: { x: 0, y: 0 },
  p1: { x: 0, y: 0 },
  p2: { x: 0, y: 0 },
});

const createCubic = (): Cubic => ({
  p0: { x: 0, y: 0 },
  p1: { x: 0, y: 0 },
  p2: { x: 0, y: 0 },
  p3: { x: 0, y: 0 },
});

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
  const boundsInto = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
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
    g.moveTo(curve.p0.x, curve.p0.y).quadraticCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y).stroke({
      color,
      width,
      alpha,
    });
  };

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

  const drawBounds = (bounds: { min: Point; max: Point }, color: number, alpha = 1): void => {
    g.rect(bounds.min.x, bounds.min.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y).stroke({
      color,
      width: 1.5,
      alpha,
    });
  };

  const drawParameterMarkers = (parameters: readonly number[], color: number): void => {
    for (const t of parameters) {
      Curves.quadraticPointAtTInto(markerPoint, p0, p1, p2, t);
      drawPoint(markerPoint, 4, color);
    }
  };

  const render = (): void => {
    const curve = { p0, p1, p2 };
    const t = (splitHandle.x - rail.x0) / (rail.x1 - rail.x0);
    const fromT = Math.max(0, t - 0.18);
    const toT = Math.min(1, t + 0.18);
    const flatness = 2.4;

    const closest = Curves.quadraticClosestPoint(p0, p1, p2, probe, { sampleCount: 17 });
    Curves.quadraticClosestPointInto(closestInto, p0, p1, p2, probe, { sampleCount: 17 });
    const bounds = Curves.quadraticBounds(p0, p1, p2);
    Curves.quadraticBoundsInto(boundsInto, p0, p1, p2);
    const split = Curves.quadraticSplit(p0, p1, p2, t);
    Curves.quadraticSplitInto(leftSplit, rightSplit, p0, p1, p2, t);
    const part = Curves.quadraticPart(p0, p1, p2, fromT, toT);
    Curves.quadraticPartInto(partInto, p0, p1, p2, fromT, toT);
    const coarseFlatten = Curves.quadraticFlatten(p0, p1, p2, { flatness: 13 });
    Curves.quadraticFlattenInto(flattenInto, p0, p1, p2, { flatness });
    const sample = Curves.quadraticSample(p0, p1, p2, { steps: 9 });
    Curves.quadraticSampleInto(sampleInto, p0, p1, p2, { steps: 15 });
    const elevated = Curves.quadraticElevateToCubic(p0, p1, p2);
    Curves.quadraticElevateToCubicInto(elevatedInto, p0, p1, p2);
    const totalLength = Curves.quadraticLength(p0, p1, p2);
    const lengthAtT = Curves.quadraticLengthAtT(p0, p1, p2, t);
    const tAtHalfLength = Curves.quadraticTAtLength(p0, p1, p2, totalLength / 2);
    const curvature = Curves.quadraticCurvatureAt(p0, p1, p2, t);
    const extrema = Curves.quadraticExtrema(p0, p1, p2);

    Curves.quadraticPointAtTInto(splitPoint, p0, p1, p2, t);
    Curves.quadraticPointAtTInto(halfLengthPoint, p0, p1, p2, tAtHalfLength);
    Curves.quadraticDerivativeAtInto(derivative, p0, p1, p2, t);
    Curves.quadraticTangentAtInto(tangent, p0, p1, p2, t);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    g.moveTo(p0.x, p0.y).lineTo(p1.x, p1.y).lineTo(p2.x, p2.y).stroke({ color: 0x64748b, width: 1 });
    g.moveTo(elevatedInto.p0.x, elevatedInto.p0.y)
      .lineTo(elevatedInto.p1.x, elevatedInto.p1.y)
      .lineTo(elevatedInto.p2.x, elevatedInto.p2.y)
      .lineTo(elevatedInto.p3.x, elevatedInto.p3.y)
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
    drawParameterMarkers(extrema, 0x60a5fa);
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
      `\ncurvature@t=${curvature.toFixed(4)} bounds=${(bounds.max.x - bounds.min.x).toFixed(1)}x${(bounds.max.y - bounds.min.y).toFixed(1)}` +
      `\nclosest=(${closestInto.x.toFixed(1)}, ${closestInto.y.toFixed(1)}) elevated cubic p1=(${elevatedInto.p1.x.toFixed(1)}, ${elevatedInto.p1.y.toFixed(1)})`;
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
