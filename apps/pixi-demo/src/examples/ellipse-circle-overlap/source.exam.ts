/**
 * Ellipse Circle Overlap
 *
 * 화면 고정 타원(ellipse)과 draggable 원형 cursor를 두고, 원을 drag하면 타원과 원이 겹치는지
 * 매 프레임 판정한다. 겹치면 두 도형이 hit 색으로, 떨어지면 clear 색으로 바뀌어 "이 원형
 * cursor(공/브러시)가 타원형 영역(충돌체/존)에 닿는가?"라는 collision / hit-test 작업 흐름을
 * 보인다. 타원은 비균등 반경이라 두 중심 거리 한 번으로 판정할 수 없는, 원↔원과 구별되는 겹침
 * 판정이다.
 *
 * - Intersects.intersectsEllipseCircle: ellipse와 circle이 겹치거나 접하면 true를 반환한다. 타원
 *   단위 공간 포함·타원 경계 최근접점까지 거리로 판정하는 closed boundary 검사다(접점도 true).
 *   rx ≤ 0 또는 ry ≤ 0 또는 r ≤ 0이면 false. boolean을 직접 반환해 *Into companion이 없으므로
 *   그대로 호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Circle = { center: XY; radius: number };
type Ellipse = { center: XY; radiusX: number; radiusY: number };

const CLEAR_COLOR = 0x60a5fa; // 안 겹침: 파랑
const HIT_COLOR = 0xf87171; // 겹침: 빨강
const M = 16; // 화면 가장자리 margin (px)

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

  // ellipse: 화면 고정 타원 (조작 대상 아님). rx≠ry 고정 양수라 degenerate 미발생
  const ellipse: Ellipse = { center: { x: 380, y: 230 }, radiusX: 150, radiusY: 90 };
  // circle: 주 drag 대상. center만 옮기고 radius는 고정
  const circle: Circle = { center: { x: 140, y: 110 }, radius: 56 };

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
    // 핵심 호출: 타원과 원이 겹치거나 접하면 true (closed boundary). 비균등 반경이라
    // 두 중심 거리 한 번으로는 판정할 수 없다 (원↔원과 구별되는 지점)
    const overlap = Intersects.intersectsEllipseCircle(ellipse, circle);
    // boolean predicate라 분해할 scalar가 없다 → 색 전환으로만 겹침을 드러낸다
    const stateColor = overlap ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 타원을 상태 색으로 칠한다 (겹침 여부가 색으로 드러남)
    g.ellipse(ellipse.center.x, ellipse.center.y, ellipse.radiusX, ellipse.radiusY)
      .fill({ color: stateColor, alpha: 0.16 })
      .stroke({ color: stateColor, width: 2 });
    g.circle(ellipse.center.x, ellipse.center.y, 3).fill({ color: stateColor }); // 타원 center dot

    // 원형 cursor를 같은 상태 색으로 그린다. 잡으면 stroke 굵게
    g.circle(circle.center.x, circle.center.y, circle.radius)
      .fill({ color: stateColor, alpha: 0.16 })
      .stroke({ color: stateColor, width: grabbed ? 3 : 2 });
    g.circle(circle.center.x, circle.center.y, 3).fill({ color: stateColor }); // circle center dot

    label.text = [
      `overlap: ${overlap ? 'yes' : 'no '}   drag circle`,
      `radius : ${fmt(circle.radius)}`,
      `axes   : ${fmt(ellipse.radiusX)} x ${fmt(ellipse.radiusY)}`,
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
