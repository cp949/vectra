/**
 * Vector Control Workbench
 *
 * aim direction, signed ray distance, set length, clamp length를 같은 steering/control panel에서 비교한다.
 */

import * as Vecx from '@cp949/vectra/vec';

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

  const origin: XY = { x: 120, y: 260 };
  const target: XY = { x: 470, y: 145 };
  const setOut: XY = { x: 0, y: 0 };
  const clampOut: XY = { x: 0, y: 0 };
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(p.x - target.x, p.y - target.y) <= 24;
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    target.x = Math.max(24, Math.min(size.width - 24, p.x));
    target.y = Math.max(64, Math.min(size.height - 24, p.y));
  };
  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawVector = (v: XY, color: number, yOffset = 0): void => {
    g.moveTo(origin.x, origin.y + yOffset)
      .lineTo(origin.x + v.x, origin.y + yOffset + v.y)
      .stroke({ color, width: 3 });
    g.circle(origin.x + v.x, origin.y + yOffset + v.y, 5).fill({ color });
  };

  const render = (): void => {
    const raw = { x: target.x - origin.x, y: target.y - origin.y };
    const dir = Vecx.directionTo(origin, target);
    const rayPoint = Vecx.pointOnRay(origin, dir, 250);
    Vecx.setLengthInto(setOut, raw, 160);
    Vecx.clampLengthInto(clampOut, raw, 120, 240);
    const rawLength = Vecx.length(raw);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });
    g.moveTo(origin.x, origin.y).lineTo(target.x, target.y).stroke({ color: GUIDE, width: 2 });
    g.circle(target.x, target.y, grabbed ? 9 : 7).fill({ color: HANDLE });
    drawVector({ x: dir.x * 80, y: dir.y * 80 }, RESULT, -120);
    if (rayPoint) g.circle(rayPoint.x, rayPoint.y, 6).fill({ color: 0x38bdf8 });
    drawVector(setOut, 0xfbbf24, 90);
    drawVector(clampOut, 0xf87171, 180);
    label.text = `Vector Control Workbench\nraw ${rawLength.toFixed(1)}px  set 160px  clamp [120,240]`;
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
