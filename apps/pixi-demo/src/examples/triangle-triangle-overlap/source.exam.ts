/**
 * Triangle Triangle Overlap
 *
 * 화면 고정 삼각형 A와 draggable 삼각형 B를 두고, B를 drag하면 두 삼각형이 겹치는지 매 프레임
 * 판정한다. 겹치면 두 삼각형이 hit 색으로, 떨어지면 clear 색으로 바뀌어 "두 볼록 도형(충돌체)이
 * 서로 닿는가?"라는 collision / hit-test 작업 흐름을 보인다.
 *
 * - Intersects.intersectsTriangleTriangle: 두 triangle이 겹치거나 접하면 true를 반환한다. SAT
 *   (분리축 정리)로 6개 변 법선 축을 검사하는 closed boundary 판정이다(끝점 공유·edge 접촉도 true).
 *   degenerate(collinear)나 non-finite vertex 삼각형은 false. boolean을 직접 반환해 *Into companion이
 *   없으므로 그대로 호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Tri = { a: XY; b: XY; c: XY };

const CLEAR_COLOR = 0x60a5fa; // 안 겹침: 파랑
const HIT_COLOR = 0xf87171; // 겹침: 빨강
const M = 24; // 삼각형 B가 머무는 영역 margin (px)
const TOP = 70; // B 이동 영역 상단(라벨 아래)

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

  // 삼각형 A: 화면 고정 scalene. non-degenerate라 SAT degenerate 경로 미발생
  const a: Tri = { a: { x: 180, y: 150 }, b: { x: 360, y: 300 }, c: { x: 140, y: 330 } };
  // 삼각형 B: 주 drag 대상. 모양은 고정하고 위치만 평행이동한다
  const b: Tri = { a: { x: 500, y: 110 }, b: { x: 620, y: 160 }, c: { x: 520, y: 260 } };

  // B의 v1·v2를 기준점 v0(b.a)에 대한 offset으로 보관 → 평행이동 시 모양 유지
  const off1 = { x: b.b.x - b.a.x, y: b.b.y - b.a.y };
  const off2 = { x: b.c.x - b.a.x, y: b.c.y - b.a.y };
  // 기준점 v0를 화면 안에 가두기 위한 clamp 범위 (삼각형 bbox extent 반영)
  const minOffX = Math.min(0, off1.x, off2.x);
  const maxOffX = Math.max(0, off1.x, off2.x);
  const minOffY = Math.min(0, off1.y, off2.y);
  const maxOffY = Math.max(0, off1.y, off2.y);

  let grabbed = false;
  let grabDX = 0; // pointer와 b.a의 오프셋 (drag 중 유지)
  let grabDY = 0;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 점 p가 삼각형 t 내부(경계 포함)인지 부호 테스트로 판정한다. winding과 무관.
  // 추가 도메인 import 없이 grab 영역만 정하는 용도다(중심 API는 아님).
  const side = (px: number, py: number, ux: number, uy: number, vx: number, vy: number): number =>
    (vx - ux) * (py - uy) - (vy - uy) * (px - ux);
  const insideTri = (p: XY, t: Tri): boolean => {
    const d1 = side(p.x, p.y, t.a.x, t.a.y, t.b.x, t.b.y);
    const d2 = side(p.x, p.y, t.b.x, t.b.y, t.c.x, t.c.y);
    const d3 = side(p.x, p.y, t.c.x, t.c.y, t.a.x, t.a.y);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 삼각형 B 내부를 누르면 잡는다
    grabbed = insideTri(p, b);
    if (grabbed) {
      grabDX = p.x - b.a.x;
      grabDY = p.y - b.a.y;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 기준점 v0를 영역 안으로 clamp → 삼각형 전체가 항상 화면 안·finite (non-degenerate 유지)
    const v0x = Math.max(M - minOffX, Math.min(size.width - M - maxOffX, p.x - grabDX));
    const v0y = Math.max(TOP - minOffY, Math.min(size.height - M - maxOffY, p.y - grabDY));
    // v0 이동량만큼 세 vertex를 통째로 평행이동한다
    b.a.x = v0x;
    b.a.y = v0y;
    b.b.x = v0x + off1.x;
    b.b.y = v0y + off1.y;
    b.c.x = v0x + off2.x;
    b.c.y = v0y + off2.y;
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
    // 핵심 호출: 두 삼각형이 겹치거나 접하면 true (SAT closed boundary)
    const overlap = Intersects.intersectsTriangleTriangle(a, b);
    const stateColor = overlap ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 삼각형 A(고정): 상태 색으로 칠한다
    g.poly([a.a.x, a.a.y, a.b.x, a.b.y, a.c.x, a.c.y]);
    g.fill({ color: stateColor, alpha: 0.14 });
    g.poly([a.a.x, a.a.y, a.b.x, a.b.y, a.c.x, a.c.y]);
    g.stroke({ color: stateColor, width: 2 });

    // 삼각형 B(drag 대상): 같은 상태 색, 잡으면 stroke 굵게
    g.poly([b.a.x, b.a.y, b.b.x, b.b.y, b.c.x, b.c.y]);
    g.fill({ color: stateColor, alpha: 0.14 });
    g.poly([b.a.x, b.a.y, b.b.x, b.b.y, b.c.x, b.c.y]);
    g.stroke({ color: stateColor, width: grabbed ? 3 : 2 });

    // boolean predicate라 분해할 scalar가 없다 → overlap + 안내만 표시한다
    label.text = [`overlap: ${overlap ? 'yes' : 'no '}`, 'drag triangle B'].join('\n');
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
