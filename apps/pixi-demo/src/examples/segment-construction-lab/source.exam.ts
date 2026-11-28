/**
 * Segment Construction Lab
 *
 * angle origin, circle diameter, midpoint anchor, normal rib 방식으로 segment를 구성하는 작업을 비교한다.
 */

import * as Segmentx from '@cp949/vectra/segment';

type XY = { x: number; y: number };
type Segment = { x1: number; y1: number; x2: number; y2: number };

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

  const origin: XY = { x: 120, y: 135 };
  const midpoint: XY = { x: 500, y: 250 };
  const circle = { cx: 190, cy: 375, r: 70 };
  const base: Segment = { x1: 420, y1: 400, x2: 650, y2: 340 };
  const fromAngle: Segment = { x1: 0, y1: 0, x2: 0, y2: 0 };
  const fromCircle: Segment = { x1: 0, y1: 0, x2: 0, y2: 0 };
  const fromMid: Segment = { x1: 0, y1: 0, x2: 0, y2: 0 };
  const normalRib: Segment = { x1: 0, y1: 0, x2: 0, y2: 0 };
  let angle = -0.35;
  let grabbed = false;

  const handle = (): XY => ({ x: origin.x + Math.cos(angle) * 105, y: origin.y + Math.sin(angle) * 105 });
  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    const h = handle();
    grabbed = Math.hypot(p.x - h.x, p.y - h.y) <= 24;
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    angle = Math.atan2(p.y - origin.y, p.x - origin.x);
  };
  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawSeg = (s: Segment, color: number, width = 3): void => {
    g.moveTo(s.x1, s.y1).lineTo(s.x2, s.y2).stroke({ color, width });
    g.circle(s.x1, s.y1, 4).fill({ color });
    g.circle(s.x2, s.y2, 4).fill({ color });
  };

  const render = (): void => {
    Segmentx.fromAngleInto(fromAngle, origin, angle, 180);
    Segmentx.fromCircleInto(fromCircle, circle, angle);
    Segmentx.fromMidpointAngleLengthInto(fromMid, midpoint, angle, 180);
    Segmentx.fromNormalInto(normalRib, base, 0.5, 95);
    const mid = Segmentx.midpoint(fromMid);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });
    drawSeg(fromAngle, RESULT);
    g.circle(handle().x, handle().y, grabbed ? 9 : 7).fill({ color: HANDLE });
    g.circle(circle.cx, circle.cy, circle.r).stroke({ color: GUIDE, width: 2 });
    drawSeg(fromCircle, 0xfbbf24);
    drawSeg(fromMid, 0x38bdf8);
    g.circle(mid.x, mid.y, 5).fill({ color: LABEL });
    drawSeg(base, GUIDE, 2);
    drawSeg(normalRib, 0xf87171);
    label.text = `Segment Construction Lab\nangle ${((angle * 180) / Math.PI).toFixed(0)}deg  midpoint error ${Math.hypot(mid.x - midpoint.x, mid.y - midpoint.y).toFixed(1)}`;
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
