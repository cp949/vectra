/**
 * Vec Midpoint
 *
 * 화면 고정 anchor A에서 point 핸들 B 1개를 drag하면 `midpoint`가 두 점의 중점 M을 다시
 * 계산한다. B를 어디로 끌든 M은 항상 A와 B의 정확히 가운데에 놓이고 양쪽 절반 길이
 * (|AM|, |MB|)가 같아, 두 점의 중심(center / balance point)을 구하는 작업 흐름을 보인다.
 *
 * - Vectors.midpoint: 두 점 (a, b)의 중점 (a + b) / 2를 새 object로 반환한다. finite 입력에서
 *   throw하지 않는다. drag당 1회 단발 결과라 allocating companion을 그대로 호출한다
 *   (out-buffer scaffold 미사용).
 */

import * as Vectors from '@cp949/vectra/vec';

type XY = { x: number; y: number };

const ANCHOR_COLOR = 0x94a3b8; // 고정 anchor A marker: 연회색 (조작 대상 아님)
const LINK_COLOR = 0x38bdf8; // A–B 절반 구간(A–M, M–B): 하늘색 (같은 중점 관계의 분해)
const MID_COLOR = 0xfacc15; // 중점 M marker: 노랑 (핵심 결과)
const HANDLE_COLOR = 0xa78bfa; // point 핸들 B(주 조작 대상): 보라
const HANDLE_R = 7; // B 핸들 반지름 (px)
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

  // 고정 anchor A. 중점을 구하는 두 점 중 하나이며 조작 대상이 아니다
  const anchor: XY = { x: 200, y: 300 };

  // point 핸들 B: 유일한 drag 대상. A와 함께 중점을 정할 나머지 점 하나를 정한다
  const point: XY = { x: 520, y: 160 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let mid: XY = { x: 0, y: 0 }; // A와 B의 중점
  let dist = 0; // |AB| 전체 거리
  let half = 0; // dist / 2 (= |AM| = |MB|, 중점이 정가운데임을 보이는 값)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → B가 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    point.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    point.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 단일 핵심 관계: 두 점 A, B의 중점. B를 A에 겹치면 throw 없이 M=A=B로 모인다
    mid = Vectors.midpoint(anchor, point);

    dist = Math.hypot(point.x - anchor.x, point.y - anchor.y); // |AB| 전체 거리
    half = dist / 2; // 중점에서 각 끝점까지 거리 (양쪽이 같음)
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // B 핸들 근처를 누르면 잡는다 (B가 유일한 조작 대상)
    grabbed = Math.hypot(p.x - point.x, p.y - point.y) <= HANDLE_R + 16;
    if (grabbed) {
      clampToScreen(p);
      rebuild();
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    clampToScreen(getCanvasXY(e));
    rebuild();
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  rebuild(); // 초기 state 1회 계산

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 절반 구간 A–M, M–B를 같은 색으로 그린다 → 중점이 정가운데(두 절반이 같음)임을 시각화
    g.moveTo(anchor.x, anchor.y).lineTo(mid.x, mid.y).stroke({ color: LINK_COLOR, width: 3 });
    g.moveTo(mid.x, mid.y).lineTo(point.x, point.y).stroke({ color: LINK_COLOR, width: 3 });

    // 고정 anchor A marker
    g.circle(anchor.x, anchor.y, 6).fill({ color: ANCHOR_COLOR });

    // 중점 M marker (핵심 결과)
    g.circle(mid.x, mid.y, 6).fill({ color: MID_COLOR });

    // point 핸들 B (주 조작 대상)
    g.circle(point.x, point.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    label.text = [
      `mid  : (${mid.x.toFixed(1)}, ${mid.y.toFixed(1)})   drag B`,
      `|AB| : ${dist.toFixed(1)}`,
      `half : ${half.toFixed(1)}  (= |AM| = |MB|)`,
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
