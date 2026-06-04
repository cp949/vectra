/**
 * Arc Length Probe
 *
 * center form arc 위에서 t 기반 sample과 length 기반 sample을 비교하고, 같은 위치의 tangent,
 * normal, closest point, bounds를 정적으로 표시한다.
 *
 * - Curves.arcSample: center form arc를 polyline으로 샘플링해 화면에 그린다
 * - Curves.arcLengthAtT: t 위치까지의 호 길이를 계산한다
 * - Curves.arcPointAtLength: 길이 기준 위치를 새 object로 반환한다
 * - Curves.arcPointAtTInto: t 기준 위치를 재사용 point buffer에 기록한다
 * - Curves.arcTangentAtInto: t 위치의 단위 tangent를 재사용 vector buffer에 기록한다
 * - Curves.arcNormalAtInto: t 위치의 단위 normal을 재사용 vector buffer에 기록한다
 * - Curves.arcClosestPoint: probe 점에서 arc 위 closest point를 새 object로 반환한다
 * - Curves.arcBoundsInto: center form arc의 axis-aligned bounds를 계산한다
 */
import * as Curves from '@cp949/vectra/curve';
import type { CanvasRuntime } from '../../canvas/api';

const ARC = {
  cx: 360,
  cy: 230,
  rx: 230,
  ry: 115,
  xRotation: -0.35,
  startAngle: -2.45,
  endAngle: 1.25,
  sweep: true,
};

const T = 0.65;
const PROBE = { x: 560, y: 128 };

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { draw: d } = runtime;
  d.clear(ctx, '#1e1e1e');

  const bounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
  Curves.arcBoundsInto(bounds, ARC);

  const arcPoints = Curves.arcSample(ARC, 64);
  const lengthAtT = Curves.arcLengthAtT(ARC, T);
  const pointAtLength = Curves.arcPointAtLength(ARC, lengthAtT);
  const closest = Curves.arcClosestPoint(ARC, PROBE);

  const pointAtT = { x: 0, y: 0 };
  const tangent = { x: 0, y: 0 };
  const normal = { x: 0, y: 0 };
  Curves.arcPointAtTInto(pointAtT, ARC, T);
  Curves.arcTangentAtInto(tangent, ARC, T);
  Curves.arcNormalAtInto(normal, ARC, T);

  d.bounds(ctx, bounds, { fill: 'none', stroke: '#475569', strokeWidth: 1 });
  d.polyline(ctx, arcPoints, { color: '#38bdf8', width: 3 });
  drawAxis(ctx, d);

  d.point(ctx, pointAtT, { color: '#facc15', radius: 5 });
  d.point(ctx, pointAtLength, { color: '#fb923c', radius: 4 });
  d.point(ctx, PROBE, { color: '#f472b6', radius: 5 });
  d.point(ctx, closest, { color: '#4ade80', radius: 5 });

  d.segment(ctx, { a: pointAtT, b: scaleFrom(pointAtT, tangent, 52) }, { color: '#facc15', width: 2 });
  d.segment(ctx, { a: pointAtT, b: scaleFrom(pointAtT, normal, 44) }, { color: '#a78bfa', width: 2 });
  d.segment(ctx, { a: PROBE, b: closest }, { color: '#64748b', width: 1 });
  d.segment(ctx, { a: pointAtT, b: pointAtLength }, { color: '#fb923c', width: 1 });

  const delta = Math.hypot(pointAtT.x - pointAtLength.x, pointAtT.y - pointAtLength.y);
  const closestDelta = Math.hypot(PROBE.x - closest.x, PROBE.y - closest.y);

  d.label(ctx, 'arc length probe', { x: 24, y: 32 }, { color: '#e2e8f0', font: '14px sans-serif' });
  d.label(ctx, `length@t=0.65 ${lengthAtT.toFixed(1)}`, { x: 24, y: 58 }, { color: '#facc15' });
  d.label(ctx, `t vs length point delta=${delta.toExponential(1)}`, { x: 24, y: 78 }, { color: '#fb923c' });
  d.label(ctx, `closest delta=${closestDelta.toFixed(1)}`, { x: 24, y: 98 }, { color: '#4ade80' });
  d.label(ctx, 'tangent', scaleFrom(pointAtT, tangent, 62), { color: '#facc15' });
  d.label(ctx, 'normal', scaleFrom(pointAtT, normal, 54), { color: '#a78bfa' });
}

function drawAxis(ctx: CanvasRenderingContext2D, d: CanvasRuntime['draw']): void {
  const ux = Math.cos(ARC.xRotation);
  const uy = Math.sin(ARC.xRotation);
  const vx = -uy;
  const vy = ux;

  d.segment(
    ctx,
    { a: { x: ARC.cx - ux * ARC.rx, y: ARC.cy - uy * ARC.rx }, b: { x: ARC.cx + ux * ARC.rx, y: ARC.cy + uy * ARC.rx } },
    { color: '#334155', width: 1 },
  );
  d.segment(
    ctx,
    { a: { x: ARC.cx - vx * ARC.ry, y: ARC.cy - vy * ARC.ry }, b: { x: ARC.cx + vx * ARC.ry, y: ARC.cy + vy * ARC.ry } },
    { color: '#334155', width: 1 },
  );
  d.point(ctx, { x: ARC.cx, y: ARC.cy }, { color: '#94a3b8', radius: 3 });
}

function scaleFrom(origin: { x: number; y: number }, vector: { x: number; y: number }, distance: number) {
  return { x: origin.x + vector.x * distance, y: origin.y + vector.y * distance };
}
