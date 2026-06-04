/**
 * Segment Segment Cross
 *
 * 화면 고정 선분 A와 draggable 선분 B를 두고, B의 자유 끝점을 drag하면 두 선분이 교차하는지 매 프레임
 * 판정한다. 교차하면 두 선분이 hit 색으로, 떨어지면 clear 색으로 바뀌어 "두 선분이 서로 가로지르는가?"
 * 라는 collision / link-crossing hit-test 작업 흐름을 보인다.
 *
 * - Intersects.intersectsSegmentSegment: 두 segment가 만나면 true를 반환한다. 평행(서로 다른 직선)이면
 *   false, collinear이고 구간이 겹치면 true, 끝점만 닿아도 true(closed)이며, zero-length segment는 점으로
 *   환원해 다른 segment의 containment로 판정한다. boolean을 직접 반환해 *Into companion이 없으므로 그대로
 *   호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Segment = { a: XY; b: XY };

const CLEAR_COLOR = 0x60a5fa; // 안 교차: 파랑
const HIT_COLOR = 0xf87171; // 교차: 빨강
const M = 16; // 화면 가장자리 margin (px)
const GRAB_R = 14; // 자유 끝점 잡기 반경 (px)

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

  // 선분 A: 화면 고정 (조작 대상 아님)
  const segA: Segment = { a: { x: 200, y: 130 }, b: { x: 520, y: 320 } };
  // 선분 B: a는 고정 anchor, b가 주 drag 대상
  const segB: Segment = { a: { x: 230, y: 330 }, b: { x: 500, y: 140 } };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 선분 B의 자유 끝점(b) 근처를 누르면 잡는다
    const dx = p.x - segB.b.x;
    const dy = p.y - segB.b.y;
    grabbed = dx * dx + dy * dy <= GRAB_R * GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 끝점을 화면 안으로 clamp → 항상 finite 입력 (NaN/Infinity 회피)
    segB.b.x = Math.max(M, Math.min(size.width - M, p.x));
    segB.b.y = Math.max(M, Math.min(size.height - M, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 선분 하나를 굵은 stroke + 양 끝점 dot으로 그린다
  const drawSegment = (s: Segment, color: number, dotB: number): void => {
    g.moveTo(s.a.x, s.a.y).lineTo(s.b.x, s.b.y).stroke({ color, width: 4, alpha: 0.95 });
    g.circle(s.a.x, s.a.y, 4).fill({ color }); // anchor 끝점
    g.circle(s.b.x, s.b.y, dotB).fill({ color }); // 자유 끝점
  };

  const render = (): void => {
    // 핵심 호출: 두 선분이 만나면 true (평행 false, collinear 겹침·끝점 닿음 true)
    const overlap = Intersects.intersectsSegmentSegment(segA, segB);

    // 끝점이 겹쳐 segB가 zero-length가 되면 점으로 환원돼 A 위 containment로 판정된다 (degenerate)
    const stateColor = overlap ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    drawSegment(segA, stateColor, 4); // A는 고정이라 자유 끝점 강조 없음
    drawSegment(segB, stateColor, grabbed ? 7 : 5); // B의 자유 끝점은 잡으면 더 크게

    label.text = [`intersect : ${overlap ? 'yes' : 'no '}`, 'drag the free endpoint of segment B'].join('\n');
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
