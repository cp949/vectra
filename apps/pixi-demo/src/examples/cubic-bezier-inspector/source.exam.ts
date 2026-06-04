/**
 * Cubic Bezier Inspector
 *
 * 제어점 p0, p1, p2, p3 네 개를 드래그하면 cubic Bezier 곡선이 다시 그려진다. t 값이
 * 0..1 사이를 왕복하며 곡선 위 marker가 움직이고, 그 지점의 tangent(주황)·normal(초록)
 * 화살표와 de Casteljau hull 보조선, 그리고 곡선 전체를 감싸는 tight bounds box가 매
 * 프레임 갱신된다.
 *
 * - Curves.cubicHullInto: de Casteljau 1·2단계 보간 hull 점 계산
 * - Curves.cubicPointAtTInto: 비율 t에서 곡선 위 marker 좌표 계산
 * - Curves.cubicTangentAtInto: marker 지점의 tangent 방향 계산
 * - Curves.cubicNormalAtInto: marker 지점의 normal 방향 계산
 * - Curves.cubicBoundsInto: 곡선 extrema 기반 tight bounds 계산
 */

import * as Curves from '@cp949/vectra/curve';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  // Graphics 레이어 생성
  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  // 제어점 내부 mutable state
  const p0 = { x: 120, y: 320 };
  const p1 = { x: 260, y: 80 };
  const p2 = { x: 460, y: 80 };
  const p3 = { x: 600, y: 320 };

  // cubicHullInto 출력 배열 (매 프레임 clear 후 push)
  // 레이아웃: [p0, p1, p2, p3, L01, L12, L23, L012, L123, pointAt]
  const hull: { x: number; y: number }[] = [];

  // cubicPointAtTInto 출력
  const point = { x: 0, y: 0 };

  // cubicTangentAtInto 출력
  const tangent = { x: 0, y: 0 };

  // cubicNormalAtInto 출력
  const normal = { x: 0, y: 0 };

  // cubicBoundsInto 출력
  const bounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };

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
    for (const pt of [p0, p1, p2, p3]) {
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
    Curves.cubicHullInto(hull, p0, p1, p2, p3, t);
    Curves.cubicPointAtTInto(point, p0, p1, p2, p3, t);
    Curves.cubicTangentAtInto(tangent, p0, p1, p2, p3, t);
    Curves.cubicNormalAtInto(normal, p0, p1, p2, p3, t);
    Curves.cubicBoundsInto(bounds, p0, p1, p2, p3);

    g.clear();

    // tight bounds box (얇은 점선 느낌의 회색 사각형)
    g.rect(bounds.min.x, bounds.min.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y).stroke({
      color: 0x475569,
      width: 1,
    });

    // 배경 제어선 p0--p1--p2--p3 (얇은 회색)
    g.moveTo(p0.x, p0.y).lineTo(p1.x, p1.y).lineTo(p2.x, p2.y).lineTo(p3.x, p3.y).stroke({ color: 0x94a3b8, width: 1 });

    // de Casteljau 1단계 lerp 보조선 L01--L12--L23 (주황)
    if (hull.length >= 10) {
      g.moveTo(hull[4].x, hull[4].y)
        .lineTo(hull[5].x, hull[5].y)
        .lineTo(hull[6].x, hull[6].y)
        .stroke({ color: 0xfb923c, width: 1 });

      // de Casteljau 2단계 lerp 보조선 L012--L123 (보라)
      g.moveTo(hull[7].x, hull[7].y).lineTo(hull[8].x, hull[8].y).stroke({ color: 0xa78bfa, width: 1 });
    }

    // Bezier 본선 (하늘색)
    g.moveTo(p0.x, p0.y).bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y).stroke({ color: 0x38bdf8, width: 3 });

    // tangent 화살표: point 기준 ±40px (주황)
    g.moveTo(point.x - tangent.x * 40, point.y - tangent.y * 40)
      .lineTo(point.x + tangent.x * 40, point.y + tangent.y * 40)
      .stroke({ color: 0xfb923c, width: 2 });

    // normal 화살표: point 기준 ±30px (초록)
    g.moveTo(point.x - normal.x * 30, point.y - normal.y * 30)
      .lineTo(point.x + normal.x * 30, point.y + normal.y * 30)
      .stroke({ color: 0x34d399, width: 2 });

    // 제어점 마커: p0, p3 endpoint (연두), p1, p2 handle (노랑)
    g.circle(p0.x, p0.y, 8).fill({ color: 0x4ade80 });
    g.circle(p3.x, p3.y, 8).fill({ color: 0x4ade80 });
    g.circle(p1.x, p1.y, 8).fill({ color: 0xfacc15 });
    g.circle(p2.x, p2.y, 8).fill({ color: 0xfacc15 });

    // de Casteljau 보조 마커: 1단계 L01/L12/L23 (주황 소원), 2단계 L012/L123 (보라 소원)
    if (hull.length >= 10) {
      g.circle(hull[4].x, hull[4].y, 4).fill({ color: 0xfb923c });
      g.circle(hull[5].x, hull[5].y, 4).fill({ color: 0xfb923c });
      g.circle(hull[6].x, hull[6].y, 4).fill({ color: 0xfb923c });
      g.circle(hull[7].x, hull[7].y, 4).fill({ color: 0xa78bfa });
      g.circle(hull[8].x, hull[8].y, 4).fill({ color: 0xa78bfa });
    }

    // curve 위 marker: point at t (분홍)
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
