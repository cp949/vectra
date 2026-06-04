/**
 * Segment Contact Gates Lab
 *
 * path segment와 circle, bounds, triangle gate를 드래그하면 각 gate의 교차 상태와 단일 접점 marker가
 * 실시간으로 갱신된다. sensor circle은 gate끼리 겹치는지 함께 표시해 moving object collision gate 흐름을 보여준다.
 *
 * - Intersections.intersectsCircleSegment: circle gate와 path segment의 closed disk 교차 판정
 * - Intersections.intersectsBoundsSegment: bounds gate와 path segment의 axis-aligned box 교차 판정
 * - Intersections.intersectsTriangleSegment: triangle gate와 path segment의 교차 판정
 * - Intersections.singleIntersectionSegmentCircle: circle gate가 tangent처럼 단일 접점일 때 marker 계산
 * - Intersections.singleIntersectionSegmentBounds: bounds gate가 단일 border 접점일 때 marker 계산
 * - Intersections.singleIntersectionSegmentTriangle: triangle gate가 단일 edge 접점일 때 marker 계산
 * - Intersections.intersectsCircleBounds: sensor circle과 bounds gate의 overlap 판정
 * - Intersections.intersectsCircleTriangle: sensor circle과 triangle gate의 overlap 판정
 */

import * as Intersections from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Segment = { a: XY; b: XY };
type Bounds = { min: XY; max: XY };
type Circle = { center: XY; radius: number };
type Triangle = { a: XY; b: XY; c: XY };

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

  const path: Segment = { a: { x: 95, y: 360 }, b: { x: 670, y: 105 } };
  const circleGate: Circle = { center: { x: 250, y: 205 }, radius: 72 };
  const circleRadiusHandle: XY = { x: circleGate.center.x + circleGate.radius, y: circleGate.center.y };
  const boundsGate: Bounds = { min: { x: 385, y: 245 }, max: { x: 575, y: 370 } };
  const triangleGate: Triangle = {
    a: { x: 450, y: 90 },
    b: { x: 615, y: 155 },
    c: { x: 530, y: 230 },
  };
  const sensor: Circle = { center: { x: 0, y: 0 }, radius: 42 };

  const HIT_RADIUS = 18;
  const HANDLE_RADIUS = 7;
  let grabbed: XY | undefined;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  const clampToCanvas = (point: XY): void => {
    point.x = Math.max(24, Math.min(size.width - 24, point.x));
    point.y = Math.max(56, Math.min(size.height - 24, point.y));
  };

  const normalizedBounds = (): Bounds => {
    const minX = Math.min(boundsGate.min.x, boundsGate.max.x);
    const minY = Math.min(boundsGate.min.y, boundsGate.max.y);
    const maxX = Math.max(boundsGate.min.x, boundsGate.max.x);
    const maxY = Math.max(boundsGate.min.y, boundsGate.max.y);
    return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
  };

  const syncRadiusHandle = (): void => {
    const dx = circleRadiusHandle.x - circleGate.center.x;
    const dy = circleRadiusHandle.y - circleGate.center.y;
    const handleDistance = Math.hypot(dx, dy);
    const radius = Math.max(16, handleDistance);
    circleGate.radius = radius;
    if (handleDistance === 0) {
      circleRadiusHandle.x = circleGate.center.x + radius;
      circleRadiusHandle.y = circleGate.center.y;
      return;
    }
    const inv = 1 / handleDistance;
    circleRadiusHandle.x = circleGate.center.x + dx * inv * radius;
    circleRadiusHandle.y = circleGate.center.y + dy * inv * radius;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const pointer = getCanvasXY(e);
    const handles = [
      path.a,
      path.b,
      circleGate.center,
      circleRadiusHandle,
      boundsGate.min,
      boundsGate.max,
      triangleGate.a,
      triangleGate.b,
      triangleGate.c,
    ];
    grabbed = handles.find((handle) => distance(handle, pointer) <= HIT_RADIUS);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const pointer = getCanvasXY(e);
    const oldX = grabbed.x;
    const oldY = grabbed.y;
    grabbed.x = pointer.x;
    grabbed.y = pointer.y;
    clampToCanvas(grabbed);
    if (grabbed === circleGate.center) {
      circleRadiusHandle.x += circleGate.center.x - oldX;
      circleRadiusHandle.y += circleGate.center.y - oldY;
      clampToCanvas(circleRadiusHandle);
    }
    if (grabbed === circleRadiusHandle) syncRadiusHandle();
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawHandle = (p: XY, color: number): void => {
    g.circle(p.x, p.y, HANDLE_RADIUS).fill({ color });
  };

  const drawHitMarker = (p: XY | undefined, color: number): void => {
    if (!p) return;
    g.circle(p.x, p.y, 7).stroke({ color, width: 2.5 });
    g.moveTo(p.x - 8, p.y)
      .lineTo(p.x + 8, p.y)
      .stroke({ color, width: 1.5 });
    g.moveTo(p.x, p.y - 8)
      .lineTo(p.x, p.y + 8)
      .stroke({ color, width: 1.5 });
  };

  const contactColor = (active: boolean, idle: number): number => (active ? 0xfb7185 : idle);
  const status = (active: boolean): string => (active ? 'hit' : 'clear');

  const render = (): void => {
    syncRadiusHandle();
    const bounds = normalizedBounds();
    sensor.center.x = path.b.x;
    sensor.center.y = path.b.y;

    const circleHit = Intersections.intersectsCircleSegment(circleGate, path);
    const boundsHit = Intersections.intersectsBoundsSegment(bounds, path);
    const triangleHit = Intersections.intersectsTriangleSegment(triangleGate, path);
    const sensorBoundsHit = Intersections.intersectsCircleBounds(sensor, bounds);
    const sensorTriangleHit = Intersections.intersectsCircleTriangle(sensor, triangleGate);

    const circleSingle = Intersections.singleIntersectionSegmentCircle(path, circleGate, 0.001);
    const boundsSingle = Intersections.singleIntersectionSegmentBounds(path, bounds, 0.001);
    const triangleSingle = Intersections.singleIntersectionSegmentTriangle(path, triangleGate, 0.001);

    g.clear();

    g.moveTo(path.a.x, path.a.y).lineTo(path.b.x, path.b.y).stroke({ color: 0xf8fafc, width: 3 });
    g.circle(sensor.center.x, sensor.center.y, sensor.radius).stroke({
      color: sensorBoundsHit || sensorTriangleHit ? 0xf59e0b : 0x64748b,
      width: 1.5,
    });

    g.circle(circleGate.center.x, circleGate.center.y, circleGate.radius)
      .fill({ color: 0x1e293b, alpha: 0.28 })
      .stroke({ color: contactColor(circleHit, 0x38bdf8), width: 2.5 });
    g.moveTo(circleGate.center.x, circleGate.center.y).lineTo(circleRadiusHandle.x, circleRadiusHandle.y).stroke({
      color: 0x475569,
      width: 1,
    });

    const w = bounds.max.x - bounds.min.x;
    const h = bounds.max.y - bounds.min.y;
    g.rect(bounds.min.x, bounds.min.y, w, h)
      .fill({ color: 0x1e293b, alpha: 0.28 })
      .stroke({ color: contactColor(boundsHit, 0xa78bfa), width: 2.5 });

    g.poly([triangleGate.a.x, triangleGate.a.y, triangleGate.b.x, triangleGate.b.y, triangleGate.c.x, triangleGate.c.y])
      .fill({ color: 0x1e293b, alpha: 0.28 })
      .stroke({ color: contactColor(triangleHit, 0x4ade80), width: 2.5 });

    drawHitMarker(circleSingle, 0x38bdf8);
    drawHitMarker(boundsSingle, 0xa78bfa);
    drawHitMarker(triangleSingle, 0x4ade80);

    drawHandle(path.a, grabbed === path.a ? 0xf472b6 : 0xe2e8f0);
    drawHandle(path.b, grabbed === path.b ? 0xf472b6 : 0xe2e8f0);
    drawHandle(circleGate.center, grabbed === circleGate.center ? 0xf472b6 : 0x38bdf8);
    drawHandle(circleRadiusHandle, grabbed === circleRadiusHandle ? 0xf472b6 : 0x38bdf8);
    drawHandle(boundsGate.min, grabbed === boundsGate.min ? 0xf472b6 : 0xa78bfa);
    drawHandle(boundsGate.max, grabbed === boundsGate.max ? 0xf472b6 : 0xa78bfa);
    drawHandle(triangleGate.a, grabbed === triangleGate.a ? 0xf472b6 : 0x4ade80);
    drawHandle(triangleGate.b, grabbed === triangleGate.b ? 0xf472b6 : 0x4ade80);
    drawHandle(triangleGate.c, grabbed === triangleGate.c ? 0xf472b6 : 0x4ade80);

    const singleCount = [circleSingle, boundsSingle, triangleSingle].filter(Boolean).length;
    label.text = [
      `segment gates: circle=${status(circleHit)} bounds=${status(boundsHit)} triangle=${status(triangleHit)}`,
      `single contact markers=${singleCount} | sensor vs bounds=${status(sensorBoundsHit)} triangle=${status(sensorTriangleHit)}`,
    ].join('\n');
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
