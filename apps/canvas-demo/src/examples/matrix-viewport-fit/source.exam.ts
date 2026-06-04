/**
 * Matrix Viewport Fit
 *
 * world bounds 안의 model geometry를 canvas viewport에 contain 방식으로 맞추고,
 * screen marker를 inverse matrix로 world 좌표에 되돌려 표시한다.
 *
 * - Matrices.fitBounds: world bounds를 viewport bounds에 맞추는 world→screen matrix 생성
 * - Matrices.transformBounds: world bounds가 화면에서 차지하는 AABB 계산
 * - Matrices.transformPoint: model point와 world point를 screen point로 변환
 * - Matrices.transformVector: world 방향 벡터가 screen에서 어떤 크기와 방향이 되는지 계산
 * - Matrices.isInvertible / invert: screen point를 다시 world point로 되돌리는 inverse matrix 계산
 */
import * as Matrices from '@cp949/vectra/matrix';

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { bounds: worldBounds, draw: d } = runtime;
  const viewport = { min: { x: 80, y: 64 }, max: { x: 680, y: 360 } };
  const modelPoints = [
    { x: -80, y: -40 },
    { x: 60, y: 120 },
    { x: 180, y: 20 },
    { x: 300, y: 210 },
  ];

  d.clear(ctx, '#1e1e1e');

  const worldToScreen = Matrices.fitBounds(worldBounds, viewport, { mode: 'contain' });
  const fittedWorldBounds = Matrices.transformBounds(worldToScreen, worldBounds);
  const screenPolyline = modelPoints.map((point) => Matrices.transformPoint(worldToScreen, point));
  const screenStep = Matrices.transformVector(worldToScreen, { x: 80, y: 0 });
  const invertible = Matrices.isInvertible(worldToScreen);
  const screenToWorld = Matrices.invert(worldToScreen);

  d.bounds(ctx, viewport, { fill: 'rgba(100,116,139,0.10)', stroke: '#475569', strokeWidth: 1 });
  d.bounds(ctx, fittedWorldBounds, { fill: 'rgba(56,189,248,0.08)', stroke: '#38bdf8', strokeWidth: 2 });
  d.polyline(ctx, screenPolyline, { color: '#facc15', width: 2 });

  for (const point of screenPolyline) {
    d.point(ctx, point, { color: '#facc15', radius: 4 });
  }

  const screenMarker = { x: 620, y: 120 };
  const worldMarker = screenToWorld ? Matrices.transformPoint(screenToWorld, screenMarker) : { x: Number.NaN, y: Number.NaN };
  const roundTripMarker = Matrices.transformPoint(worldToScreen, worldMarker);
  const scale = Math.hypot(screenStep.x, screenStep.y) / 80;

  d.point(ctx, screenMarker, { color: '#fb7185', radius: 5 });
  d.point(ctx, roundTripMarker, { color: '#4ade80', radius: 3 });
  d.segment(ctx, { a: screenMarker, b: roundTripMarker }, { color: '#4ade80', width: 1 });

  d.label(ctx, 'fitBounds contain', { x: 84, y: 40 }, { color: '#38bdf8' });
  d.label(ctx, `scale=${scale.toFixed(2)}  tx=${worldToScreen.tx.toFixed(1)}  ty=${worldToScreen.ty.toFixed(1)}`, { x: 84, y: 384 }, { color: '#e2e8f0' });
  d.label(ctx, `inverse ok=${invertible}`, { x: 84, y: 404 }, { color: '#e2e8f0' });
  d.label(
    ctx,
    `screen(620,120) -> world(${worldMarker.x.toFixed(1)},${worldMarker.y.toFixed(1)})`,
    { x: 360, y: 404 },
    { color: '#fb7185' }
  );
}
