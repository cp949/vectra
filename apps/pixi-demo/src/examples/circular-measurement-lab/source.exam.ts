/**
 * Circular Measurement Lab
 *
 * 원 위 progress handle을 drag해 arc height, sector area, turn marker, orbit segment hit를 같은 원형
 * measurement 작업 흐름에서 비교한다.
 */

import * as Circlex from '@cp949/vectra/circle';
import * as Intersects from '@cp949/vectra/intersects';
import * as Segmentx from '@cp949/vectra/segment';

type XY = { x: number; y: number };

const BG = 0x0f172a;
const LABEL = 0xe2e8f0;
const GUIDE = 0x64748b;
const RESULT = 0x4ade80;
const HANDLE = 0xf97316;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;
  const g = new PIXI.Graphics();
  app.stage.addChild(g);
  const label = new PIXI.Text({ text: '', style: { fill: LABEL, fontFamily: 'monospace', fontSize: 13 } });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const circle = { center: { x: 390, y: 270 }, radius: 145 };
  const startAngle = -Math.PI * 0.75;
  const orbitSegment = { a: { x: 230, y: 420 }, b: { x: 570, y: 120 } };
  const arcPoint: XY = { x: 0, y: 0 };
  const turnPoint: XY = { x: 0, y: 0 };
  const nearest: XY = { x: 0, y: 0 };
  const segMid: XY = { x: 0, y: 0 };
  let angle = Math.PI * 0.45;
  let grabbed = false;

  const pointAt = (a: number): XY => ({
    x: circle.center.x + Math.cos(a) * circle.radius,
    y: circle.center.y + Math.sin(a) * circle.radius,
  });
  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    const h = pointAt(angle);
    grabbed = Math.hypot(p.x - h.x, p.y - h.y) <= 24;
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    angle = Math.atan2(p.y - circle.center.y, p.x - circle.center.x);
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
    const centralAngle = Math.abs(angle - startAngle);
    const turn = (((angle / (Math.PI * 2)) % 1) + 1) % 1;
    Circlex.pointAtAngleInto(arcPoint, circle, angle);
    Circlex.pointAtTurnInto(turnPoint, circle, turn);
    Segmentx.pointAtTInto(segMid, orbitSegment, 0.5);
    Circlex.closestPointInto(nearest, circle, segMid);
    const sagitta = Circlex.sagitta(circle, centralAngle);
    const sectorArea = Circlex.sectorArea(circle, centralAngle);
    const hit = Intersects.intersectsCircleSegment(circle, orbitSegment);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });
    g.circle(circle.center.x, circle.center.y, circle.radius).stroke({ color: GUIDE, width: 2 });
    g.moveTo(circle.center.x, circle.center.y)
      .lineTo(pointAt(startAngle).x, pointAt(startAngle).y)
      .stroke({ color: GUIDE, width: 2 });
    g.moveTo(circle.center.x, circle.center.y).lineTo(arcPoint.x, arcPoint.y).stroke({ color: RESULT, width: 3 });
    g.circle(arcPoint.x, arcPoint.y, grabbed ? 9 : 7).fill({ color: HANDLE });
    g.circle(turnPoint.x, turnPoint.y, 5).fill({ color: 0x38bdf8 });
    g.moveTo(orbitSegment.a.x, orbitSegment.a.y)
      .lineTo(orbitSegment.b.x, orbitSegment.b.y)
      .stroke({ color: hit ? 0xf87171 : GUIDE, width: 3 });
    g.circle(nearest.x, nearest.y, 5).fill({ color: 0xfbbf24 });
    g.moveTo(segMid.x, segMid.y).lineTo(nearest.x, nearest.y).stroke({ color: 0xfbbf24, width: 1 });

    label.text = [
      'Circular Measurement Lab',
      `sagitta ${sagitta.toFixed(1)}px   sector ${sectorArea.toFixed(0)}px2`,
      `turn ${turn.toFixed(2)} marker, orbit segment ${hit ? 'hits' : 'misses'} circle`,
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
