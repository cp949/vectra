/**
 * Hermite Spline Builder
 *
 * endpoint와 tangent handle을 드래그하면 cubic Hermite 곡선이 실시간으로 다시 그려진다.
 * 점선 guide가 만든 cardinal tangent 곡선과 수동 tangent 곡선을 함께 표시해 Hermite form의
 * 위치+접선 입력 흐름을 비교한다.
 *
 * - Interpolation.cubicHermite: x/y scalar Hermite 값을 각각 계산해 곡선 sample point 생성
 * - Interpolation.tangentCardinal: 주변 guide point에서 자동 cardinal tangent 계산
 * - Interpolation.sampleParametersInto: 곡선 polyline preview에 사용할 균등 parameter 생성
 */

import * as Interpolation from '@cp949/vectra/interpolation';

type Point = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const prev = { x: 90, y: 300 };
  const start = { x: 210, y: 310 };
  const end = { x: 520, y: 130 };
  const next = { x: 640, y: 170 };
  const handleStart = { x: 300, y: 120 };
  const handleEnd = { x: 430, y: 320 };

  const draggable: Point[] = [prev, start, end, next, handleStart, handleEnd];
  const parameters: number[] = [];
  const manualSamples: Point[] = [];
  const autoSamples: Point[] = [];
  const marker = { x: 0, y: 0 };

  Interpolation.sampleParametersInto(parameters, 72);

  const HANDLE_RADIUS = 7;
  const HIT_RADIUS = 18;

  let grabbed: Point | undefined;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    for (const point of draggable) {
      if (Math.hypot(point.x - x, point.y - y) < HIT_RADIUS) {
        grabbed = point;
        return;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const { x, y } = getCanvasXY(e);
    grabbed.x = Math.max(24, Math.min(696, x));
    grabbed.y = Math.max(42, Math.min(416, y));
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const pushHermitePoint = (out: Point[], t: number, tangentStart: Point, tangentEnd: Point): void => {
    out.push({
      x: Interpolation.cubicHermite(start.x, tangentStart.x, end.x, tangentEnd.x, t),
      y: Interpolation.cubicHermite(start.y, tangentStart.y, end.y, tangentEnd.y, t),
    });
  };

  const strokePolyline = (points: readonly Point[], color: number, width: number, alpha = 1): void => {
    if (points.length < 2) return;
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.stroke({ color, width, alpha });
  };

  const render = (ticker: PIXI.Ticker): void => {
    const manualStartTangent = { x: handleStart.x - start.x, y: handleStart.y - start.y };
    const manualEndTangent = { x: handleEnd.x - end.x, y: handleEnd.y - end.y };
    const autoStartTangent = {
      x: Interpolation.tangentCardinal(prev.x, end.x, { tension: 0.25 }),
      y: Interpolation.tangentCardinal(prev.y, end.y, { tension: 0.25 }),
    };
    const autoEndTangent = {
      x: Interpolation.tangentCardinal(start.x, next.x, { tension: 0.25 }),
      y: Interpolation.tangentCardinal(start.y, next.y, { tension: 0.25 }),
    };

    manualSamples.length = 0;
    autoSamples.length = 0;
    for (const t of parameters) {
      pushHermitePoint(manualSamples, t, manualStartTangent, manualEndTangent);
      pushHermitePoint(autoSamples, t, autoStartTangent, autoEndTangent);
    }

    const t = (Math.sin(ticker.lastTime / 1200) + 1) / 2;
    marker.x = Interpolation.cubicHermite(start.x, manualStartTangent.x, end.x, manualEndTangent.x, t);
    marker.y = Interpolation.cubicHermite(start.y, manualStartTangent.y, end.y, manualEndTangent.y, t);

    g.clear();

    // Cardinal tangent guide polyline: prev--start--end--next
    g.moveTo(prev.x, prev.y).lineTo(start.x, start.y).lineTo(end.x, end.y).lineTo(next.x, next.y).stroke({
      color: 0x64748b,
      width: 1,
      alpha: 0.75,
    });

    // 수동 tangent handle
    g.moveTo(start.x, start.y).lineTo(handleStart.x, handleStart.y).stroke({ color: 0xf59e0b, width: 1.5 });
    g.moveTo(end.x, end.y).lineTo(handleEnd.x, handleEnd.y).stroke({ color: 0xf59e0b, width: 1.5 });

    strokePolyline(autoSamples, 0x94a3b8, 2, 0.65);
    strokePolyline(manualSamples, 0x38bdf8, 3);

    // 자동 tangent vector preview
    g.moveTo(start.x, start.y)
      .lineTo(start.x + autoStartTangent.x, start.y + autoStartTangent.y)
      .stroke({ color: 0xa78bfa, width: 2 });
    g.moveTo(end.x, end.y)
      .lineTo(end.x + autoEndTangent.x, end.y + autoEndTangent.y)
      .stroke({ color: 0xa78bfa, width: 2 });

    for (const point of [prev, next]) {
      g.circle(point.x, point.y, HANDLE_RADIUS).fill(0x94a3b8);
    }
    for (const point of [start, end]) {
      g.circle(point.x, point.y, HANDLE_RADIUS + 1).fill(0x4ade80);
    }
    for (const point of [handleStart, handleEnd]) {
      g.circle(point.x, point.y, HANDLE_RADIUS).fill(0xf59e0b);
    }
    g.circle(marker.x, marker.y, 6).fill(0xf472b6);

    label.text = 'cyan: manual Hermite  gray: cardinal preview  drag endpoints / tangent handles';
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
