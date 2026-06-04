/**
 * Vec Wall Bounce
 *
 * 화면 고정 벽(충돌 표면)에 입사 빔의 source 핸들 1개를 drag하면 `reflect`가 입사 벡터를 벽
 * 법선에 대해 반사한 벡터를 다시 계산한다. 핸들을 어디로 끌든 반사 빔은 입사각과 같은 각으로
 * 법선 반대편으로 튀어 나가고 속력(길이)은 그대로 보존돼, 거울/레이저/당구처럼 벽에서 튕기는
 * (bounce) 작업 흐름을 보인다.
 *
 * - Vectors.reflect: (v, normal)을 `v − 2·dot(v,n)/|n|²·n`으로 반사한 벡터를 새 object로 반환한다.
 *   normal은 임의 길이를 받으므로 벽 방향에서 만든 정규화하지 않은 raw normal을 그대로 넘긴다.
 *   drag당 1회 단발 결과라 allocating companion을 그대로 호출한다(out-buffer scaffold 미사용).
 */

import * as Vectors from '@cp949/vectra/vec';

type XY = { x: number; y: number };

const WALL_COLOR = 0x475569; // 고정 벽(충돌 표면): 회색 (조작 대상 아님)
const NORMAL_COLOR = 0x334155; // 벽 법선(거울축) guide line: 어두운 회색
const INCOMING_COLOR = 0xa78bfa; // 입사 빔 v (source handle → impact): 보라
const REFLECT_COLOR = 0x38bdf8; // 반사 빔 (impact → 반사 방향): 하늘색
const ANCHOR_COLOR = 0x94a3b8; // 벽 위 impact 점 marker: 연회색
const WARN_COLOR = 0xf97316; // 입사 길이 0 붕괴(source를 impact에 겹침) warn: 주황
const HANDLE_R = 7; // source 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const DEGEN_EPS = 2; // 입사 길이 붕괴 판정 임계 (px)
const NORMAL_GUIDE_LEN = 70; // 거울축 guide line 표시 길이 (px)

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

  // 화면 고정 벽(충돌 표면). 양 끝점 모두 고정이라 벽 방향·법선은 항상 일정 (조작 대상 아님)
  const wallA: XY = { x: 180, y: 330 };
  const wallB: XY = { x: 560, y: 250 };
  // impact 점 = 벽 중점. 입사 빔이 이 점에 닿고 반사 빔이 이 점에서 출발한다 (고정)
  const anchor: XY = { x: (wallA.x + wallB.x) / 2, y: (wallA.y + wallB.y) / 2 };

  // 벽 법선: 벽 방향 d = (b−a)에 수직인 벡터 (−d.y, d.x). reflect는 임의 길이 normal을 받으므로
  // 정규화하지 않은 raw normal을 그대로 inline으로 둔다 (별도 import 없이 단일 vec domain 유지)
  const dx = wallB.x - wallA.x;
  const dy = wallB.y - wallA.y;
  const normal: XY = { x: -dy, y: dx };
  const normalLen = Math.hypot(normal.x, normal.y); // 각도 계산용 단위 환산 (벽 고정이라 1회만)
  const nux = normal.x / normalLen; // 단위 법선 x
  const nuy = normal.y / normalLen; // 단위 법선 y

  // source 핸들: 주 drag 대상. 입사 벡터 v = anchor − handle 하나를 정한다
  const handle: XY = { x: 280, y: 130 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let reflected: XY = { x: 0, y: 0 }; // 반사 벡터
  let reflectTip: XY = { x: 0, y: 0 }; // anchor + reflected (반사 빔의 끝점)
  let incidenceDeg = 0; // 입사각 (법선 기준, 도)
  let reflectionDeg = 0; // 반사각 (법선 기준, 도) — 입사각과 같아야 한다
  let speed = 0; // |v| = |reflected| (보존되는 속력)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → v가 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  // 벡터가 법선과 이루는 예각(법선 기준 입사/반사각)을 도 단위로 구한다
  const angleVsNormal = (vx: number, vy: number, len: number): number => {
    if (len <= DEGEN_EPS) return 0; // 길이 0이면 각도 미정 → 0
    // 단위 법선과의 내적 절댓값 → 법선 기준 예각 (벽 어느 쪽이든 같은 입사/반사각)
    const cos = Math.min(1, Math.abs((vx * nux + vy * nuy) / len));
    return (Math.acos(cos) * 180) / Math.PI;
  };

  // 입사 벡터 v를 벽 법선에 대해 반사한 반사 벡터를 다시 계산 (drag 1회마다 호출)
  const rebuild = (): void => {
    // 입사 벡터: source 핸들 → impact 점 (벽으로 들어가는 진행 방향)
    const vx = anchor.x - handle.x;
    const vy = anchor.y - handle.y;
    speed = Math.hypot(vx, vy);
    // 핵심 호출: 입사 벡터를 벽 법선에 대해 반사 → 반사 빔 진행 방향 (속력 보존)
    reflected = Vectors.reflect({ x: vx, y: vy }, normal) as XY;
    reflectTip = { x: anchor.x + reflected.x, y: anchor.y + reflected.y };
    // 입사각·반사각을 각각 독립으로 계산 → 같은 수가 나오는 것으로 "입사각=반사각"을 드러낸다
    incidenceDeg = angleVsNormal(vx, vy, speed);
    reflectionDeg = angleVsNormal(reflected.x, reflected.y, Math.hypot(reflected.x, reflected.y));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // source handle 근처를 누르면 잡는다 (handle이 유일한 조작 대상)
    grabbed = Math.hypot(p.x - handle.x, p.y - handle.y) <= HANDLE_R + 16;
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

    // 거울축: impact 점을 지나는 얇은 법선 guide line (양방향, 입사각=반사각의 기준축)
    g.moveTo(anchor.x - nux * NORMAL_GUIDE_LEN, anchor.y - nuy * NORMAL_GUIDE_LEN)
      .lineTo(anchor.x + nux * NORMAL_GUIDE_LEN, anchor.y + nuy * NORMAL_GUIDE_LEN)
      .stroke({ color: NORMAL_COLOR, width: 1 });

    // 고정 벽(충돌 표면)
    g.moveTo(wallA.x, wallA.y).lineTo(wallB.x, wallB.y).stroke({ color: WALL_COLOR, width: 3 });

    // 입사 길이가 0으로 붕괴(source를 impact에 겹침)하면 warn 색
    const degenerate = speed <= DEGEN_EPS;
    const reflectStroke = degenerate ? WARN_COLOR : REFLECT_COLOR;

    // 입사 빔: source 핸들 → impact 점 (벽으로 들어가는 진행 방향)
    g.moveTo(handle.x, handle.y).lineTo(anchor.x, anchor.y).stroke({ color: INCOMING_COLOR, width: 3 });

    // 반사 빔: impact 점 → 반사 끝점 (입사각과 같은 각으로 법선 반대편, 속력 보존)
    g.moveTo(anchor.x, anchor.y).lineTo(reflectTip.x, reflectTip.y).stroke({ color: reflectStroke, width: 4 });

    // 벽 위 impact 점 marker
    g.circle(anchor.x, anchor.y, 5).fill({ color: ANCHOR_COLOR });

    // 반사 빔 끝점 marker (붕괴 시 warn)
    g.circle(reflectTip.x, reflectTip.y, 5).fill({ color: reflectStroke });

    // source 핸들 (주 조작 대상)
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: INCOMING_COLOR, width: grabbed ? 3 : 2 });

    label.text = [
      `in   : ${incidenceDeg.toFixed(1)}°  (vs normal)  drag source`,
      `out  : ${reflectionDeg.toFixed(1)}°  (= in)`,
      `speed: ${speed.toFixed(0)} px${degenerate ? '  (collapsed)' : '  (preserved)'}`,
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
