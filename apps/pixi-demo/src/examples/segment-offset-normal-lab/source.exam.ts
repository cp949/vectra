/**
 * Segment Offset Normal Lab
 *
 * segment 양 끝점과 offset handle을 드래그하면 법선 방향 offset segment, projection foot,
 * 연장 segment, 중심 회전 preview, bounds가 실시간으로 갱신된다.
 *
 * - Segments.normal: segment의 left normal 단위벡터 계산
 * - Segments.translate: normal offset segment 계산
 * - Segments.projectPoint: offset handle을 원본 segment의 무한 직선에 투영
 * - Segments.extend: 원본 segment를 양쪽으로 연장한 preview 계산
 * - Segments.rotateAround: midpoint 기준 회전 preview 계산
 * - Segments.boundsInto: 원본 segment endpoint bounds를 frame으로 표시
 */

import * as Segments from '@cp949/vectra/segment';

type XY = { x: number; y: number };
type Segment = { a: XY; b: XY };

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

  const segment: Segment = { a: { x: 150, y: 260 }, b: { x: 470, y: 170 } };
  const offsetHandle: XY = { x: 350, y: 90 };
  const projection = { x: 0, y: 0 };
  const bounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };

  const HIT_TOLERANCE = 18;
  const ROTATION_RADIANS = Math.PI / 9;

  let grabbed: XY | undefined;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    const handles = [segment.a, segment.b, offsetHandle];
    grabbed = handles.find((h) => distance(h, p) <= HIT_TOLERANCE);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    grabbed.x = Math.max(24, Math.min(696, p.x));
    grabbed.y = Math.max(48, Math.min(416, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawSegment = (line: Segment, color: number, width = 2): void => {
    g.moveTo(line.a.x, line.a.y).lineTo(line.b.x, line.b.y).stroke({ color, width });
  };

  const drawHandle = (p: XY, color: number): void => {
    g.circle(p.x, p.y, 7).fill(color);
  };

  const render = (): void => {
    const normal = Segments.normal(segment);
    const foot = Segments.projectPoint(segment, offsetHandle);
    projection.x = foot.x;
    projection.y = foot.y;

    const offsetDistance = (offsetHandle.x - projection.x) * normal.x + (offsetHandle.y - projection.y) * normal.y;
    const offsetVector = { x: normal.x * offsetDistance, y: normal.y * offsetDistance };
    const offsetSegment = Segments.translate(segment, offsetVector);
    const extendedSegment = Segments.extend(segment, 56, 56);
    const midpoint = Segments.midpoint(segment);
    const rotatedSegment = Segments.rotateAround(segment, midpoint, ROTATION_RADIANS);
    const projectionT = Segments.projectionT(segment, offsetHandle);
    const classification = Segments.classifyPoint(segment, projection, 0.5);
    const nearOriginal = Segments.containsPoint(segment, offsetHandle, 10);
    const normalAngle = Segments.normalAngle(segment);
    const dist = Math.sqrt(Segments.distanceToPointSq(segment, offsetHandle));
    Segments.boundsInto(bounds, segment);

    g.clear();

    // endpoint bounds 표시
    g.rect(bounds.min.x, bounds.min.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y).stroke({
      color: 0x475569,
      width: 1,
    });

    // 비교 preview 표시
    drawSegment(extendedSegment, 0x64748b, 1.5);
    drawSegment(rotatedSegment, 0xa78bfa, 1.5);
    drawSegment(offsetSegment, 0x38bdf8, 3);
    drawSegment(segment, 0xf8fafc, 3);

    // offset handle에서 projection foot까지의 수직 관계
    g.moveTo(offsetHandle.x, offsetHandle.y).lineTo(projection.x, projection.y).stroke({
      color: 0xf59e0b,
      width: 1.5,
    });
    g.circle(projection.x, projection.y, 5).fill(0xf59e0b);

    // midpoint의 left normal 방향 화살표
    const arrowEnd = { x: midpoint.x + normal.x * 52, y: midpoint.y + normal.y * 52 };
    g.moveTo(midpoint.x, midpoint.y).lineTo(arrowEnd.x, arrowEnd.y).stroke({ color: 0x22c55e, width: 2 });
    g.circle(arrowEnd.x, arrowEnd.y, 4).fill(0x22c55e);

    drawHandle(segment.a, grabbed === segment.a ? 0xf472b6 : 0xe2e8f0);
    drawHandle(segment.b, grabbed === segment.b ? 0xf472b6 : 0xe2e8f0);
    drawHandle(offsetHandle, grabbed === offsetHandle ? 0xf472b6 : 0xf59e0b);

    const offset = Math.round(offsetDistance);
    const t = projectionT.toFixed(2);
    const angleDeg = Math.round((normalAngle * 180) / Math.PI);
    const hit = nearOriginal ? 'near' : 'offset';
    label.text = `offset ${offset}px | projection t=${t} ${classification} | normal ${angleDeg}deg | distance ${Math.round(
      dist
    )}px | ${hit}`;
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
