/**
 * Vec Aim Direction
 *
 * 화면 고정 source(눈/포탑)에서 target 핸들 1개를 drag하면 `directionTo`가 source→target
 * 단위 방향 벡터를 다시 계산한다. target을 멀리/가까이 끌어도 aim arrow 길이는 항상 일정해
 * (단위 벡터라 거리가 정규화됨), source가 target을 바라보는 방향(look-at / 조준)을 단위
 * 벡터로 얻는 작업 흐름을 보인다.
 *
 * - Vectors.directionTo: (from, to)에서 거리를 버린 단위 방향 벡터를 새 object로 반환한다.
 *   from === to(겹침)면 throw 없이 (0,0)을 반환한다. drag당 1회 단발 결과라 allocating
 *   companion을 그대로 호출한다(out-buffer scaffold 미사용).
 */

import * as Vectors from '@cp949/vectra/vec';

type XY = { x: number; y: number };

const SOURCE_COLOR = 0x94a3b8; // 고정 source(눈/포탑) marker: 연회색 (조작 대상 아님)
const RAW_COLOR = 0x334155; // source→target raw line(실제 거리 전체): 어두운 회색
const AIM_COLOR = 0x38bdf8; // 단위 방향 aim arrow(고정 길이): 하늘색
const TARGET_COLOR = 0xa78bfa; // target 핸들(주 조작 대상): 보라
const WARN_COLOR = 0xf97316; // target을 source에 겹침 → 방향 (0,0)으로 붕괴 warn: 주황
const HANDLE_R = 7; // target 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const AIM_LEN = 96; // 단위 방향을 그릴 고정 길이 (px) — 거리와 무관함을 보이는 핵심 상수
const DEGEN_EPS = 2; // 방향 붕괴 판정 임계 (px)

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

  // 고정 source(눈/포탑). 방향 벡터의 시작점이며 조작 대상이 아니다
  const source: XY = { x: 200, y: 320 };

  // target 핸들: 유일한 drag 대상. source가 바라볼 목표 점 하나를 정한다
  const target: XY = { x: 520, y: 150 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let dir: XY = { x: 0, y: 0 }; // source→target 단위 방향 벡터
  let aimTip: XY = { x: 0, y: 0 }; // source + dir·AIM_LEN (aim arrow 끝점)
  let dist = 0; // |source→target| 실제 거리 (방향에는 영향 없음, degenerate 판정용)
  let angleDeg = 0; // 단위 방향의 각 (= atan2(dir), 같은 벡터의 방향 표현)
  let dirLen = 0; // |dir| (단위라 항상 1, 붕괴 시 0)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → target이 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    target.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    target.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 단일 핵심 관계: source에서 target을 향하는 단위 방향. 거리는 정규화되어 사라진다
    dir = Vectors.directionTo(source, target);

    // 단위 방향을 고정 길이 AIM_LEN으로 시각화 → target이 멀어도 arrow 길이는 그대로
    aimTip = { x: source.x + dir.x * AIM_LEN, y: source.y + dir.y * AIM_LEN };

    dist = Math.hypot(target.x - source.x, target.y - source.y); // degenerate 판정용
    dirLen = Math.hypot(dir.x, dir.y); // 단위 길이 불변(1) 확인용, 붕괴 시 0
    angleDeg = (Math.atan2(dir.y, dir.x) * 180) / Math.PI; // 같은 단위 벡터의 방향 표현
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // target 핸들 근처를 누르면 잡는다 (target이 유일한 조작 대상)
    grabbed = Math.hypot(p.x - target.x, p.y - target.y) <= HANDLE_R + 16;
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

    // target을 source에 겹치면 방향이 (0,0)으로 붕괴 → warn
    const degenerate = dist <= DEGEN_EPS;
    const aimStroke = degenerate ? WARN_COLOR : AIM_COLOR;

    // raw line: source→target 실제 거리 전체 (aim arrow와의 길이 대비 = 방향 유지·크기 버림)
    g.moveTo(source.x, source.y).lineTo(target.x, target.y).stroke({ color: RAW_COLOR, width: 1 });

    // aim arrow 몸통: source → aimTip (단위 방향·고정 길이)
    g.moveTo(source.x, source.y).lineTo(aimTip.x, aimTip.y).stroke({ color: aimStroke, width: 4 });

    if (!degenerate) {
      // 화살촉: aimTip에서 방향 반대로 두 갈래. dir에 수직인 (−dir.y, dir.x)로 벌린다
      const back = 14; // 화살촉 뒤로 물러나는 길이 (px)
      const wing = 8; // 화살촉 좌우 벌림 (px)
      const bx = aimTip.x - dir.x * back;
      const by = aimTip.y - dir.y * back;
      const nx = -dir.y; // dir에 수직인 단위 벡터
      const ny = dir.x;
      g.moveTo(aimTip.x, aimTip.y)
        .lineTo(bx + nx * wing, by + ny * wing)
        .stroke({ color: aimStroke, width: 4 });
      g.moveTo(aimTip.x, aimTip.y)
        .lineTo(bx - nx * wing, by - ny * wing)
        .stroke({ color: aimStroke, width: 4 });
    }

    // 고정 source(눈/포탑) marker
    g.circle(source.x, source.y, 6).fill({ color: SOURCE_COLOR });

    // target 핸들 (주 조작 대상)
    g.circle(target.x, target.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: TARGET_COLOR, width: grabbed ? 3 : 2 });

    label.text = [
      `dir  : (${dir.x.toFixed(2)}, ${dir.y.toFixed(2)})   drag target`,
      `angle: ${angleDeg.toFixed(1)}°`,
      `|dir|: ${dirLen.toFixed(2)}${degenerate ? '  (collapsed)' : '  (unit)'}`,
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
