/**
 * Motion Interpolation Workbench
 *
 * point lerp, orbit rotate, direction slerp를 같은 t scrubber로 비교한다.
 */

import * as Vecx from '@cp949/vectra/vec';

type XY = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;
  const g = new PIXI.Graphics();
  app.stage.addChild(g);
  const label = new PIXI.Text({ text: '', style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 } });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const a: XY = { x: 110, y: 170 };
  const b: XY = { x: 640, y: 170 };
  const orbitCenter: XY = { x: 220, y: 350 };
  const orbitStart: XY = { x: 320, y: 350 };
  const dirA: XY = { x: 1, y: 0 };
  const dirB: XY = { x: -0.1961161351, y: -0.9805806757 };
  const lerpOut: XY = { x: 0, y: 0 };
  const rotateOut: XY = { x: 0, y: 0 };
  const slerpOut: XY = { x: 0, y: 0 };
  let knobX = 390;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.abs(p.y - 470) <= 24;
    if (grabbed) knobX = Math.max(110, Math.min(670, p.x));
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    knobX = Math.max(110, Math.min(670, p.x));
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
    const t = (knobX - 110) / 560;
    Vecx.lerpInto(lerpOut, a, b, t);
    Vecx.rotateAroundInto(rotateOut, orbitStart, orbitCenter, Math.PI * 2 * t);
    Vecx.slerpInto(slerpOut, dirA, dirB, t);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });
    g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ color: 0x64748b, width: 2 });
    g.circle(lerpOut.x, lerpOut.y, 7).fill({ color: 0x4ade80 });
    g.circle(orbitCenter.x, orbitCenter.y, 105).stroke({ color: 0x64748b, width: 2 });
    g.circle(rotateOut.x, rotateOut.y, 7).fill({ color: 0xfbbf24 });
    g.moveTo(520, 350)
      .lineTo(520 + slerpOut.x * 110, 350 + slerpOut.y * 110)
      .stroke({ color: 0x38bdf8, width: 4 });
    g.moveTo(110, 470).lineTo(670, 470).stroke({ color: 0x64748b, width: 2 });
    g.circle(knobX, 470, grabbed ? 9 : 7).fill({ color: 0xf97316 });
    label.text = `Motion Interpolation Workbench\nt ${t.toFixed(2)}  lerp / rotateAround / slerp`;
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
