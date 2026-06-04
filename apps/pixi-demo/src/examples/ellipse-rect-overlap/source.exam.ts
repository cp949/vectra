/**
 * Ellipse Rect Overlap
 *
 * 화면 고정 사각 영역(AABB)과 draggable 타원형 cursor를 두고, 타원을 drag하면 타원과 사각형이
 * 겹치는지 매 프레임 판정한다. 겹치면 두 도형이 hit 색으로, 떨어지면 clear 색으로 바뀌어 "이
 * 타원형 hitbox(스프라이트/패들)가 사각 영역(타일/존/버튼)에 닿는가?"라는 collision / hit-test
 * 작업 흐름을 보인다. 타원은 비균등 반경이라 원↔사각형처럼 "rect 안 최근접점까지 거리" 단일
 * scalar로 분해되지 않는, 원↔AABB와 구별되는 겹침 판정이다.
 *
 * - Intersects.intersectsEllipseRect: ellipse와 rect가 겹치거나 접하면 true를 반환한다. AABB 조기
 *   분리 → rect 안 center 포함 → rect corner의 타원 단위공간 포함 → rect edge ↔ 타원 호 교차로
 *   판정하는 closed boundary 검사다(접점도 true). rx ≤ 0 또는 ry ≤ 0 또는 width/height ≤ 0이면
 *   false. boolean을 직접 반환해 *Into companion이 없으므로 그대로 호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Ellipse = { center: XY; radiusX: number; radiusY: number };
type Rect = { x: number; y: number; width: number; height: number };

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

  // rect: 화면 고정 AABB (조작 대상 아님). 너비·높이 고정 양수라 degenerate 미발생
  const rect: Rect = { x: 320, y: 160, width: 240, height: 150 };
  // ellipse: 주 drag 대상. center만 옮기고 rx/ry는 고정. rx≠ry 비균등 반경
  const ellipse: Ellipse = { center: { x: 150, y: 110 }, radiusX: 120, radiusY: 72 };

  let grabbed = false;
  let grabDX = 0; // pointer와 ellipse.center의 오프셋 (drag 중 유지)
  let grabDY = 0;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 타원 단위공간 포함( (dx/rx)^2 + (dy/ry)^2 <= 1 )이면 타원을 잡는다
    const ndx = (p.x - ellipse.center.x) / ellipse.radiusX;
    const ndy = (p.y - ellipse.center.y) / ellipse.radiusY;
    grabbed = ndx * ndx + ndy * ndy <= 1;
    if (grabbed) {
      grabDX = p.x - ellipse.center.x;
      grabDY = p.y - ellipse.center.y;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    const rx = ellipse.radiusX;
    const ry = ellipse.radiusY;
    // center를 화면 안으로 clamp → 항상 finite 입력 (NaN/Infinity 회피)
    ellipse.center.x = Math.max(M + rx, Math.min(size.width - M - rx, p.x - grabDX));
    ellipse.center.y = Math.max(M + ry, Math.min(size.height - M - ry, p.y - grabDY));
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
    // 핵심 호출: 타원과 AABB가 겹치거나 접하면 true (closed boundary). 비균등 반경이라
    // 원↔AABB의 "최근접점까지 거리" 단일 비교로는 판정할 수 없다 (원↔AABB와 구별되는 지점)
    const overlap = Intersects.intersectsEllipseRect(ellipse, rect);
    // boolean predicate라 분해할 scalar가 없다 → 색 전환으로만 겹침을 드러낸다
    const stateColor = overlap ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 AABB를 상태 색으로 칠한다 (겹침 여부가 색으로 드러남)
    g.rect(rect.x, rect.y, rect.width, rect.height)
      .fill({ color: stateColor, alpha: 0.16 })
      .stroke({ color: stateColor, width: 2 });
    g.circle(rect.x + rect.width / 2, rect.y + rect.height / 2, 3).fill({ color: stateColor }); // rect center dot

    // 타원형 cursor를 같은 상태 색으로 그린다. 잡으면 stroke 굵게
    g.ellipse(ellipse.center.x, ellipse.center.y, ellipse.radiusX, ellipse.radiusY)
      .fill({ color: stateColor, alpha: 0.16 })
      .stroke({ color: stateColor, width: grabbed ? 3 : 2 });
    g.circle(ellipse.center.x, ellipse.center.y, 3).fill({ color: stateColor }); // ellipse center dot

    label.text = [
      `overlap: ${overlap ? 'yes' : 'no '}   drag ellipse`,
      `axes   : ${fmt(ellipse.radiusX)} x ${fmt(ellipse.radiusY)}`,
      `rect   : ${fmt(rect.width)} x ${fmt(rect.height)}`,
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
