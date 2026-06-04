/**
 * Rotated Box AABB
 *
 * 중심 둘레의 회전 handle을 드래그하면 고정 사각형이 중심을 기준으로 회전하고, 회전된 네 꼭짓점을
 * 감싸는 axis-aligned bounding box(AABB)가 다시 계산된다. 0°·90°에서 AABB는 원래 사각형과 같고
 * 45° 근처에서 가장 크게 부푼다. 회전된 객체의 화면 정렬 bounding box(broad-phase / dirty-rect /
 * sprite world bounds) 작업 흐름을 보여준다.
 *
 * - Matrixx.rotationAroundPoint: 사각형 중심을 기준으로 회전하는 matrix 구성
 * - Matrixx.transformPoints: 회전된 네 꼭짓점 = 변환 입력의 시각화
 * - Boundsx.transform: 회전된 꼭짓점을 감싸는 AABB = 핵심 출력
 */

import * as Boundsx from '@cp949/vectra/bounds';
import * as Matrixx from '@cp949/vectra/matrix';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  // 화면 중심에 고정한 사각형(180 x 110). 항상 non-empty라 transform이 empty sentinel을 내지 않는다.
  const cx = 360;
  const cy = 240;
  const halfW = 90;
  const halfH = 55;
  const box = {
    min: { x: cx - halfW, y: cy - halfH },
    max: { x: cx + halfW, y: cy + halfH },
  };

  // 회전 handle은 중심에서 고정 반지름만큼 떨어진 점에 둔다(반박스 대각선 + 여백).
  const handleRadius = Math.hypot(halfW, halfH) + 46;

  // 저장 state: 각도는 드래그 시에만 바뀌므로 회전 matrix·꼭짓점·AABB를 그때 1회 계산해 둔다.
  let angle = 0;
  let corners: { x: number; y: number }[] = [];
  let aabb = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
  let handle = { x: 0, y: 0 };

  // 각도로부터 회전된 꼭짓점·AABB·handle 위치를 한 번에 다시 계산한다(드래그 시에만 호출).
  const recompute = (): void => {
    // rotationAroundPoint(point, angle): 사각형 중심을 회전 중심으로 하는 matrix
    const m = Matrixx.rotationAroundPoint({ x: cx, y: cy }, angle);
    // transformPoints(matrix, points): 회전된 네 꼭짓점(입력 시각화)
    corners = Matrixx.transformPoints(m, [
      { x: box.min.x, y: box.min.y },
      { x: box.max.x, y: box.min.y },
      { x: box.max.x, y: box.max.y },
      { x: box.min.x, y: box.max.y },
    ]);
    // bounds.transform(bounds, matrix): 회전된 꼭짓점을 감싸는 AABB(핵심 출력)
    aabb = Boundsx.transform(box, m);
    // handle은 현재 각도 방향으로 중심에서 고정 반지름 위치
    handle = { x: cx + Math.cos(angle) * handleRadius, y: cy + Math.sin(angle) * handleRadius };
  };

  recompute();

  const HIT_TOLERANCE = 20;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    if (Math.hypot(handle.x - x, handle.y - y) < HIT_TOLERANCE) {
      grabbed = true;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const { x, y } = getCanvasXY(e);
    // 포인터 방향이 곧 회전 각도다. atan2 결과라 항상 finite → non-finite pass-through 미발생.
    angle = Math.atan2(y - cy, x - cx);
    recompute();
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
    g.clear();

    // AABB(출력): 강조 색 채움 + 외곽선. 회전된 사각형을 감싸는 화면 정렬 박스.
    const aw = aabb.max.x - aabb.min.x;
    const ah = aabb.max.y - aabb.min.y;
    g.rect(aabb.min.x, aabb.min.y, aw, ah).fill({ color: 0x38bdf8, alpha: 0.12 });
    g.rect(aabb.min.x, aabb.min.y, aw, ah).stroke({ color: 0x38bdf8, width: 2 });

    // 회전된 사각형(입력 시각화): 연한 외곽선 폴리곤.
    g.poly(corners.flatMap((p) => [p.x, p.y])).stroke({ color: 0xe2e8f0, width: 2 });
    for (const p of corners) {
      g.circle(p.x, p.y, 3).fill(0xe2e8f0);
    }

    // 중심 점과 회전 handle.
    g.circle(cx, cy, 4).fill(0x94a3b8);
    g.moveTo(cx, cy).lineTo(handle.x, handle.y).stroke({ color: 0xf472b6, width: 1, alpha: 0.6 });
    g.circle(handle.x, handle.y, 7).fill(0xf472b6);

    const deg = ((angle * 180) / Math.PI).toFixed(0);
    label.text = `angle ${deg}°   AABB ${aw.toFixed(0)} x ${ah.toFixed(0)}   — 분홍 handle을 드래그`;
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
