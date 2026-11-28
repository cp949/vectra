/**
 * Triangle Construction Lab
 *
 * equilateral, right, base/apex, base/height, center diagnostics, side classification을 같은 construction
 * board에서 비교한다.
 */

import * as Segmentx from '@cp949/vectra/segment';
import * as Trianglex from '@cp949/vectra/triangle';
import * as Vecx from '@cp949/vectra/vec';

type XY = { x: number; y: number };
type Triangle = { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number };

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

  const base = { x1: 380, y1: 375, x2: 650, y2: 375 };
  const apex: XY = { x: 520, y: 190 };
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(p.x - apex.x, p.y - apex.y) <= 24;
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    apex.x = Math.max(320, Math.min(size.width - 30, p.x));
    apex.y = Math.max(80, Math.min(340, p.y));
  };
  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawTri = (t: Triangle, color: number, alpha = 0.12): void => {
    g.moveTo(t.x1, t.y1)
      .lineTo(t.x2, t.y2)
      .lineTo(t.x3, t.y3)
      .closePath()
      .fill({ color, alpha })
      .stroke({ color, width: 2 });
  };

  const render = (): void => {
    const equilateral = Trianglex.buildEquilateral({ x: 80, y: 170 }, 120, 0.08);
    const right = Trianglex.buildRight({ x: 80, y: 385 }, 150, -110, -0.1);
    const baseApex = Trianglex.fromSegmentApex(base, apex);
    const baseHeight = Trianglex.fromSegmentHeight(base, 120, { side: 'left' });
    const classified = Trianglex.triangleFrom(baseApex);
    const centroid = Trianglex.centroid(baseApex);
    const incenter = Trianglex.incenter(baseApex);
    const circumcenter = Trianglex.circumcenter(baseApex);
    const orthocenter = Trianglex.orthocenter(baseApex);
    const sideLabel = Trianglex.isEquilateral(classified, 2)
      ? 'equilateral'
      : Trianglex.isIsosceles(classified, 2)
        ? 'isosceles'
        : 'scalene';

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });
    drawTri(equilateral, RESULT);
    drawTri(right, 0x38bdf8);
    drawTri(baseApex, 0xfbbf24, 0.1);
    if (baseHeight) drawTri(baseHeight, 0x94a3b8, 0.08);
    g.circle(apex.x, apex.y, grabbed ? 9 : 7).fill({ color: HANDLE });
    for (const p of [centroid, incenter, circumcenter, orthocenter]) {
      if (p) g.circle(p.x, p.y, 5).fill({ color: RESULT });
    }
    const sideA = Vecx.distance({ x: baseApex.x1, y: baseApex.y1 }, { x: baseApex.x2, y: baseApex.y2 });
    const sideB = Vecx.distance({ x: baseApex.x2, y: baseApex.y2 }, { x: baseApex.x3, y: baseApex.y3 });
    const sideC = Vecx.distance({ x: baseApex.x3, y: baseApex.y3 }, { x: baseApex.x1, y: baseApex.y1 });
    const baseLen = Segmentx.length(base);
    label.text = `Triangle Construction Lab\n${sideLabel}  base ${baseLen.toFixed(0)}  sides ${sideA.toFixed(0)}, ${sideB.toFixed(0)}, ${sideC.toFixed(0)}`;
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
