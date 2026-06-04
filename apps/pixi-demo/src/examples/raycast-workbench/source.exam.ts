/**
 * Raycast Workbench
 *
 * 같은 emitter와 aim ray로 AABB, circle, finite wall segment, cubic path target을 비교한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };

const BG = 0x0f172a;
const LABEL = 0xe2e8f0;
const GUIDE = 0x64748b;
const HIT = 0xf87171;
const CLEAR = 0x60a5fa;
const HANDLE = 0xf97316;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;
  const g = new PIXI.Graphics();
  app.stage.addChild(g);
  const label = new PIXI.Text({ text: '', style: { fill: LABEL, fontFamily: 'monospace', fontSize: 13 } });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const origin: XY = { x: 92, y: 260 };
  const aim: XY = { x: 560, y: 185 };
  const bounds = { min: { x: 280, y: 92 }, max: { x: 410, y: 188 } };
  const circle = { center: { x: 525, y: 305 }, radius: 58 };
  const wall = { a: { x: 440, y: 115 }, b: { x: 610, y: 180 } };
  const p0: XY = { x: 310, y: 430 };
  const p1: XY = { x: 420, y: 250 };
  const p2: XY = { x: 560, y: 520 };
  const p3: XY = { x: 700, y: 340 };
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(p.x - aim.x, p.y - aim.y) <= 24;
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    aim.x = Math.max(16, Math.min(size.width - 16, p.x));
    aim.y = Math.max(16, Math.min(size.height - 16, p.y));
  };
  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    const ray = { origin, direction: { x: aim.x - origin.x, y: aim.y - origin.y } };
    const hitBounds = Intersects.intersectsBoundsRay(bounds, ray);
    const hitCircle = Intersects.intersectsCircleRay(circle, ray);
    const hitWall = Intersects.intersectsRaySegment(ray, wall);
    const curveHits = Intersects.rayCubicIntersections(ray, p0, p1, p2, p3);
    const len = Math.hypot(ray.direction.x, ray.direction.y) || 1;
    const end = { x: origin.x + (ray.direction.x / len) * 1200, y: origin.y + (ray.direction.y / len) * 1200 };

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });
    g.moveTo(origin.x, origin.y)
      .lineTo(end.x, end.y)
      .stroke({ color: curveHits.length || hitBounds || hitCircle || hitWall ? HIT : CLEAR, width: 2 });
    g.rect(bounds.min.x, bounds.min.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y).stroke({
      color: hitBounds ? HIT : GUIDE,
      width: 3,
    });
    g.circle(circle.center.x, circle.center.y, circle.radius).stroke({ color: hitCircle ? HIT : GUIDE, width: 3 });
    g.moveTo(wall.a.x, wall.a.y)
      .lineTo(wall.b.x, wall.b.y)
      .stroke({ color: hitWall ? HIT : GUIDE, width: 4 });
    g.moveTo(p0.x, p0.y)
      .bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
      .stroke({ color: curveHits.length ? HIT : GUIDE, width: 3 });
    for (const hit of curveHits) g.circle(hit.point.x, hit.point.y, 6).fill({ color: HIT });
    g.circle(origin.x, origin.y, 6).fill({ color: LABEL });
    g.circle(aim.x, aim.y, grabbed ? 9 : 7).fill({ color: HANDLE });
    label.text = `Raycast Workbench\nbounds ${hitBounds}  circle ${hitCircle}  wall ${hitWall}  cubic hits ${curveHits.length}`;
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
