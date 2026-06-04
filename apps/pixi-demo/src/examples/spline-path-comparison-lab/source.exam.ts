/**
 * Spline Path Comparison Lab
 *
 * control point와 closed toggle handle을 드래그하면 Catmull-Rom, Cardinal, B-Spline의 cubic path
 * 변환 결과와 path 위 probe marker가 함께 갱신된다. 같은 point list가 spline family별로 어떤 path를
 * 만드는지 비교한다.
 *
 * - Curves.catmullRomPath: Catmull-Rom point list를 cubic path command로 변환
 * - Curves.cardinalPath: tension이 적용된 Cardinal point list를 cubic path command로 변환
 * - Curves.bsplinePath: uniform cubic B-Spline control polygon을 cubic path command로 변환
 * - Curves.catmullRomPointAtT: Catmull-Rom path 위 probe marker 계산
 * - Curves.cardinalPointAtT: Cardinal path 위 probe marker 계산
 * - Curves.bsplinePointAtT: B-Spline path 위 probe marker 계산
 */

import * as Curves from '@cp949/vectra/curve';

type Point = { x: number; y: number };
type PathCommand =
  | { kind: 'move'; x: number; y: number }
  | { kind: 'line'; x: number; y: number }
  | { kind: 'quadratic'; x1: number; y1: number; x: number; y: number }
  | { kind: 'cubic'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { kind: 'close' };

const HIT_RADIUS = 18;
const POINT_RADIUS = 7;
const CLOSED_TOGGLE = { x: 640, y: 386 };

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

  const points: Point[] = [
    { x: 76, y: 270 },
    { x: 162, y: 112 },
    { x: 278, y: 202 },
    { x: 396, y: 94 },
    { x: 514, y: 286 },
    { x: 642, y: 166 },
  ];

  let closed = false;
  let grabbed: Point | undefined;
  let toggleGrabbed = false;

  const canvas = app.canvas as HTMLCanvasElement;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);

    if (Math.hypot(CLOSED_TOGGLE.x - x, CLOSED_TOGGLE.y - y) <= HIT_RADIUS) {
      closed = !closed;
      toggleGrabbed = true;
      return;
    }

    for (const point of points) {
      if (Math.hypot(point.x - x, point.y - y) <= HIT_RADIUS) {
        grabbed = point;
        return;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const { x, y } = getCanvasXY(e);
    grabbed.x = Math.max(32, Math.min(size.width - 32, x));
    grabbed.y = Math.max(58, Math.min(size.height - 74, y));
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
    toggleGrabbed = false;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawPath = (commands: readonly PathCommand[], color: number, width: number, alpha = 1): void => {
    for (const cmd of commands) {
      if (cmd.kind === 'move') {
        g.moveTo(cmd.x, cmd.y);
      } else if (cmd.kind === 'line') {
        g.lineTo(cmd.x, cmd.y);
      } else if (cmd.kind === 'quadratic') {
        g.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
      } else if (cmd.kind === 'cubic') {
        g.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
      } else if (cmd.kind === 'close') {
        g.closePath();
      }
    }
    g.stroke({ color, width, alpha });
  };

  const drawControlPolygon = (): void => {
    if (points.length < 2) return;
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    if (closed) {
      g.lineTo(points[0].x, points[0].y);
    }
    g.stroke({ color: 0x475569, width: 1.5, alpha: 0.9 });
  };

  const drawMarker = (point: Point, color: number, yOffset: number): void => {
    g.circle(point.x, point.y, 6).fill(color);
    g.moveTo(point.x, point.y)
      .lineTo(point.x + 16, point.y + yOffset)
      .stroke({ color, width: 1, alpha: 0.75 });
  };

  const render = (ticker: PIXI.Ticker): void => {
    const t = (Math.sin(ticker.lastTime / 1200) + 1) / 2;
    const catmullPath = Curves.catmullRomPath(points, { alpha: 0.5, closed }) as PathCommand[];
    const cardinalPath = Curves.cardinalPath(points, { tension: 0.55, closed }) as PathCommand[];
    const bsplinePath = Curves.bsplinePath(points, { closed }) as PathCommand[];
    const catmullProbe = Curves.catmullRomPointAtT(points, t, { alpha: 0.5, closed });
    const cardinalProbe = Curves.cardinalPointAtT(points, t, { tension: 0.55, closed });
    const bsplineProbe = Curves.bsplinePointAtT(points, t, { closed });

    g.clear();

    drawControlPolygon();
    drawPath(bsplinePath, 0xa78bfa, 4, 0.7);
    drawPath(cardinalPath, 0xf59e0b, 3, 0.85);
    drawPath(catmullPath, 0x38bdf8, 3);

    for (const point of points) {
      g.circle(point.x, point.y, POINT_RADIUS + (point === grabbed ? 2 : 0)).fill(
        point === grabbed ? 0xfacc15 : 0xf472b6
      );
    }

    drawMarker(catmullProbe, 0x38bdf8, -18);
    drawMarker(cardinalProbe, 0xf59e0b, 0);
    drawMarker(bsplineProbe, 0xa78bfa, 18);

    g.circle(CLOSED_TOGGLE.x, CLOSED_TOGGLE.y, 12).fill(closed ? 0x4ade80 : 0x64748b);
    g.circle(CLOSED_TOGGLE.x, CLOSED_TOGGLE.y, 16).stroke({
      color: toggleGrabbed ? 0xfacc15 : 0x94a3b8,
      width: 2,
      alpha: 0.9,
    });

    label.text = `cyan Catmull-Rom  orange Cardinal(t=0.55)  violet B-Spline  probe ${t.toFixed(2)}  closed ${closed}`;
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
