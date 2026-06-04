/**
 * Vec Scalar Projection
 *
 * 화면 고정 원점 O와 고정 기준 축 b를 두고, 점 핸들 A 1개를 drag하면 `projectScalar(a, b)`이
 * 벡터 a(O→A)를 축 b에 투영한 부호 있는 스칼라 좌표 t = dot(a,b)/|b|²를 매번 다시 계산한다.
 * 축 위 t·b 지점에 수선의 발이 놓이고, A를 축 뒤로 끌면 t<0, 축 tip 너머로 끌면 t>1이 되어
 * "한 벡터를 기준 축에 투영한 부호 있는 스칼라 좌표를 읽는다"(scalar projection)는 작업 흐름을
 * 보인다.
 *
 * - Vectors.projectScalar: (a, b)에서 a를 b에 투영한 스칼라 t = dot(a,b)/|b|²를 number로 직접
 *   반환한다. b가 zero vector면 0을 반환한다. scalar를 직접 반환해 *Into companion이 없으므로
 *   그대로 호출한다.
 */

import * as Vectors from '@cp949/vectra/vec';

type XY = { x: number; y: number };

const ORIGIN_COLOR = 0x94a3b8; // 고정 원점 O·기준 축 b marker: 연회색 (조작 대상 아님)
const AXIS_COLOR = 0x334155; // 축 b의 무한 연장선(t<0·t>1 구간): 어두운 회색
const A_COLOR = 0x38bdf8; // 입력 벡터 a (O→A) arrow: 하늘색
const FOOT_COLOR = 0xa3e635; // 축 위 수선의 발 t·b·스칼라 결과 강조: 라임
const DROP_COLOR = 0x475569; // A→발 수직 drop line: 흐린 회색
const HANDLE_COLOR = 0xa78bfa; // 점 핸들 A (주 조작 대상): 보라
const HANDLE_R = 7; // A 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const EXT = 130; // 축을 t<0·t>1 쪽으로 연장해 그리는 길이 (px)
const TICK = 7; // t=0·t=1 눈금 길이 (px)
const DEGEN_EPS = 2; // a 붕괴(|a|≈0) 판정 임계 (px)

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

  // 고정 원점 O: 두 벡터의 시작점. 조작 대상이 아니다
  const origin: XY = { x: 160, y: 320 };

  // 고정 기준 축 tip B: O→B가 축 벡터 b이며 이 점이 t=1 좌표다. 조작 대상이 아니다
  const axisTip: XY = { x: 560, y: 200 };

  // 점 핸들 A: 유일한 drag 대상. 투영할 벡터 a = O→A를 정한다
  const handle: XY = { x: 470, y: 150 };

  // 고정 축 벡터 b와 그 단위 벡터·길이는 O·B가 고정이라 setup에서 1회만 계산한다
  const b: XY = { x: axisTip.x - origin.x, y: axisTip.y - origin.y };
  const bLen = Math.hypot(b.x, b.y);
  const bHat: XY = { x: b.x / bLen, y: b.y / bLen }; // b는 고정 non-zero라 항상 valid

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let t = 0; // a를 b에 투영한 부호 있는 스칼라 좌표 (projectScalar 출력)
  let foot: XY = { x: 0, y: 0 }; // 축 위 수선의 발 = O + t·b
  let aLen = 0; // |a| (degenerate 판정·분해 표시용)
  let thetaDeg = 0; // a와 b 사이 각 (같은 투영 관계의 inline 분해 표시)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → A가 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 입력 벡터 a = O→A
    const a: XY = { x: handle.x - origin.x, y: handle.y - origin.y };

    // 단일 핵심 관계: a를 기준 축 b에 투영한 부호 있는 스칼라 좌표 t = dot(a,b)/|b|²
    t = Vectors.projectScalar(a, b);

    // 축 위 t·b 지점이 수선의 발 → t의 의미(축을 따른 부호 좌표)를 시각화
    foot = { x: origin.x + t * b.x, y: origin.y + t * b.y };

    aLen = Math.hypot(a.x, a.y); // 같은 투영 관계를 길이로 읽은 분해 표시
    // a와 b 사이 각: a 붕괴 시 정의 불가라 0으로 두고 표시에서 가드한다
    thetaDeg = aLen <= DEGEN_EPS ? 0 : (Math.acos((a.x * b.x + a.y * b.y) / (aLen * bLen)) * 180) / Math.PI;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // A 핸들 근처를 누르면 잡는다 (A가 유일한 조작 대상)
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

    // 축 b의 무한 연장선: O 뒤(t<0)·B 너머(t>1)로 늘려 t의 부호와 배수 영역을 보인다
    g.moveTo(origin.x - bHat.x * EXT, origin.y - bHat.y * EXT)
      .lineTo(axisTip.x + bHat.x * EXT, axisTip.y + bHat.y * EXT)
      .stroke({ color: AXIS_COLOR, width: 1 });

    // 축 벡터 b 본체 (O→B = t∈[0,1] 구간) + 양끝 눈금
    const perp: XY = { x: -bHat.y, y: bHat.x }; // 축에 수직인 단위 벡터 (눈금·직각 marker용)
    g.moveTo(origin.x, origin.y).lineTo(axisTip.x, axisTip.y).stroke({ color: ORIGIN_COLOR, width: 2 });
    // t=0 눈금 (O)
    g.moveTo(origin.x - perp.x * TICK, origin.y - perp.y * TICK)
      .lineTo(origin.x + perp.x * TICK, origin.y + perp.y * TICK)
      .stroke({ color: ORIGIN_COLOR, width: 2 });
    // t=1 눈금 (B)
    g.moveTo(axisTip.x - perp.x * TICK, axisTip.y - perp.y * TICK)
      .lineTo(axisTip.x + perp.x * TICK, axisTip.y + perp.y * TICK)
      .stroke({ color: ORIGIN_COLOR, width: 2 });

    const degenerate = aLen <= DEGEN_EPS;

    if (!degenerate) {
      // A→발 수직 drop line: 투영이 축과 90°임을 보인다
      g.moveTo(handle.x, handle.y).lineTo(foot.x, foot.y).stroke({ color: DROP_COLOR, width: 1 });

      // 발 위치 직각 marker (축 단위 bHat·수직 단위 perp로 작은 ㄱ자)
      const m = 9; // 직각 marker 한 변 (px)
      // 발→A가 수직 단위 perp의 어느 쪽인지 부호 → marker를 A가 있는 쪽으로 그린다
      const s = (handle.x - foot.x) * perp.x + (handle.y - foot.y) * perp.y >= 0 ? 1 : -1;
      g.moveTo(foot.x + bHat.x * m, foot.y + bHat.y * m)
        .lineTo(foot.x + bHat.x * m + perp.x * m * s, foot.y + bHat.y * m + perp.y * m * s)
        .lineTo(foot.x + perp.x * m * s, foot.y + perp.y * m * s)
        .stroke({ color: DROP_COLOR, width: 1 });

      // 입력 벡터 a (O→A) arrow 몸통
      g.moveTo(origin.x, origin.y).lineTo(handle.x, handle.y).stroke({ color: A_COLOR, width: 3 });
      // 화살촉: A에서 a 방향 반대로 두 갈래
      const ah: XY = { x: (handle.x - origin.x) / aLen, y: (handle.y - origin.y) / aLen }; // a 단위
      const back = 14; // 화살촉 뒤로 물러나는 길이 (px)
      const wing = 7; // 화살촉 좌우 벌림 (px)
      const bx = handle.x - ah.x * back;
      const by = handle.y - ah.y * back;
      g.moveTo(handle.x, handle.y)
        .lineTo(bx - ah.y * wing, by + ah.x * wing)
        .stroke({ color: A_COLOR, width: 3 });
      g.moveTo(handle.x, handle.y)
        .lineTo(bx + ah.y * wing, by - ah.x * wing)
        .stroke({ color: A_COLOR, width: 3 });
    }

    // 축 위 수선의 발 t·b = 스칼라 결과 강조
    g.circle(foot.x, foot.y, 5).fill({ color: FOOT_COLOR });

    // 고정 원점 O marker
    g.circle(origin.x, origin.y, 5).fill({ color: ORIGIN_COLOR });

    // 점 핸들 A (주 조작 대상)
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    label.text = [
      `t  : ${t.toFixed(2)}   foot = O + t·b   drag A`,
      `|a|: ${aLen.toFixed(1)}`,
      `θ  : ${degenerate ? '—' : `${thetaDeg.toFixed(1)}°`}`,
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
