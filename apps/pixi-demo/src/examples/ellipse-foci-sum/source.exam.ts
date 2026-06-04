/**
 * Ellipse Foci Sum
 *
 * 수평 guide 위의 두 초점과 경계 handle을 기준으로 거리합이 같은 ellipse 경계를 갱신한다.
 * label은 거리합, handle의 경계 오차, 이심률만 표시한다.
 *
 * - Ellipses.fromFoci: 두 초점과 거리합에서 axis-aligned ellipse 생성
 * - Ellipses.pointAtTurn: 생성된 ellipse 경계 sample 계산
 * - Ellipses.distanceToPoint: boundary handle과 생성 ellipse 경계 사이 오차 계산
 * - Ellipses.eccentricity: 초점 간격 변화에 따른 이심률 계산
 * - Ellipses.containsPoint: boundary handle이 생성 ellipse 내부/경계인지 판정
 */

import * as Ellipses from '@cp949/vectra/ellipse';

type XY = { x: number; y: number };
type DragTarget = 'focusA' | 'focusB' | 'boundary' | null;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 14 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const guideY = size.height / 2;
  const focusA: XY = { x: size.width / 2 - 130, y: guideY };
  const focusB: XY = { x: size.width / 2 + 130, y: guideY };
  const boundary: XY = { x: size.width / 2 + 70, y: guideY - 125 };
  const samples: XY[] = Array.from({ length: 96 }, () => ({ x: 0, y: 0 }));

  let dragTarget: DragTarget = null;

  const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  /** canvas pointer 이벤트에서 canvas 상대 좌표를 반환한다. */
  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const hit = (point: XY, target: XY): boolean => distance(point, target) <= 20;

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    if (hit(p, boundary)) {
      dragTarget = 'boundary';
    } else if (hit(p, focusA)) {
      dragTarget = 'focusA';
    } else if (hit(p, focusB)) {
      dragTarget = 'focusB';
    } else {
      dragTarget = null;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (dragTarget === null) return;
    const p = getCanvasXY(e);
    if (dragTarget === 'boundary') {
      boundary.x = clamp(p.x, 32, size.width - 32);
      boundary.y = clamp(p.y, 56, size.height - 32);
      return;
    }

    const nextX = clamp(p.x, 64, size.width - 64);
    if (dragTarget === 'focusA') {
      focusA.x = Math.min(nextX, focusB.x - 24);
      focusA.y = guideY;
    } else {
      focusB.x = Math.max(nextX, focusA.x + 24);
      focusB.y = guideY;
    }
  };

  const onPointerUp = (): void => {
    dragTarget = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawHandle = (point: XY, color: number): void => {
    g.circle(point.x, point.y, 8).fill(color);
  };

  const drawPolyline = (points: XY[], color: number, width: number): void => {
    if (points.length === 0) return;
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.closePath().stroke({ color, width });
  };

  const render = (): void => {
    const sum = distance(boundary, focusA) + distance(boundary, focusB);
    const ellipse = Ellipses.fromFoci(focusA, focusB, sum);

    g.clear();
    g.moveTo(32, guideY)
      .lineTo(size.width - 32, guideY)
      .stroke({ color: 0x334155, width: 1 });
    g.moveTo(focusA.x, focusA.y).lineTo(boundary.x, boundary.y).stroke({ color: 0x64748b, width: 1 });
    g.moveTo(focusB.x, focusB.y).lineTo(boundary.x, boundary.y).stroke({ color: 0x64748b, width: 1 });

    if (ellipse) {
      for (let i = 0; i < samples.length; i++) {
        const p = Ellipses.pointAtTurn(ellipse, i / samples.length);
        samples[i].x = p.x;
        samples[i].y = p.y;
      }
      drawPolyline(samples, 0x38bdf8, 3);

      const edgeError = Ellipses.distanceToPoint(ellipse, boundary);
      const eccentricity = Ellipses.eccentricity(ellipse);
      const status = Ellipses.containsPoint(ellipse, boundary) ? 'on/inside' : 'outside';
      label.text = [
        `sum: ${sum.toFixed(2)}`,
        `edge error: ${edgeError.toFixed(4)} (${status})`,
        `eccentricity: ${Number.isFinite(eccentricity) ? eccentricity.toFixed(4) : 'degenerate'}`,
      ].join('\n');
    } else {
      label.text = ['sum: invalid', 'edge error: invalid', 'eccentricity: invalid'].join('\n');
    }

    drawHandle(focusA, 0xf97316);
    drawHandle(focusB, 0xf97316);
    drawHandle(boundary, 0xfacc15);
  };

  app.ticker.add(render);
  render();

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    label.destroy();
    g.destroy();
  };
}
