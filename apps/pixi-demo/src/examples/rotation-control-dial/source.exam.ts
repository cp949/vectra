/**
 * Rotation Control Dial
 *
 * 회전 핸들 하나를 drag해 editor 회전 도구에서 자주 같이 쓰는 방향 평균, 최단 이등분, 회전 제한,
 * step snap, directed sweep 판정을 한 dial에서 비교한다.
 */

import * as Anglex from '@cp949/vectra/angle';
import * as EditorGeometryx from '@cp949/vectra/editor-geometry';

type XY = { x: number; y: number };

const BG = 0x0f172a;
const LABEL = 0xe2e8f0;
const GUIDE = 0x64748b;
const RESULT = 0x4ade80;
const SECOND = 0xfbbf24;
const HANDLE = 0xf97316;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;
  const g = new PIXI.Graphics();
  app.stage.addChild(g);
  const label = new PIXI.Text({ text: '', style: { fill: LABEL, fontFamily: 'monospace', fontSize: 13 } });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const center: XY = { x: 390, y: 275 };
  const radius = 150;
  let angle = -0.55;
  let grabbed = false;

  const fixed = [-2.35, 1.95];
  const limitStart = -0.8;
  const limitEnd = 0.9;
  const step = Math.PI / 6;

  const pointAt = (a: number, r = radius): XY => ({ x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r });
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
    angle = Math.atan2(p.y - center.y, p.x - center.x);
  };
  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawRay = (a: number, color: number, width = 2, r = radius): void => {
    const p = pointAt(a, r);
    g.moveTo(center.x, center.y).lineTo(p.x, p.y).stroke({ color, width });
    g.circle(p.x, p.y, 5).fill({ color });
  };

  const render = (): void => {
    const rawPoint = pointAt(angle);
    const angles = [angle, ...fixed];
    const average = Anglex.averageAngle(angles);
    const bisect = Anglex.bisectAngle(fixed[0], angle);
    const clamped = Anglex.clampAngle(angle, limitStart, limitEnd);
    const snapped = EditorGeometryx.snapAngle(angle, step);
    const sweep = Anglex.sweepAngle(fixed[0], angle, 'ccw');
    const reflex = Anglex.isReflexSweep(fixed[0], angle, 'ccw');
    const bucket = Anglex.octant(angle);
    const heading = Anglex.fromVector({ x: rawPoint.x - center.x, y: rawPoint.y - center.y });

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });
    g.circle(center.x, center.y, radius).stroke({ color: GUIDE, width: 2 });
    g.circle(center.x, center.y, 4).fill({ color: LABEL });

    drawRay(fixed[0], GUIDE, 2);
    drawRay(fixed[1], GUIDE, 2);
    drawRay(angle, HANDLE, grabbed ? 4 : 3);
    drawRay(average, RESULT, 4, radius * 0.82);
    drawRay(bisect, SECOND, 4, radius * 0.68);
    drawRay(clamped, 0x38bdf8, 4, radius * 0.54);
    drawRay(snapped, 0xf87171, 4, radius * 0.42);

    label.text = [
      'Rotation Control Dial',
      `raw ${((heading * 180) / Math.PI).toFixed(0)}deg  octant ${bucket}`,
      `average / bisect / clamp / snap are drawn as nested rays`,
      `ccw sweep ${((sweep * 180) / Math.PI).toFixed(0)}deg ${reflex ? 'reflex' : 'minor'}`,
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
