/**
 * Circle Rect Overlap
 *
 * 화면 고정 사각형(AABB)과 draggable 원형 cursor를 두고, 원을 drag하면 원반과 사각형이 겹치는지
 * 매 프레임 판정한다. 겹치면 원·사각형·연결선이 hit 색으로, 떨어지면 clear 색으로 바뀌어
 * "이 원형 cursor(브러시/공)가 사각형(버튼/벽)에 닿는가?"라는 collision / hit-test 작업 흐름을
 * 보인다. 사각형 안에서 center에 가장 가까운 점(nearest point)과 그 거리(dist)를 함께 그려
 * `dist ≤ radius`라는 판정 식 자체를 드러낸다.
 *
 * - Intersects.intersectsCircleRect: circle과 rect가 겹치거나 접하면 true를 반환한다. rect 안에서
 *   circle center에 가장 가까운 점까지의 거리로 판정하는 closed boundary 검사다(접점도 true).
 *   center가 rect 내부면 거리 0이라 항상 true다. radius ≤ 0이거나 width/height ≤ 0이면 false.
 *   boolean을 직접 반환해 *Into companion이 없으므로 그대로 호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Circle = { center: XY; radius: number };
type Rect = { x: number; y: number; width: number; height: number };

const CLEAR_COLOR = 0x60a5fa; // 안 겹침: 파랑
const HIT_COLOR = 0xf87171; // 겹침: 빨강
const EDGE_COLOR = 0xfbbf24; // 외접(경계) 근처: 노랑
const M = 16; // 화면 가장자리 margin (px)
const EDGE_EPS = 1.5; // |dist - radius| 이내면 외접 경계로 본다 (px, 표시용)

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

  // rect: 화면 고정 AABB (조작 대상 아님). 너비·높이 고정 양수라 degenerate 미발생
  const rect: Rect = { x: 250, y: 150, width: 240, height: 150 };
  // circle: 주 drag 대상. center만 옮기고 radius는 고정
  const circle: Circle = { center: { x: 150, y: 110 }, radius: 60 };

  let grabbed = false;
  let grabDX = 0; // pointer와 circle.center의 오프셋 (drag 중 유지)
  let grabDY = 0;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // circle 안쪽(disk)을 누르면 잡는다
    const dx = p.x - circle.center.x;
    const dy = p.y - circle.center.y;
    grabbed = dx * dx + dy * dy <= circle.radius * circle.radius;
    if (grabbed) {
      grabDX = p.x - circle.center.x;
      grabDY = p.y - circle.center.y;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    const r = circle.radius;
    // center를 화면 안으로 clamp → 항상 finite 입력 (NaN/Infinity 회피)
    circle.center.x = Math.max(M + r, Math.min(size.width - M - r, p.x - grabDX));
    circle.center.y = Math.max(M + r, Math.min(size.height - M - r, p.y - grabDY));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(0).padStart(4);

  const render = (): void => {
    // 핵심 호출: 원반과 AABB가 겹치거나 접하면 true (closed boundary)
    const overlap = Intersects.intersectsCircleRect(circle, rect);

    const cx = circle.center.x;
    const cy = circle.center.y;
    // 판정 식을 표시용으로 inline 분해한다 (별도 domain import 없이 같은 비교를 드러냄).
    // rect 안에서 center에 가장 가까운 점 = center를 rect 범위로 clamp한 좌표
    const nearX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
    const nearY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
    // center가 rect 내부면 nearest == center → dist 0 → 항상 overlap(containment)
    const dist = Math.hypot(cx - nearX, cy - nearY);
    // 외접(dist ≈ radius) 경계는 따로 노랑으로 강조한다 (접점도 overlap=true인 경계 상태)
    const onEdge = Math.abs(dist - circle.radius) <= EDGE_EPS;
    const stateColor = onEdge ? EDGE_COLOR : overlap ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 AABB를 상태 색으로 칠한다 (겹침 여부가 색으로 드러남)
    g.rect(rect.x, rect.y, rect.width, rect.height)
      .fill({ color: stateColor, alpha: 0.16 })
      .stroke({ color: stateColor, width: 2 });

    // center↔nearest 연결선: 길이가 dist, 판정 식 `dist ≤ radius`의 좌변을 시각화
    g.moveTo(cx, cy).lineTo(nearX, nearY).stroke({ color: stateColor, width: 2, alpha: 0.9 });
    g.circle(nearX, nearY, 4).fill({ color: stateColor }); // rect 위 최근접점 marker

    // 원형 cursor를 같은 상태 색으로 그린다
    g.circle(cx, cy, circle.radius)
      .fill({ color: stateColor, alpha: 0.16 })
      .stroke({ color: stateColor, width: grabbed ? 3 : 2 });
    g.circle(cx, cy, 3).fill({ color: stateColor }); // center dot

    label.text = [
      `overlap: ${overlap ? 'yes' : 'no '}   drag circle`,
      `dist   : ${fmt(dist)}`,
      `radius : ${fmt(circle.radius)}`,
    ].join('\n');
  };

  app.ticker.add(render);

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
