/**
 * Shape Hitbox Lab
 *
 * 게임/에디터의 hitbox debug board처럼 여러 shape predicate를 같은 화면에서 비교한다. 각 행의 주황
 * handle을 drag하면 해당 hitbox가 고정 zone과 닿는지 다시 판정하고, 닿으면 행 전체가 hit 색으로
 * 바뀐다. 목적은 함수 이름을 따로 외우는 것이 아니라 "어떤 shape pair에 어떤 predicate를 쓰는가"를
 * 실제 충돌 판정 흐름으로 읽는 것이다.
 *
 * - Rectx.containsPoint: pointer가 UI zone 안에 있는지 판정한다.
 * - Intersects.intersectsCircleRect: 원형 cursor와 AABB zone의 overlap을 판정한다.
 * - Intersects.intersectsRectTriangle: triangle hitbox와 AABB zone의 overlap을 판정한다.
 * - Intersects.intersectsSegmentSegment: 두 segment가 서로 crossing/contact하는지 판정한다.
 */

import * as Intersects from '@cp949/vectra/intersects';
import * as Rectx from '@cp949/vectra/rect';

type XY = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };
type Circle = { center: XY; radius: number };
type Segment = { a: XY; b: XY };
type Triangle = { a: XY; b: XY; c: XY };
type CaseId = 'point' | 'circle' | 'triangle' | 'segment';

const BG = 0x0f172a;
const CLEAR = 0x60a5fa;
const HIT = 0xf87171;
const HANDLE = 0xf97316;
const GUIDE = 0x94a3b8;
const LABEL = 0xe2e8f0;
const ROW_H = 96;
const HIT_R = 18;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const title = new PIXI.Text({
    text: 'Shape Hitbox Lab',
    style: { fill: LABEL, fontFamily: 'monospace', fontSize: 15, fontWeight: '700' },
  });
  title.position.set(16, 14);
  app.stage.addChild(title);

  const label = new PIXI.Text({
    text: '',
    style: { fill: LABEL, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 38);
  app.stage.addChild(label);

  const rows = {
    point: { y: 86, name: 'pointer in UI zone', fn: 'rect.containsPoint' },
    circle: { y: 182, name: 'circle cursor vs tile', fn: 'intersectsCircleRect' },
    triangle: { y: 278, name: 'triangle sprite vs zone', fn: 'intersectsRectTriangle' },
    segment: { y: 374, name: 'link segment crossing', fn: 'intersectsSegmentSegment' },
  } satisfies Record<CaseId, { y: number; name: string; fn: string }>;

  const zone: Rect = { x: 360, y: 0, width: 180, height: 56 };
  const point: XY = { x: 250, y: rows.point.y + 28 };
  const circle: Circle = { center: { x: 250, y: rows.circle.y + 28 }, radius: 28 };
  const triangle: Triangle = {
    a: { x: 244, y: rows.triangle.y + 4 },
    b: { x: 302, y: rows.triangle.y + 32 },
    c: { x: 238, y: rows.triangle.y + 58 },
  };
  const triOffsets = [
    { x: triangle.b.x - triangle.a.x, y: triangle.b.y - triangle.a.y },
    { x: triangle.c.x - triangle.a.x, y: triangle.c.y - triangle.a.y },
  ];
  const segA: Segment = {
    a: { x: 360, y: rows.segment.y + 54 },
    b: { x: 540, y: rows.segment.y + 10 },
  };
  const segB: Segment = {
    a: { x: 218, y: rows.segment.y + 14 },
    b: { x: 318, y: rows.segment.y + 58 },
  };

  let dragTarget: CaseId | null = null;

  const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
  const distSq = (a: XY, b: XY): number => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  };

  const rowZone = (id: CaseId): Rect => ({ ...zone, y: rows[id].y });

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  const triangleHandle = (): XY => ({
    x: (triangle.a.x + triangle.b.x + triangle.c.x) / 3,
    y: (triangle.a.y + triangle.b.y + triangle.c.y) / 3,
  });
  let previousTriangleHandle = triangleHandle();

  const handleFor = (id: CaseId): XY => {
    if (id === 'point') return point;
    if (id === 'circle') return circle.center;
    if (id === 'triangle') return triangleHandle();
    return segB.b;
  };

  const nearestHandle = (p: XY): CaseId | null => {
    const order: CaseId[] = ['point', 'circle', 'triangle', 'segment'];
    return order.find((id) => distSq(p, handleFor(id)) <= HIT_R * HIT_R) ?? null;
  };

  const onPointerDown = (e: PointerEvent): void => {
    dragTarget = nearestHandle(getCanvasXY(e));
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (dragTarget === null) return;
    const p = getCanvasXY(e);
    const row = rows[dragTarget];
    const x = clamp(p.x, 28, size.width - 28);
    const y = clamp(p.y, row.y + 8, row.y + ROW_H - 16);

    if (dragTarget === 'point') {
      point.x = x;
      point.y = y;
    } else if (dragTarget === 'circle') {
      circle.center.x = x;
      circle.center.y = y;
    } else if (dragTarget === 'triangle') {
      const dx = x - previousTriangleHandle.x;
      const dy = y - previousTriangleHandle.y;
      triangle.a.x += dx;
      triangle.a.y += dy;
      triangle.b.x = triangle.a.x + triOffsets[0].x;
      triangle.b.y = triangle.a.y + triOffsets[0].y;
      triangle.c.x = triangle.a.x + triOffsets[1].x;
      triangle.c.y = triangle.a.y + triOffsets[1].y;
      previousTriangleHandle = triangleHandle();
    } else {
      segB.b.x = x;
      segB.b.y = y;
    }
  };

  const onPointerUp = (): void => {
    dragTarget = null;
    previousTriangleHandle = triangleHandle();
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const hitFor = (id: CaseId): boolean => {
    if (id === 'point') return Rectx.containsPoint(rowZone(id), point);
    if (id === 'circle') return Intersects.intersectsCircleRect(circle, rowZone(id));
    if (id === 'triangle') return Intersects.intersectsRectTriangle(rowZone(id), triangle);
    return Intersects.intersectsSegmentSegment(segA, segB);
  };

  const drawCaseHeader = (id: CaseId, hit: boolean): void => {
    const row = rows[id];
    const color = hit ? HIT : CLEAR;
    g.rect(0, row.y - 10, size.width, ROW_H).fill({ color, alpha: 0.06 });
  };

  const drawZone = (id: CaseId, hit: boolean): void => {
    const r = rowZone(id);
    const color = hit ? HIT : CLEAR;
    g.rect(r.x, r.y, r.width, r.height).fill({ color, alpha: 0.12 }).stroke({ color, width: 2 });
  };

  const render = (): void => {
    const hits: Record<CaseId, boolean> = {
      point: hitFor('point'),
      circle: hitFor('circle'),
      triangle: hitFor('triangle'),
      segment: hitFor('segment'),
    };

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });
    label.text = [
      'Shape Hitbox Lab',
      `point ${hits.point ? 'hit' : 'clear'}  circle ${hits.circle ? 'hit' : 'clear'}`,
      `triangle ${hits.triangle ? 'hit' : 'clear'}  segment ${hits.segment ? 'hit' : 'clear'}`,
    ].join('\n');

    for (const id of ['point', 'circle', 'triangle', 'segment'] as CaseId[]) {
      drawCaseHeader(id, hits[id]);
    }

    drawZone('point', hits.point);
    g.circle(point.x, point.y, dragTarget === 'point' ? 8 : 6).fill({ color: HANDLE });

    drawZone('circle', hits.circle);
    g.circle(circle.center.x, circle.center.y, circle.radius)
      .fill({ color: hits.circle ? HIT : CLEAR, alpha: 0.16 })
      .stroke({ color: hits.circle ? HIT : CLEAR, width: 2 });
    g.circle(circle.center.x, circle.center.y, dragTarget === 'circle' ? 8 : 6).fill({ color: HANDLE });

    drawZone('triangle', hits.triangle);
    g.poly([triangle.a.x, triangle.a.y, triangle.b.x, triangle.b.y, triangle.c.x, triangle.c.y])
      .fill({ color: hits.triangle ? HIT : CLEAR, alpha: 0.16 })
      .stroke({ color: hits.triangle ? HIT : CLEAR, width: 2 });
    const th = triangleHandle();
    g.circle(th.x, th.y, dragTarget === 'triangle' ? 8 : 6).fill({ color: HANDLE });

    const segColor = hits.segment ? HIT : CLEAR;
    g.moveTo(segA.a.x, segA.a.y).lineTo(segA.b.x, segA.b.y).stroke({ color: GUIDE, width: 4, alpha: 0.9 });
    g.moveTo(segB.a.x, segB.a.y).lineTo(segB.b.x, segB.b.y).stroke({ color: segColor, width: 4 });
    g.circle(segA.a.x, segA.a.y, 4).fill({ color: GUIDE });
    g.circle(segA.b.x, segA.b.y, 4).fill({ color: GUIDE });
    g.circle(segB.a.x, segB.a.y, 5).fill({ color: segColor });
    g.circle(segB.b.x, segB.b.y, dragTarget === 'segment' ? 8 : 6).fill({ color: HANDLE });

    const hitCount = Object.values(hits).filter(Boolean).length;
    label.text = `drag orange handles   active hits: ${hitCount}/4`;
  };

  app.ticker.add(render);
  render();

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    title.destroy();
    label.destroy();
    g.destroy();
  };
}
