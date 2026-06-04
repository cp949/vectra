/**
 * Clearance Closest Point Lab
 *
 * 장애물 주변 probe를 drag하며 최근접점과 clearance를 한 화면에서 비교한다. 각 행은 같은 질문을
 * 다른 도형에 던진다: "probe가 이 도형에서 얼마나 떨어져 있고, 가장 가까운 점은 어디인가?"
 *
 * - Boundsx.closestPoint: AABB 위 probe 최근접점을 구한다.
 * - Circlex.distanceToPoint: circle keep-out zone까지의 clearance를 구한다.
 * - Trianglex.closestPoint: triangle 위 probe 최근접점을 구한다.
 * - Pathx.closestPoint: path 위 probe 최근접점을 구한다.
 */

import * as Boundsx from '@cp949/vectra/bounds';
import * as Circlex from '@cp949/vectra/circle';
import * as Pathx from '@cp949/vectra/path';
import * as Trianglex from '@cp949/vectra/triangle';

type XY = { x: number; y: number };
type CaseId = 'bounds' | 'circle' | 'triangle' | 'path';

const BG = 0x0f172a;
const CLEAR = 0x38bdf8;
const CONTACT = 0xf87171;
const SHAPE = 0x64748b;
const HANDLE = 0xf97316;
const LABEL = 0xe2e8f0;
const ROW_H = 104;
const GRAB_R = 18;
const EPS = 1e-6;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const title = new PIXI.Text({
    text: 'Clearance Closest Point Lab',
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
    bounds: { y: 86, name: 'AABB nearest clamp', fn: 'bounds.closestPoint' },
    circle: { y: 190, name: 'circle keep-out clearance', fn: 'circle.distanceToPoint' },
    triangle: { y: 294, name: 'triangle surface snap', fn: 'triangle.closestPoint' },
    path: { y: 398, name: 'path magnetic snap', fn: 'path.closestPoint' },
  } satisfies Record<CaseId, { y: number; name: string; fn: string }>;

  const box = { min: { x: 360, y: rows.bounds.y + 16 }, max: { x: 540, y: rows.bounds.y + 74 } };
  const circle = { center: { x: 450, y: rows.circle.y + 48 }, radius: 38 };
  const triangle = {
    a: { x: 380, y: rows.triangle.y + 20 },
    b: { x: 545, y: rows.triangle.y + 52 },
    c: { x: 392, y: rows.triangle.y + 82 },
  };
  const pathCommands = [
    { kind: 'move', x: 350, y: rows.path.y + 70 },
    { kind: 'line', x: 430, y: rows.path.y + 70 },
    { kind: 'cubic', x1: 500, y1: rows.path.y + 70, x2: 495, y2: rows.path.y + 18, x: 570, y: rows.path.y + 24 },
  ] satisfies Pathx.PathCommand[];

  const probes: Record<CaseId, XY> = {
    bounds: { x: 250, y: rows.bounds.y + 28 },
    circle: { x: 260, y: rows.circle.y + 48 },
    triangle: { x: 260, y: rows.triangle.y + 42 },
    path: { x: 260, y: rows.path.y + 42 },
  };

  let dragTarget: CaseId | null = null;

  const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  const nearestProbe = (p: XY): CaseId | null => {
    const order: CaseId[] = ['bounds', 'circle', 'triangle', 'path'];
    return order.find((id) => distance(p, probes[id]) <= GRAB_R) ?? null;
  };

  const onPointerDown = (e: PointerEvent): void => {
    dragTarget = nearestProbe(getCanvasXY(e));
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (dragTarget === null) return;
    const p = getCanvasXY(e);
    const row = rows[dragTarget];
    probes[dragTarget].x = clamp(p.x, 28, size.width - 28);
    probes[dragTarget].y = clamp(p.y, row.y + 8, row.y + ROW_H - 12);
  };

  const onPointerUp = (): void => {
    dragTarget = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const circleNearest = (probe: XY): XY => {
    const dx = probe.x - circle.center.x;
    const dy = probe.y - circle.center.y;
    const len = Math.hypot(dx, dy);
    if (len <= EPS) return { x: circle.center.x + circle.radius, y: circle.center.y };
    return {
      x: circle.center.x + (dx / len) * circle.radius,
      y: circle.center.y + (dy / len) * circle.radius,
    };
  };

  const nearestFor = (id: CaseId): XY => {
    if (id === 'bounds') return Boundsx.closestPoint(box, probes.bounds) ?? probes.bounds;
    if (id === 'circle') return circleNearest(probes.circle);
    if (id === 'triangle') return Trianglex.closestPoint(triangle, probes.triangle);
    return Pathx.closestPoint(pathCommands, probes.path) ?? probes.path;
  };

  const clearanceFor = (id: CaseId, nearest: XY): number => {
    if (id === 'circle') return Circlex.distanceToPoint(circle, probes.circle);
    return distance(probes[id], nearest);
  };

  const drawRowHeader = (id: CaseId, d: number): void => {
    const row = rows[id];
    const contact = d <= EPS;
    const color = contact ? CONTACT : CLEAR;
    g.rect(0, row.y - 8, size.width, ROW_H).fill({ color, alpha: 0.055 });
  };

  const drawProbe = (id: CaseId, nearest: XY, d: number): void => {
    const probe = probes[id];
    const color = d <= EPS ? CONTACT : CLEAR;
    if (d > EPS) {
      g.moveTo(probe.x, probe.y).lineTo(nearest.x, nearest.y).stroke({ color, width: 2 });
      g.circle(nearest.x, nearest.y, 5).fill({ color });
    }
    g.circle(probe.x, probe.y, dragTarget === id ? 8 : 6).fill({ color: HANDLE });
  };

  const render = (): void => {
    const nearest = {
      bounds: nearestFor('bounds'),
      circle: nearestFor('circle'),
      triangle: nearestFor('triangle'),
      path: nearestFor('path'),
    } satisfies Record<CaseId, XY>;
    const clearance = {
      bounds: clearanceFor('bounds', nearest.bounds),
      circle: clearanceFor('circle', nearest.circle),
      triangle: clearanceFor('triangle', nearest.triangle),
      path: clearanceFor('path', nearest.path),
    } satisfies Record<CaseId, number>;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });

    for (const id of ['bounds', 'circle', 'triangle', 'path'] as CaseId[]) {
      drawRowHeader(id, clearance[id]);
    }

    g.rect(box.min.x, box.min.y, box.max.x - box.min.x, box.max.y - box.min.y)
      .fill({ color: SHAPE, alpha: 0.16 })
      .stroke({ color: SHAPE, width: 2 });

    g.circle(circle.center.x, circle.center.y, circle.radius)
      .fill({ color: SHAPE, alpha: 0.16 })
      .stroke({ color: SHAPE, width: 2 });

    g.poly([triangle.a.x, triangle.a.y, triangle.b.x, triangle.b.y, triangle.c.x, triangle.c.y])
      .fill({ color: SHAPE, alpha: 0.16 })
      .stroke({ color: SHAPE, width: 2 });

    g.moveTo(pathCommands[0].x, pathCommands[0].y);
    for (let i = 1; i < pathCommands.length; i++) {
      const cmd = pathCommands[i];
      if (cmd.kind === 'cubic') g.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
      else g.lineTo(cmd.x, cmd.y);
    }
    g.stroke({ color: SHAPE, width: 3 });

    for (const id of ['bounds', 'circle', 'triangle', 'path'] as CaseId[]) {
      drawProbe(id, nearest[id], clearance[id]);
    }

    const contactCount = Object.values(clearance).filter((d) => d <= EPS).length;
    label.text = `drag orange probes   contacts: ${contactCount}/4`;
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
