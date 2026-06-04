/**
 * Bounds Bounds Overlap
 *
 * 화면 고정 박스 A(AABB)와 draggable 박스 B를 두고, B를 drag하면 두 박스가 겹치는지 매 프레임
 * 판정한다. 겹치면 두 박스가 hit 색으로, 떨어지면 clear 색으로 바뀌어 "두 사각형(버튼/충돌체)이
 * 서로 닿는가?"라는 collision / hit-test 작업 흐름을 보인다. AABB 겹침은 "x축 구간이 겹치고 AND
 * y축 구간이 겹친다"(분리축)이므로, 아래·오른쪽 축 막대로 두 1D 구간 겹침을 함께 그려 판정 식
 * 자체를 드러낸다.
 *
 * - Intersects.intersectsBoundsBounds: 두 bounds(AABB)가 겹치거나 접하면 true를 반환한다. 각 축의
 *   구간이 모두 겹칠 때만 true인 closed boundary 검사다(변끼리 접점도 true). inverted bounds
 *   (min > max)면 false. boolean을 직접 반환해 *Into companion이 없으므로 그대로 호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Bounds = { min: XY; max: XY };

const CLEAR_COLOR = 0x60a5fa; // 안 겹침: 파랑
const HIT_COLOR = 0xf87171; // 겹침: 빨강
const AXIS_OK_COLOR = 0x4ade80; // 해당 축 구간이 겹침: 초록
const EDGE_COLOR = 0xfbbf24; // 접촉(축 겹침 ≈ 0): 노랑
const M = 24; // 박스가 머무는 영역 margin (px)
const TOP = 110; // 박스 영역 상단(라벨 아래)
const BOT = 380; // 박스 영역 하단(x축 막대 위)
const EDGE_EPS = 1.5; // |축 겹침| 이내면 접촉 경계로 본다 (px, 표시용)

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

  // 박스 A: 화면 고정 AABB (조작 대상 아님). 항상 valid(min < max)라 inverted degenerate 미발생
  const a: Bounds = { min: { x: 270, y: 170 }, max: { x: 470, y: 310 } };
  // 박스 B: 주 drag 대상. 위치만 옮기고 너비·높이는 고정
  const b: Bounds = { min: { x: 90, y: 120 }, max: { x: 250, y: 240 } };
  const bW = b.max.x - b.min.x;
  const bH = b.max.y - b.min.y;

  let grabbed = false;
  let grabDX = 0; // pointer와 b.min의 오프셋 (drag 중 유지)
  let grabDY = 0;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 박스 B 내부를 누르면 잡는다
    grabbed = p.x >= b.min.x && p.x <= b.max.x && p.y >= b.min.y && p.y <= b.max.y;
    if (grabbed) {
      grabDX = p.x - b.min.x;
      grabDY = p.y - b.min.y;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // b.min을 영역 안으로 clamp → min < max 유지 + 항상 finite 입력 (inverted/NaN 회피)
    b.min.x = Math.max(M, Math.min(size.width - M - bW, p.x - grabDX));
    b.min.y = Math.max(TOP, Math.min(BOT - bH, p.y - grabDY));
    b.max.x = b.min.x + bW;
    b.max.y = b.min.y + bH;
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => (n >= 0 ? `+${n.toFixed(0)}` : n.toFixed(0)).padStart(5);

  // 한 축의 구간 겹침 깊이. 양수면 겹침(깊이), 음수면 gap(분리 거리)
  const axisOverlap = (aLo: number, aHi: number, bLo: number, bHi: number): number =>
    Math.min(aHi, bHi) - Math.max(aLo, bLo);
  // 축 막대 색: 겹침=초록, 접촉=노랑, gap=파랑
  const axisColor = (ov: number): number =>
    ov < -EDGE_EPS ? CLEAR_COLOR : ov <= EDGE_EPS ? EDGE_COLOR : AXIS_OK_COLOR;

  const render = (): void => {
    // 핵심 호출: 두 AABB가 겹치거나 접하면 true (closed boundary)
    const overlap = Intersects.intersectsBoundsBounds(a, b);

    // 판정 식을 표시용으로 inline 분해한다 (별도 domain import 없이 같은 비교를 드러냄).
    // overlap == (xOv >= 0) && (yOv >= 0): 두 축 구간이 모두 겹쳐야 true
    const xOv = axisOverlap(a.min.x, a.max.x, b.min.x, b.max.x);
    const yOv = axisOverlap(a.min.y, a.max.y, b.min.y, b.max.y);
    // 어느 한 축이 접점(겹침 ≈ 0)이면서 전체가 겹치면 "접촉" 경계 상태
    const touching = overlap && Math.min(xOv, yOv) <= EDGE_EPS;
    const stateColor = touching ? EDGE_COLOR : overlap ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 박스 A(고정): 상태 색으로 칠한다
    g.rect(a.min.x, a.min.y, a.max.x - a.min.x, a.max.y - a.min.y)
      .fill({ color: stateColor, alpha: 0.14 })
      .stroke({ color: stateColor, width: 2 });
    // 박스 B(drag 대상): 같은 상태 색, 잡으면 stroke 굵게
    g.rect(b.min.x, b.min.y, bW, bH)
      .fill({ color: stateColor, alpha: 0.14 })
      .stroke({ color: stateColor, width: grabbed ? 3 : 2 });

    // x축 투영 막대(하단): A·B의 x구간을 나란히 그려 x축 겹침을 드러낸다
    const xc = axisColor(xOv);
    g.moveTo(a.min.x, BOT + 18)
      .lineTo(a.max.x, BOT + 18)
      .stroke({ color: xc, width: 5 });
    g.moveTo(b.min.x, BOT + 30)
      .lineTo(b.max.x, BOT + 30)
      .stroke({ color: xc, width: 5 });

    // y축 투영 막대(우측): A·B의 y구간을 나란히 그려 y축 겹침을 드러낸다
    const yc = axisColor(yOv);
    g.moveTo(size.width - 24, a.min.y)
      .lineTo(size.width - 24, a.max.y)
      .stroke({ color: yc, width: 5 });
    g.moveTo(size.width - 12, b.min.y)
      .lineTo(size.width - 12, b.max.y)
      .stroke({ color: yc, width: 5 });

    label.text = [
      `overlap: ${overlap ? 'yes' : 'no '}   drag box B`,
      `x-axis : ${fmt(xOv)} ${xOv >= 0 ? 'overlap' : 'gap'}`,
      `y-axis : ${fmt(yOv)} ${yOv >= 0 ? 'overlap' : 'gap'}`,
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
