/**
 * Segment From Midpoint
 *
 * 화면 고정 pivot 둘레로 endpoint 핸들 1개를 drag하면 `fromMidpointAngleLength`가 pivot을
 * 중심으로 양쪽 대칭으로 뻗는 막대(segment)를 다시 구성한다. 핸들이 한 변 길이(half)와 방향
 * (angle)을 함께 정하므로, pivot은 항상 두 끝점의 중점에 고정된다. "중심을 정해두고 양쪽으로
 * 같은 길이씩 뻗는 dimension bar / balance beam을 각도만 돌려 배치"하는 구성 작업 흐름을 보인다.
 *
 * - Segments.fromMidpointAngleLength: midpoint·angle·length에서 중심 대칭 segment를 새 object로
 *   구성한다. a = midpoint - dir*half, b = midpoint + dir*half. drag당 1회 단발 결과라 allocating
 *   companion을 그대로 호출한다(out-buffer scaffold 미사용).
 */

import * as Segments from '@cp949/vectra/segment';

type XY = { x: number; y: number };
type Segment = { a: XY; b: XY };

const BAR_COLOR = 0xe2e8f0; // 정상 막대·핸들 색
const PIVOT_COLOR = 0x60a5fa; // pivot(중점) marker: 파랑
const RADIUS_COLOR = 0x94a3b8; // pivot→끝점 radius line: 회색
const ARC_COLOR = 0xfbbf24; // angle 호: 호박
const WARN_COLOR = 0xf87171; // 핸들이 pivot에 겹쳐 zero-length로 붕괴: 빨강
const DEGEN_EPS = 2; // |pivot→handle| 이 값 이하면 zero-length 붕괴로 본다 (px)
const HANDLE_R = 7; // endpoint 핸들 반지름 (px)
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

  // pivot: 화면 고정 중점 (조작 대상 아님). 항상 segment의 midpoint에 놓인다
  const pivot: XY = { x: size.width / 2, y: size.height / 2 };

  // endpoint B 핸들: 주 drag 대상. half(=|pivot→handle|)와 angle을 함께 정한다
  const handle: XY = { x: pivot.x + 150, y: pivot.y - 70 };

  // drag 시에만 갱신하는 geometry state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let seg: Segment = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  let angleVal = 0;
  let lengthVal = 0;
  let halfVal = 0;
  let degen = false;

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → angle·length 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  // 핸들 위치에서 segment를 다시 구성한다 (drag 1회마다 호출)
  const rebuild = (): void => {
    // r = pivot→handle. 이 한 벡터가 방향(angle)과 절반 길이(half)를 함께 정한다
    const rx = handle.x - pivot.x;
    const ry = handle.y - pivot.y;
    halfVal = Math.hypot(rx, ry); // |pivot→handle| = 한 변 길이(half)
    angleVal = Math.atan2(ry, rx); // 막대 방향각(radian)
    lengthVal = halfVal * 2; // 전체 길이 = 양쪽 half 합
    degen = halfVal <= DEGEN_EPS; // 핸들이 pivot에 겹치면 zero-length 붕괴
    // 핵심 호출: midpoint(pivot) 중심으로 대칭인 segment 구성. b == handle, a == pivot 점대칭
    seg = Segments.fromMidpointAngleLength(pivot, angleVal, lengthVal) as Segment;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 핸들 근처를 누르면 잡는다 (endpoint B가 유일한 조작 대상)
    grabbed = Math.hypot(p.x - handle.x, p.y - handle.y) <= HANDLE_R + 14;
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

    const mainColor = degen ? WARN_COLOR : BAR_COLOR;

    // pivot→두 끝점 radius line: 두 길이가 항상 같음(= half)을 드러내는 대칭 분해
    g.moveTo(pivot.x, pivot.y).lineTo(seg.a.x, seg.a.y).stroke({ color: RADIUS_COLOR, width: 1 });
    g.moveTo(pivot.x, pivot.y).lineTo(seg.b.x, seg.b.y).stroke({ color: RADIUS_COLOR, width: 1 });

    // 구성된 막대(segment) a—b
    if (!degen) {
      g.moveTo(seg.a.x, seg.a.y).lineTo(seg.b.x, seg.b.y).stroke({ color: mainColor, width: 3 });
    }

    // angle 호: +x축에서 막대 방향까지 (degenerate면 방향이 없어 생략)
    if (!degen) {
      const arcR = Math.min(48, halfVal); // 호 반지름은 막대보다 크지 않게
      g.moveTo(pivot.x + arcR, pivot.y)
        .arc(pivot.x, pivot.y, arcR, 0, angleVal, angleVal < 0)
        .stroke({ color: ARC_COLOR, width: 2 });
    }

    // a 끝점 marker (pivot 기준 handle의 점대칭점)
    g.circle(seg.a.x, seg.a.y, 5).fill({ color: mainColor });

    // pivot(중점) marker
    g.circle(pivot.x, pivot.y, 4).fill({ color: PIVOT_COLOR });

    // endpoint B 핸들 (= b 끝점)
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: mainColor, width: grabbed ? 3 : 2 });

    const deg = ((angleVal * 180) / Math.PI).toFixed(1);
    label.text = [
      `angle : ${deg}°   drag endpoint`,
      `length: ${lengthVal.toFixed(0)} px${degen ? '  (zero-length)' : ''}`,
      `half  : |mid→a| = |mid→b| = ${halfVal.toFixed(0)} px`,
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
