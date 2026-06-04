/**
 * Segment From Normal
 *
 * 화면 고정 base segment(spine) 위에서 rib tip 핸들 1개를 drag하면 `fromNormal`이 base 위
 * foot에서 base에 직각인 rib(segment)를 다시 구성한다. 핸들이 foot 위치(t)와 수선 길이·방향
 * (signed length)을 함께 정하므로, rib는 base를 어떻게 두든 항상 base에 수직이다. "척추(spine)
 * 위 한 점에서 갈비(rib) / 수직 tick을 세운다"는 구성 작업 흐름을 보인다.
 *
 * - Segments.fromNormal: (base, t, length)에서 a' = pointAtT(base, t), b' = a' + leftNormal*length
 *   인 직각 rib를 새 object로 구성한다. drag당 1회 단발 결과라 allocating companion을 그대로
 *   호출한다(out-buffer scaffold 미사용).
 */

import * as Segments from '@cp949/vectra/segment';

type XY = { x: number; y: number };
type Segment = { a: XY; b: XY };

const BASE_COLOR = 0x94a3b8; // 고정 base segment(spine): 회색
const RIB_LEFT_COLOR = 0x34d399; // left normal 측 rib (length >= 0): 청록
const RIB_RIGHT_COLOR = 0xfbbf24; // right normal 측 rib (length < 0): 호박
const FOOT_COLOR = 0x60a5fa; // base 위 foot(= rib의 a') marker: 파랑
const SQUARE_COLOR = 0x64748b; // foot의 직각(90°) 표식: 회청
const WARN_COLOR = 0xf87171; // handle이 base 직선에 겹쳐 rib가 붕괴: 빨강
const DEGEN_EPS = 2; // |length| 이 값 이하면 zero-length rib 붕괴로 본다 (px)
const SQUARE_SIZE = 14; // 직각 표식 한 변 (px)
const HANDLE_R = 7; // rib tip 핸들 반지름 (px)
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

  // 화면 고정 base segment(spine). 살짝 기울여 직각 rib가 축에 평행하지 않게 둔다 (조작 대상 아님)
  const base: Segment = { a: { x: 180, y: 300 }, b: { x: 560, y: 205 } };
  const dx = base.b.x - base.a.x;
  const dy = base.b.y - base.a.y;
  const lenSq = dx * dx + dy * dy; // |base|^2 (고정이라 setup에서 1회 계산)
  const baseLen = Math.sqrt(lenSq); // |base| (left normal 단위화에 사용)

  // rib tip 핸들: 주 drag 대상. foot 위치(t)와 signed 수선 길이를 함께 정한다
  const handle: XY = { x: 470, y: 150 };

  // drag 시에만 갱신하는 geometry state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let rib: Segment = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  let tVal = 0; // base 위 foot의 parametric 위치 [0,1]
  let lenVal = 0; // signed 수선 길이 (left normal +, right normal -)
  let perpDeg = 90; // rib와 base 사잇각 (항상 90°: 구성의 정의 성질)
  let degen = false; // rib가 base 직선에 붕괴(zero-length)했는가

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → t·length 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  // 핸들 위치에서 직각 rib를 다시 구성한다 (drag 1회마다 호출)
  const rebuild = (): void => {
    const rx = handle.x - base.a.x;
    const ry = handle.y - base.a.y;
    // foot 파라미터 t: 핸들을 base 직선에 투영한 위치. [0,1]로 clamp해 foot가 항상 base 위
    const tRaw = (rx * dx + ry * dy) / lenSq;
    tVal = Math.max(0, Math.min(1, tRaw));
    // signed 수선 길이: 핸들의 base 직선까지 부호 있는 거리(left normal 기준). d·n=0이라 t clamp와 무관
    lenVal = (rx * -dy + ry * dx) / baseLen;
    degen = Math.abs(lenVal) <= DEGEN_EPS; // 핸들이 base 직선에 겹치면 rib 붕괴
    // 핵심 호출: base 위 foot(t)에서 left normal 방향으로 length만큼 세운 직각 rib 구성
    rib = Segments.fromNormal(base, tVal, lenVal) as Segment;
    // rib와 base 사잇각을 inline으로 측정해 직각(90°) 불변을 확인 (별도 domain import 없음)
    const rdx = rib.b.x - rib.a.x;
    const rdy = rib.b.y - rib.a.y;
    const cross = dx * rdy - dy * rdx;
    const dot = dx * rdx + dy * rdy;
    perpDeg = Math.abs((Math.atan2(cross, dot) * 180) / Math.PI);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // rib tip 근처를 누르면 잡는다 (tip이 유일한 조작 대상)
    grabbed = Math.hypot(p.x - rib.b.x, p.y - rib.b.y) <= HANDLE_R + 16;
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

    // length 부호로 rib 색을 나눠 left/right normal 측을 구분 (같은 fromNormal 분기)
    const ribColor = degen ? WARN_COLOR : lenVal >= 0 ? RIB_LEFT_COLOR : RIB_RIGHT_COLOR;

    // 고정 base segment(spine)
    g.moveTo(base.a.x, base.a.y).lineTo(base.b.x, base.b.y).stroke({ color: BASE_COLOR, width: 3 });
    g.circle(base.a.x, base.a.y, 4).fill({ color: BASE_COLOR });
    g.circle(base.b.x, base.b.y, 4).fill({ color: BASE_COLOR });

    // foot의 직각 표식: base 단위방향 u·rib 단위방향 v로 작은 정사각형을 그려 90°를 보인다
    if (!degen) {
      const ux = dx / baseLen; // base 단위방향 (a→b)
      const uy = dy / baseLen;
      const vx = (rib.b.x - rib.a.x) / Math.abs(lenVal); // rib 단위방향 (foot→tip, 측 따라 부호 포함)
      const vy = (rib.b.y - rib.a.y) / Math.abs(lenVal);
      const fx = rib.a.x;
      const fy = rib.a.y;
      const k = SQUARE_SIZE;
      g.moveTo(fx + ux * k, fy + uy * k)
        .lineTo(fx + ux * k + vx * k, fy + uy * k + vy * k)
        .lineTo(fx + vx * k, fy + vy * k)
        .stroke({ color: SQUARE_COLOR, width: 1 });
    }

    // 구성된 직각 rib: foot(a') → tip(b')
    if (!degen) {
      g.moveTo(rib.a.x, rib.a.y).lineTo(rib.b.x, rib.b.y).stroke({ color: ribColor, width: 3 });
    }

    // base 위 foot marker (= rib의 a' = pointAtT(base, t))
    g.circle(rib.a.x, rib.a.y, 5).fill({ color: FOOT_COLOR });

    // rib tip 핸들 (= rib의 b')
    g.circle(rib.b.x, rib.b.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: ribColor, width: grabbed ? 3 : 2 });

    const side = lenVal >= 0 ? 'left' : 'right';
    label.text = [
      `t  : ${tVal.toFixed(2)}   drag tip`,
      `len: ${lenVal.toFixed(0)} px  (${side} normal)${degen ? '  collapsed' : ''}`,
      `⟂  : ${degen ? '—' : `${perpDeg.toFixed(1)}°`}`,
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
