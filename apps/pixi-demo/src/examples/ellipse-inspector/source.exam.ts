/**
 * Ellipse Inspector
 *
 * 노란 핸들 두 개를 드래그하면 axis-aligned ellipse의 x/y 반지름이 바뀌고, 분홍 probe 점을
 * 드래그하면 ellipse 경계까지의 closest point(하늘색)와 내부 포함 여부(probe 색)가 갱신된다.
 * 매 프레임 각도가 한 바퀴 돌며 경계 위 marker의 tangent(주황)·normal(초록) 화살표가 움직이고,
 * 두 초점(주황)과 bounding box(회색)가 함께 표시된다.
 *
 * - Ellipses.pointAtAngleInto: 파라메트릭 각도에서 ellipse 경계 위 점 계산
 * - Ellipses.tangentAtInto: 경계 marker 지점의 tangent 방향 계산
 * - Ellipses.normalAtInto: 경계 marker 지점의 normal 방향 계산
 * - Ellipses.closestPointInto: probe 점에서 ellipse 경계까지 closest point 계산
 * - Ellipses.containsPoint: probe 점의 ellipse 내부 포함 여부 boolean 반환
 * - Ellipses.fociInto: ellipse 두 초점을 segment output에 기록
 * - Ellipses.boundsInto: ellipse를 감싸는 axis-aligned bounds 계산
 */

import * as Ellipses from '@cp949/vectra/ellipse';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  // axis-aligned ellipse 내부 mutable state
  const ellipse = {
    center: { x: size.width / 2, y: size.height / 2 },
    radiusX: 220,
    radiusY: 130,
  };

  // 드래그로 ellipse 내부/외부를 오갈 probe 점
  const probe = { x: size.width / 2 + 300, y: size.height / 2 - 60 };

  // 매 프레임 재사용하는 vectra output buffer (hot path)
  const boundaryPoint = { x: 0, y: 0 };
  const tangent = { x: 0, y: 0 };
  const normal = { x: 0, y: 0 };
  const closest = { x: 0, y: 0 };
  const fociSegment = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  const box = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };

  // 드래그 대상 식별자
  let dragTarget: 'probe' | 'radiusX' | 'radiusY' | null = null;

  /** canvas pointer 이벤트에서 canvas 상대 좌표를 반환한다. */
  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  /** 반지름 핸들 좌표는 매번 ellipse state에서 파생한다. */
  const radiusXHandle = (): { x: number; y: number } => ({
    x: ellipse.center.x + ellipse.radiusX,
    y: ellipse.center.y,
  });
  const radiusYHandle = (): { x: number; y: number } => ({
    x: ellipse.center.x,
    y: ellipse.center.y + ellipse.radiusY,
  });

  /** pointerdown: hit radius 안에서 드래그 대상을 고른다. probe 우선, 그다음 반지름 핸들. */
  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    const HIT_RADIUS = 22;
    const rx = radiusXHandle();
    const ry = radiusYHandle();
    if (Math.hypot(probe.x - x, probe.y - y) < HIT_RADIUS) {
      dragTarget = 'probe';
    } else if (Math.hypot(rx.x - x, rx.y - y) < HIT_RADIUS) {
      dragTarget = 'radiusX';
    } else if (Math.hypot(ry.x - x, ry.y - y) < HIT_RADIUS) {
      dragTarget = 'radiusY';
    } else {
      dragTarget = null;
    }
  };

  /** pointermove: 드래그 대상에 따라 probe 좌표나 ellipse 반지름을 갱신한다. */
  const onPointerMove = (e: PointerEvent): void => {
    if (dragTarget === null) return;
    const { x, y } = getCanvasXY(e);
    if (dragTarget === 'probe') {
      probe.x = x;
      probe.y = y;
    } else if (dragTarget === 'radiusX') {
      ellipse.radiusX = Math.max(20, Math.abs(x - ellipse.center.x));
    } else {
      ellipse.radiusY = Math.max(20, Math.abs(y - ellipse.center.y));
    }
  };

  /** pointerup / pointerleave: 드래그 해제 */
  const onPointerUp = (): void => {
    dragTarget = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (ticker: PIXI.Ticker): void => {
    // 0..2π를 도는 파라메트릭 각도
    const angle = (ticker.lastTime / 1000) % (Math.PI * 2);

    // 경계 위 marker와 그 지점의 tangent/normal 방향을 reused buffer에 기록한다.
    Ellipses.pointAtAngleInto(boundaryPoint, ellipse, angle);
    Ellipses.tangentAtInto(tangent, ellipse, angle);
    Ellipses.normalAtInto(normal, ellipse, angle);

    // probe 점에서 ellipse 경계까지 closest point와 내부 포함 여부.
    Ellipses.closestPointInto(closest, ellipse, probe);
    const inside = Ellipses.containsPoint(ellipse, probe);

    // 두 초점과 bounding box.
    Ellipses.fociInto(fociSegment, ellipse);
    Ellipses.boundsInto(box, ellipse);

    g.clear();

    // bounding box (회색 사각형)
    g.rect(box.min.x, box.min.y, box.max.x - box.min.x, box.max.y - box.min.y).stroke({
      color: 0x475569,
      width: 1,
    });

    // ellipse 본선 (하늘색)
    g.ellipse(ellipse.center.x, ellipse.center.y, ellipse.radiusX, ellipse.radiusY).stroke({
      color: 0x38bdf8,
      width: 3,
    });

    // probe → closest 연결선 (회색)
    g.moveTo(probe.x, probe.y).lineTo(closest.x, closest.y).stroke({ color: 0x475569, width: 1 });

    // tangent 화살표: boundaryPoint 기준 ±40px (주황)
    g.moveTo(boundaryPoint.x - tangent.x * 40, boundaryPoint.y - tangent.y * 40)
      .lineTo(boundaryPoint.x + tangent.x * 40, boundaryPoint.y + tangent.y * 40)
      .stroke({ color: 0xfb923c, width: 2 });

    // normal 화살표: boundaryPoint 기준 ±30px (초록)
    g.moveTo(boundaryPoint.x - normal.x * 30, boundaryPoint.y - normal.y * 30)
      .lineTo(boundaryPoint.x + normal.x * 30, boundaryPoint.y + normal.y * 30)
      .stroke({ color: 0x34d399, width: 2 });

    // 두 초점 (주황)
    g.circle(fociSegment.a.x, fociSegment.a.y, 5).fill({ color: 0xf59e0b });
    g.circle(fociSegment.b.x, fociSegment.b.y, 5).fill({ color: 0xf59e0b });

    // 경계 sweep marker (분홍)
    g.circle(boundaryPoint.x, boundaryPoint.y, 6).fill({ color: 0xf472b6 });

    // closest point marker (하늘색)
    g.circle(closest.x, closest.y, 6).fill({ color: 0x38bdf8 });

    // 반지름 핸들 (노랑)
    const rx = radiusXHandle();
    const ry = radiusYHandle();
    g.circle(rx.x, rx.y, 8).fill({ color: 0xfacc15 });
    g.circle(ry.x, ry.y, 8).fill({ color: 0xfacc15 });

    // probe 점: 내부면 초록, 외부면 분홍
    g.circle(probe.x, probe.y, 8).fill({ color: inside ? 0x4ade80 : 0xf472b6 });
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    g.destroy();
  };
}
