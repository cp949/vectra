/**
 * Polyline Path Walk
 *
 * 꼭짓점을 드래그하면 원본 polyline, RDP simplification, arc-length marker, 균등 sample,
 * pointer closest point가 실시간으로 다시 계산된다. 하단 slider는 simplification tolerance를 바꾼다.
 *
 * - Polylines.simplifyInto: Ramer-Douglas-Peucker simplification 결과를 재사용 배열에 기록
 * - Polylines.sampleUniformInto: 고정 spacing의 arc-length sample marker 생성
 * - Polylines.sampleFixedCountInto: 고정 개수의 overview marker 생성
 * - Polylines.pointAtLengthInto: 시간에 따라 polyline 위를 걷는 marker 위치 계산
 * - Polylines.closestPointInto: pointer에서 polyline까지 가장 가까운 점 계산
 * - Polylines.tangentAtIndexInto: 선택된 vertex의 진행 방향 vector 계산
 */

import * as Polylines from '@cp949/vectra/polyline';

type Point = { x: number; y: number };

const HIT_RADIUS = 18;
const VERTEX_RADIUS = 7;
const MIN_TOLERANCE = 0;
const MAX_TOLERANCE = 64;
const SLIDER = { x: 96, y: 398, width: 528 };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const points: Point[] = [
    { x: 70, y: 310 },
    { x: 140, y: 230 },
    { x: 210, y: 280 },
    { x: 285, y: 155 },
    { x: 370, y: 205 },
    { x: 455, y: 120 },
    { x: 555, y: 250 },
    { x: 650, y: 170 },
  ];

  const simplified: Point[] = [];
  const uniformSamples: Point[] = [];
  const fixedSamples: Point[] = [];
  const walker = { x: 0, y: 0 };
  const closest = { x: 0, y: 0 };
  const tangent = { x: 0, y: 0 };
  const pointer = { x: runtime.pointer.x, y: runtime.pointer.y };

  let tolerance = 18;
  let grabbedPoint: Point | undefined;
  let sliderGrabbed = false;

  const canvas = app.canvas as HTMLCanvasElement;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  const toleranceToSliderX = (): number => SLIDER.x + (tolerance / MAX_TOLERANCE) * SLIDER.width;

  const setToleranceFromX = (x: number): void => {
    const t = Math.max(0, Math.min(1, (x - SLIDER.x) / SLIDER.width));
    tolerance = MIN_TOLERANCE + t * (MAX_TOLERANCE - MIN_TOLERANCE);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    pointer.x = x;
    pointer.y = y;

    if (
      Math.abs(y - SLIDER.y) <= HIT_RADIUS &&
      x >= SLIDER.x - HIT_RADIUS &&
      x <= SLIDER.x + SLIDER.width + HIT_RADIUS
    ) {
      sliderGrabbed = true;
      setToleranceFromX(x);
      return;
    }

    for (const point of points) {
      if (Math.hypot(point.x - x, point.y - y) <= HIT_RADIUS) {
        grabbedPoint = point;
        return;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    pointer.x = x;
    pointer.y = y;

    if (sliderGrabbed) {
      setToleranceFromX(x);
      return;
    }

    if (grabbedPoint) {
      grabbedPoint.x = Math.max(28, Math.min(size.width - 28, x));
      grabbedPoint.y = Math.max(54, Math.min(size.height - 72, y));
    }
  };

  const onPointerUp = (): void => {
    grabbedPoint = undefined;
    sliderGrabbed = false;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const strokePolyline = (polyline: readonly Point[], color: number, width: number, alpha = 1): void => {
    if (polyline.length < 2) return;
    g.moveTo(polyline[0].x, polyline[0].y);
    for (let i = 1; i < polyline.length; i++) {
      g.lineTo(polyline[i].x, polyline[i].y);
    }
    g.stroke({ color, width, alpha });
  };

  const drawTangentArrow = (point: Point, direction: Point): void => {
    const length = 34;
    const endX = point.x + direction.x * length;
    const endY = point.y + direction.y * length;
    const px = -direction.y;
    const py = direction.x;
    g.moveTo(point.x, point.y).lineTo(endX, endY).stroke({ color: 0xf59e0b, width: 2 });
    g.moveTo(endX, endY)
      .lineTo(endX - direction.x * 8 + px * 5, endY - direction.y * 8 + py * 5)
      .lineTo(endX - direction.x * 8 - px * 5, endY - direction.y * 8 - py * 5)
      .lineTo(endX, endY)
      .fill(0xf59e0b);
  };

  const render = (ticker: PIXI.Ticker): void => {
    const totalLength = Polylines.length(points);
    const distance = totalLength === 0 ? 0 : (ticker.lastTime / 40) % totalLength;

    Polylines.simplifyInto(simplified, points, tolerance);
    Polylines.sampleUniformInto(uniformSamples, points, 56);
    Polylines.sampleFixedCountInto(fixedSamples, points, 9);
    Polylines.pointAtLengthInto(walker, points, distance);
    Polylines.closestPointInto(closest, points, pointer);

    const selectedIndex = grabbedPoint
      ? points.indexOf(grabbedPoint)
      : Math.min(points.length - 1, Math.floor(points.length / 2));
    const hasTangent = Polylines.tangentAtIndexInto(tangent, points, selectedIndex);

    g.clear();

    // 원본 path와 단순화 path를 겹쳐 비교한다.
    strokePolyline(points, 0x475569, 2, 0.9);
    strokePolyline(simplified, 0x38bdf8, 4, 0.9);

    for (const point of uniformSamples) {
      g.circle(point.x, point.y, 3).fill({ color: 0x94a3b8, alpha: 0.9 });
    }

    for (const point of fixedSamples) {
      g.circle(point.x, point.y, 4).stroke({ color: 0xa78bfa, width: 1.5 });
    }

    for (const point of simplified) {
      g.circle(point.x, point.y, 6).fill(0x38bdf8);
    }

    for (const point of points) {
      g.circle(point.x, point.y, VERTEX_RADIUS).fill(point === grabbedPoint ? 0xfacc15 : 0xf472b6);
    }

    g.moveTo(pointer.x, pointer.y).lineTo(closest.x, closest.y).stroke({ color: 0x64748b, width: 1 });
    g.circle(pointer.x, pointer.y, 5).fill(0xe879f9);
    g.circle(closest.x, closest.y, 6).fill(0x4ade80);
    g.circle(walker.x, walker.y, 7).fill(0xf59e0b);

    if (hasTangent) drawTangentArrow(points[selectedIndex], tangent);

    const sx = toleranceToSliderX();
    g.moveTo(SLIDER.x, SLIDER.y)
      .lineTo(SLIDER.x + SLIDER.width, SLIDER.y)
      .stroke({ color: 0x64748b, width: 3 });
    g.moveTo(SLIDER.x, SLIDER.y).lineTo(sx, SLIDER.y).stroke({ color: 0x38bdf8, width: 3 });
    g.circle(sx, SLIDER.y, 9).fill(0x38bdf8);

    label.text = `tolerance ${tolerance.toFixed(1)}  vertices ${points.length}->${simplified.length}  length ${totalLength.toFixed(1)}`;
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
