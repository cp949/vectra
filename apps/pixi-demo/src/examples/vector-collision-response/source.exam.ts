/**
 * Vector Collision Response
 *
 * incoming velocity를 wall normal 기준으로 slide, bounce, tangent projection으로 분해한다.
 */

import * as Vecx from '@cp949/vectra/vec';

type XY = { x: number; y: number };

const BG = 0x0f172a;
const LABEL = 0xe2e8f0;
const GUIDE = 0x64748b;
const HANDLE = 0xf97316;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;
  const g = new PIXI.Graphics();
  app.stage.addChild(g);
  const label = new PIXI.Text({ text: '', style: { fill: LABEL, fontFamily: 'monospace', fontSize: 13 } });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const origin: XY = { x: 390, y: 280 };
  const velocityEnd: XY = { x: 225, y: 150 };
  const normal: XY = { x: 0.28, y: -0.96 };
  const slide: XY = { x: 0, y: 0 };
  const bounce: XY = { x: 0, y: 0 };
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(p.x - velocityEnd.x, p.y - velocityEnd.y) <= 24;
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    velocityEnd.x = Math.max(24, Math.min(size.width - 24, p.x));
    velocityEnd.y = Math.max(64, Math.min(size.height - 24, p.y));
  };
  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const draw = (v: XY, color: number): void => {
    g.moveTo(origin.x, origin.y)
      .lineTo(origin.x + v.x, origin.y + v.y)
      .stroke({ color, width: 3 });
    g.circle(origin.x + v.x, origin.y + v.y, 5).fill({ color });
  };

  const render = (): void => {
    const incoming = { x: velocityEnd.x - origin.x, y: velocityEnd.y - origin.y };
    const tangent = Vecx.projectOn(incoming, { x: -normal.y, y: normal.x });
    const reflected = Vecx.reflectAcrossNormal(incoming, normal);
    Vecx.slideInto(slide, incoming, normal);
    Vecx.reflectInto(bounce, incoming, normal);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });
    g.moveTo(150, 330).lineTo(640, 190).stroke({ color: GUIDE, width: 4 });
    draw({ x: normal.x * 90, y: normal.y * 90 }, 0xe2e8f0);
    draw(incoming, HANDLE);
    draw(slide, 0x4ade80);
    draw(bounce, 0xf87171);
    draw(tangent, 0x38bdf8);
    draw(reflected, 0xfbbf24);
    g.circle(velocityEnd.x, velocityEnd.y, grabbed ? 9 : 7).fill({ color: HANDLE });
    label.text = `Vector Collision Response\nincoming ${Vecx.length(incoming).toFixed(1)}px  white normal / green slide / red bounce / blue project`;
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
