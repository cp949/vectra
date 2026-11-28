/**
 * Triangle Rect Overlap
 *
 * 화면 고정 사각 영역(AABB)과 draggable 삼각형 hitbox를 두고, 삼각형을 drag하면 두 도형이 겹치는지
 * 매 프레임 판정한다. 겹치면 삼각형·사각형이 hit 색으로, 떨어지면 clear 색으로 바뀌어 "이 삼각형
 * hitbox(스파이크/돛/스프라이트)가 사각 영역(타일/패널/존)에 닿는가?"라는 collision / hit-test 작업
 * 흐름을 보인다. 핵심 관계는 삼각형 ∩ 사각형 하나뿐이라 boolean 색 전환만 둔다.
 *
 * - Intersects.intersectsRectTriangle: rect와 triangle이 겹치거나 접하면 true를 반환한다. SAT(분리축
 *   정리)로 판정하는 closed boundary 검사다(접점도 true). width/height ≤ 0인 empty rect나 면적 0·
 *   non-finite vertex인 degenerate triangle은 false. boolean을 직접 반환해 *Into companion이 없으므로
 *   그대로 호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Tri = { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number };
type Rect = { x: number; y: number; width: number; height: number };

const CLEAR_COLOR = 0x60a5fa; // 안 겹침: 파랑
const HIT_COLOR = 0xf87171; // 겹침: 빨강
const M = 24; // 삼각형이 머무는 영역 margin (px)
const TOP = 70; // 삼각형 이동 영역 상단(라벨 아래)

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
  const rect: Rect = { x: 250, y: 160, width: 240, height: 150 };
  // 삼각형: 주 drag 대상. scalene 모양은 고정하고 위치만 평행이동한다(non-degenerate 유지)
  const tri: Tri = { x1: 540, y1: 110, x2: 640, y2: 150, x3: 560, y3: 250 };

  // v1·v2를 기준점 첫 꼭짓점에 대한 offset으로 보관 → 평행이동 시 모양 유지
  const off1 = { x: tri.x2 - tri.x1, y: tri.y2 - tri.y1 };
  const off2 = { x: tri.x3 - tri.x1, y: tri.y3 - tri.y1 };
  // 기준점 v0를 화면 안에 가두기 위한 clamp 범위 (삼각형 bbox extent 반영)
  const minOffX = Math.min(0, off1.x, off2.x);
  const maxOffX = Math.max(0, off1.x, off2.x);
  const minOffY = Math.min(0, off1.y, off2.y);
  const maxOffY = Math.max(0, off1.y, off2.y);

  let grabbed = false;
  let grabDX = 0; // pointer와 첫 꼭짓점의 오프셋 (drag 중 유지)
  let grabDY = 0;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 점 p가 삼각형 t 내부(경계 포함)인지 부호 테스트로 판정한다. winding과 무관.
  // 추가 도메인 import 없이 grab 영역만 정하는 용도다(중심 API는 아님).
  const sideOf = (px: number, py: number, ux: number, uy: number, vx: number, vy: number): number =>
    (vx - ux) * (py - uy) - (vy - uy) * (px - ux);
  const insideTri = (p: XY, t: Tri): boolean => {
    const d1 = sideOf(p.x, p.y, t.x1, t.y1, t.x2, t.y2);
    const d2 = sideOf(p.x, p.y, t.x2, t.y2, t.x3, t.y3);
    const d3 = sideOf(p.x, p.y, t.x3, t.y3, t.x1, t.y1);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 삼각형 내부를 누르면 잡는다
    grabbed = insideTri(p, tri);
    if (grabbed) {
      grabDX = p.x - tri.x1;
      grabDY = p.y - tri.y1;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 기준점 v0를 영역 안으로 clamp → 삼각형 전체가 항상 화면 안·finite (NaN/Infinity 회피)
    const v0x = Math.max(M - minOffX, Math.min(size.width - M - maxOffX, p.x - grabDX));
    const v0y = Math.max(TOP - minOffY, Math.min(size.height - M - maxOffY, p.y - grabDY));
    // v0 이동량만큼 세 vertex를 통째로 평행이동한다(모양 고정 → non-degenerate 유지)
    tri.x1 = v0x;
    tri.y1 = v0y;
    tri.x2 = v0x + off1.x;
    tri.y2 = v0y + off1.y;
    tri.x3 = v0x + off2.x;
    tri.y3 = v0y + off2.y;
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
    // 핵심 호출: 사각형과 삼각형이 겹치거나 접하면 true (SAT closed boundary)
    const overlap = Intersects.intersectsRectTriangle(rect, tri);
    const stateColor = overlap ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 AABB zone을 상태 색으로 칠한다 (겹침 여부가 색으로 드러남)
    g.rect(rect.x, rect.y, rect.width, rect.height)
      .fill({ color: stateColor, alpha: 0.16 })
      .stroke({ color: stateColor, width: 2 });

    // 삼각형 hitbox(drag 대상): 같은 상태 색, 잡으면 stroke 굵게
    g.poly([tri.x1, tri.y1, tri.x2, tri.y2, tri.x3, tri.y3]);
    g.fill({ color: stateColor, alpha: 0.16 });
    g.poly([tri.x1, tri.y1, tri.x2, tri.y2, tri.x3, tri.y3]);
    g.stroke({ color: stateColor, width: grabbed ? 3 : 2 });

    // 삼각형 bbox는 단일 도형 파라미터를 읽은 표시용 분해다 (두 번째 관계가 아님)
    const triW = Math.max(tri.x1, tri.x2, tri.x3) - Math.min(tri.x1, tri.x2, tri.x3);
    const triH = Math.max(tri.y1, tri.y2, tri.y3) - Math.min(tri.y1, tri.y2, tri.y3);

    // boolean predicate라 분해할 scalar가 없다 → overlap + 두 도형 파라미터만 표시한다
    label.text = [
      `overlap: ${overlap ? 'yes' : 'no '}   drag triangle`,
      `rect : ${fmt(rect.width)} x ${fmt(rect.height)}`,
      `tri  : ${fmt(triW)} x ${fmt(triH)}`,
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
