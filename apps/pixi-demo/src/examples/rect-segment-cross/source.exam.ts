/**
 * Rect Segment Cross
 *
 * 화면 고정 사각 영역(AABB)과 끝점 핸들 1개를 가진 유한 선분을 두고, 끝점을 drag하면 그 선분이
 * 사각 영역을 가로지르는지 매 프레임 판정한다. 가로지르면 선분·사각형이 hit 색으로, 비껴가면
 * clear 색으로 바뀌어 "이 선분(벽/경로 구간)이 사각 영역(타일/존)을 가로지르는가?"라는 hit-test
 * 작업 흐름을 보인다. 핵심 관계는 선분 ∩ 사각형 하나뿐이라 boolean 색 전환만 둔다. 선분은 양끝이
 * 유한하므로, 끝점을 영역 앞에서 멈추면 그 방향으로 연장해도 닿을 영역에 hit=no가 되어 half-line인
 * forward ray(ray-bounds-hit)와 구별된다.
 *
 * - Intersects.intersectsRectSegment: rect와 segment가 교차하거나 접하면 true를 반환한다. rect
 *   4변과의 line-family intersection으로 판정하는 closed boundary 검사다(접점도 true).
 *   width/height ≤ 0인 empty rect는 false. boolean을 직접 반환해 *Into companion이 없으므로 그대로
 *   호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Seg = { a: XY; b: XY };
type Rect = { x: number; y: number; width: number; height: number };

const CLEAR_COLOR = 0x60a5fa; // 안 가로지름: 파랑
const HIT_COLOR = 0xf87171; // 가로지름: 빨강
const FIXED_COLOR = 0x94a3b8; // 고정 끝점 A marker: 연회색 (조작 대상 아님)
const HANDLE_COLOR = 0xa78bfa; // 끝점 B 핸들(주 조작 대상): 보라
const HANDLE_R = 7; // 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)

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

  // rect: 화면 고정 AABB zone (조작 대상 아님). 너비·높이 고정 양수라 empty rect degenerate 미발생
  const rect: Rect = { x: 270, y: 160, width: 240, height: 150 };
  // 유한 선분: A는 zone 왼쪽 바깥에 고정, B는 오른쪽 끝점 핸들(주 drag 대상)
  const seg: Seg = { a: { x: 120, y: 360 }, b: { x: 600, y: 120 } };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 끝점 B를 화면 안으로 clamp → 선분이 항상 finite (NaN/Infinity 미발생)
  const clampToScreen = (p: XY): void => {
    seg.b.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    seg.b.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 끝점 B 근처를 누르면 잡는다 (B가 유일한 조작 대상)
    grabbed = Math.hypot(p.x - seg.b.x, p.y - seg.b.y) <= HANDLE_R + 16;
    if (grabbed) clampToScreen(p);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    clampToScreen(getCanvasXY(e));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(0).padStart(3);

  const render = (): void => {
    // 핵심 호출: 선분과 사각형이 교차하거나 접하면 true (line-family closed boundary)
    const cross = Intersects.intersectsRectSegment(rect, seg);
    const stateColor = cross ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 AABB zone을 상태 색으로 칠한다 (가로지름 여부가 색으로 드러남)
    g.rect(rect.x, rect.y, rect.width, rect.height)
      .fill({ color: stateColor, alpha: 0.16 })
      .stroke({ color: stateColor, width: 2 });

    // 유한 선분 본체: 같은 상태 색. 끝점을 잡으면 굵게
    g.moveTo(seg.a.x, seg.a.y)
      .lineTo(seg.b.x, seg.b.y)
      .stroke({ color: stateColor, width: grabbed ? 4 : 3 });

    // 고정 끝점 A marker (조작 대상 아님)
    g.circle(seg.a.x, seg.a.y, 5).fill({ color: FIXED_COLOR });

    // 끝점 B 핸들 (주 조작 대상)
    g.circle(seg.b.x, seg.b.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    // 선분 길이는 단일 도형 파라미터를 읽은 표시용 분해다 (두 번째 관계가 아님)
    const segLen = Math.hypot(seg.b.x - seg.a.x, seg.b.y - seg.a.y);

    // boolean predicate라 분해할 scalar가 없다 → cross + 두 도형 파라미터만 표시한다
    label.text = [
      `cross: ${cross ? 'yes' : 'no '}   drag endpoint B`,
      `rect : ${fmt(rect.width)} x ${fmt(rect.height)}`,
      `seg  : ${fmt(segLen)} px`,
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
