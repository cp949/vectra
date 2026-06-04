/**
 * Ray Intersection Lab
 *
 * 두 ray의 origin과 direction handle을 드래그해 forward 방향 단일 교점, backward 불일치,
 * degenerate ray의 점 취급을 확인한다.
 *
 * - Rays.rayFrom: origin/direction handle에서 RayWritable 생성
 * - Rays.createRay / copyInto: reusable preview ray에 source ray 복사
 * - Rays.singleIntersectionInto / singleIntersection: 두 ray의 단일 교점 계산
 * - Rays.reverse: 반대 방향 preview 계산
 * - Rays.distanceToPointSq: ray와 상대 origin 사이 squared distance 표시
 * - Rays.isDegenerate: direction handle이 origin과 겹친 zero-direction ray 판정
 */

import * as Rays from '@cp949/vectra/ray';

type XY = { x: number; y: number };
type Handle = XY & { role: string; color: number };
type RayHandles = { origin: Handle; direction: Handle };
type RayShape = { origin: XY; direction: XY };

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

  const rayA: RayHandles = {
    origin: { x: 130, y: 320, role: 'A origin', color: 0x38bdf8 },
    direction: { x: 425, y: 145, role: 'A direction', color: 0x38bdf8 },
  };
  const rayB: RayHandles = {
    origin: { x: 145, y: 110, role: 'B origin', color: 0xfb7185 },
    direction: { x: 575, y: 350, role: 'B direction', color: 0xfb7185 },
  };

  const reusableA = Rays.createRay();
  const intersectionOut = { x: 0, y: 0 };
  const HIT_RADIUS = 18;
  let grabbed: Handle | undefined;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clampToStage = (point: XY): void => {
    point.x = Math.max(32, Math.min(size.width - 32, point.x));
    point.y = Math.max(60, Math.min(size.height - 32, point.y));
  };

  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  const toRay = (handles: RayHandles): RayShape => {
    return Rays.rayFrom(handles.origin, {
      x: handles.direction.x - handles.origin.x,
      y: handles.direction.y - handles.origin.y,
    });
  };

  const rayEnd = (ray: RayShape, t: number): XY => Rays.pointAtT(ray, t);

  const onPointerDown = (e: PointerEvent): void => {
    const pointer = getCanvasXY(e);
    const handles = [rayA.origin, rayA.direction, rayB.origin, rayB.direction];
    grabbed = handles.find((handle) => distance(handle, pointer) <= HIT_RADIUS);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const pointer = getCanvasXY(e);
    grabbed.x = pointer.x;
    grabbed.y = pointer.y;
    clampToStage(grabbed);
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawHandle = (handle: Handle): void => {
    g.circle(handle.x, handle.y, grabbed === handle ? 9 : 7).fill({ color: handle.color });
    g.circle(handle.x, handle.y, HIT_RADIUS).stroke({ color: handle.color, width: 1, alpha: 0.18 });
  };

  const drawRay = (ray: RayShape, color: number): void => {
    const end = rayEnd(ray, 3);
    g.moveTo(ray.origin.x, ray.origin.y).lineTo(end.x, end.y).stroke({ color, width: 3 });
    g.moveTo(ray.origin.x, ray.origin.y).lineTo(rayEnd(ray, -0.35).x, rayEnd(ray, -0.35).y).stroke({
      color,
      width: 1,
      alpha: 0.28,
    });
  };

  const drawRayHandles = (handles: RayHandles): void => {
    g.moveTo(handles.origin.x, handles.origin.y).lineTo(handles.direction.x, handles.direction.y).stroke({
      color: handles.origin.color,
      width: 1,
      alpha: 0.45,
    });
    drawHandle(handles.origin);
    drawHandle(handles.direction);
  };

  const render = (): void => {
    const sourceA = toRay(rayA);
    const sourceB = toRay(rayB);
    Rays.copyInto(reusableA, sourceA);

    const hasIntersectionInto = Rays.singleIntersectionInto(intersectionOut, reusableA, sourceB);
    const intersection = Rays.singleIntersection(reusableA, sourceB);
    const reverseA = Rays.reverse(reusableA);
    const reverseEnd = Rays.pointAtT(reverseA, 0.45);
    const aDegenerate = Rays.isDegenerate(reusableA);
    const bDegenerate = Rays.isDegenerate(sourceB);
    const bOriginDistanceSq = Rays.distanceToPointSq(reusableA, sourceB.origin);
    const statusColor = hasIntersectionInto ? 0x4ade80 : aDegenerate || bDegenerate ? 0xfacc15 : 0xf97316;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    drawRay(reusableA, 0x38bdf8);
    drawRay(sourceB, 0xfb7185);
    g.moveTo(reusableA.origin.x, reusableA.origin.y).lineTo(reverseEnd.x, reverseEnd.y).stroke({
      color: 0xa78bfa,
      width: 2,
      alpha: 0.75,
    });

    drawRayHandles(rayA);
    drawRayHandles(rayB);

    if (hasIntersectionInto && intersection) {
      g.circle(intersectionOut.x, intersectionOut.y, 11).fill({ color: statusColor, alpha: 0.25 });
      g.circle(intersection.x, intersection.y, 6).fill({ color: statusColor });
      g.moveTo(reusableA.origin.x, reusableA.origin.y).lineTo(intersection.x, intersection.y).stroke({
        color: statusColor,
        width: 1.5,
        alpha: 0.5,
      });
      g.moveTo(sourceB.origin.x, sourceB.origin.y).lineTo(intersection.x, intersection.y).stroke({
        color: statusColor,
        width: 1.5,
        alpha: 0.5,
      });
    }

    label.text =
      `singleIntersection = ${hasIntersectionInto ? `(${intersectionOut.x.toFixed(1)}, ${intersectionOut.y.toFixed(1)})` : 'none'}` +
      `   A degenerate=${aDegenerate}   B degenerate=${bDegenerate}` +
      `\ndistanceToPointSq(A, B origin) = ${bOriginDistanceSq.toFixed(1)}` +
      '   drag origin/direction handles';
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
