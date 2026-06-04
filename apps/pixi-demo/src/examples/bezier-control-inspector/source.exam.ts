/**
 * Bezier Control Inspector
 *
 * 제어점 p0, p1, p2 세 개를 드래그하면 quadratic Bezier 곡선이 다시 그려진다. t 값이
 * 0..1 사이를 왕복하며 곡선 위 marker가 움직이고, 그 지점의 tangent(주황)·normal(초록)
 * 화살표와 de Casteljau hull 보조선이 매 프레임 갱신된다.
 *
 * - Curves.quadraticPointAtTInto: 비율 t에서 곡선 위 marker 좌표 계산
 * - Curves.quadraticTangentAtInto: marker 지점의 tangent 방향 계산
 * - Curves.quadraticNormalAtInto: marker 지점의 normal 방향 계산
 * - Curves.quadraticHullInto: de Casteljau 보간 hull 점 계산
 */

import * as Curves from '@cp949/vectra/curve';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  // Graphics 레이어 생성
  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  // 제어점 내부 mutable state
  const p0 = { x: 150, y: 320 };
  const p1 = { x: 360, y: 80 };
  const p2 = { x: 570, y: 320 };

  // quadraticHullInto 출력 배열 (매 프레임 clear 후 push)
  const hull: { x: number; y: number }[] = [];

  // quadraticPointAtTInto 출력
  const point = { x: 0, y: 0 };

  // quadraticTangentAtInto 출력
  const tangent = { x: 0, y: 0 };

  // quadraticNormalAtInto 출력
  const normal = { x: 0, y: 0 };

  // 드래그 상태
  let dragging: { x: number; y: number } | null = null;

  /**
   * canvas pointer 이벤트에서 canvas 상대 좌표를 반환한다.
   */
  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  /**
   * 가장 가까운 제어점을 hit radius 내에서 찾아 반환한다.
   */
  const findNearestControl = (x: number, y: number): { x: number; y: number } | null => {
    const HIT_RADIUS = 20;
    let nearest: { x: number; y: number } | null = null;
    let minDist = HIT_RADIUS;
    for (const pt of [p0, p1, p2]) {
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < minDist) {
        minDist = dist;
        nearest = pt;
      }
    }
    return nearest;
  };

  /** pointerdown: 가장 가까운 제어점을 드래그 대상으로 선택 */
  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    dragging = findNearestControl(x, y);
  };

  /** pointermove: 드래그 중이면 제어점 좌표 갱신 */
  const onPointerMove = (e: PointerEvent): void => {
    if (dragging === null) return;
    const { x, y } = getCanvasXY(e);
    dragging.x = x;
    dragging.y = y;
  };

  /** pointerup / pointerleave: 드래그 해제 */
  const onPointerUp = (): void => {
    dragging = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  /**
   * 매 ticker 프레임 렌더링.
   * t는 sin 기반 0..1 왕복값이다.
   */
  const render = (ticker: PIXI.Ticker): void => {
    // t: 0..1 왕복
    const t = (Math.sin(ticker.lastTime / 1200) + 1) / 2;

    // vectra API 호출
    Curves.quadraticHullInto(hull, p0, p1, p2, t);
    Curves.quadraticPointAtTInto(point, p0, p1, p2, t);
    Curves.quadraticTangentAtInto(tangent, p0, p1, p2, t);
    Curves.quadraticNormalAtInto(normal, p0, p1, p2, t);

    g.clear();

    // 배경 제어선 p0--p1--p2 (얇은 회색)
    g.moveTo(p0.x, p0.y).lineTo(p1.x, p1.y).lineTo(p2.x, p2.y).stroke({ color: 0x94a3b8, width: 1 });

    // de Casteljau lerp 보조선 hull[3]--hull[4] (보라)
    if (hull.length >= 5) {
      g.moveTo(hull[3].x, hull[3].y).lineTo(hull[4].x, hull[4].y).stroke({ color: 0xa78bfa, width: 1 });
    }

    // Bezier 본선 (하늘색)
    g.moveTo(p0.x, p0.y).quadraticCurveTo(p1.x, p1.y, p2.x, p2.y).stroke({ color: 0x38bdf8, width: 3 });

    // tangent 화살표: point 기준 ±40px (주황)
    g.moveTo(point.x - tangent.x * 40, point.y - tangent.y * 40)
      .lineTo(point.x + tangent.x * 40, point.y + tangent.y * 40)
      .stroke({ color: 0xfb923c, width: 2 });

    // normal 화살표: point 기준 ±30px (초록)
    g.moveTo(point.x - normal.x * 30, point.y - normal.y * 30)
      .lineTo(point.x + normal.x * 30, point.y + normal.y * 30)
      .stroke({ color: 0x34d399, width: 2 });

    // 제어점 마커: p0, p2 (연두), p1 (노랑)
    g.circle(p0.x, p0.y, 8).fill({ color: 0x4ade80 });
    g.circle(p2.x, p2.y, 8).fill({ color: 0x4ade80 });
    g.circle(p1.x, p1.y, 8).fill({ color: 0xfacc15 });

    // de Casteljau lerp 보조 마커 hull[3], hull[4] (보라 소원)
    if (hull.length >= 5) {
      g.circle(hull[3].x, hull[3].y, 4).fill({ color: 0xa78bfa });
      g.circle(hull[4].x, hull[4].y, 4).fill({ color: 0xa78bfa });
    }

    // curve 위 marker: hull[5] = point at t (분홍)
    g.circle(point.x, point.y, 6).fill({ color: 0xf472b6 });
  };

  app.ticker.add(render);

  // cleanup: ticker 제거, 이벤트 제거, Graphics 제거
  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    g.destroy();
  };
}
