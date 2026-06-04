/**
 * Angle Average Direction
 *
 * ring 둘레의 방향 핸들 3개를 drag하면 averageAngle이 세 방향각의 원형 평균(circular mean)
 * 방향을 다시 구해 밝은 needle로 그린다. 같은 입력을 단순 산술평균한 ghost needle을 함께
 * 그려, +170°와 -170°처럼 ±180° 경계를 넘는 방향에서 산술평균이 엉뚱한 쪽을 가리키는 동안
 * 원형 평균은 올바른 합성 방향을 가리키는 것을 대비한다.
 *
 * - Anglex.averageAngle: 세 방향각 배열의 sin 합·cos 합 방향을 원형 평균 1개로 반환한다.
 *   화면의 유일한 핵심 관계.
 * - Anglex.fromVector: 각 핸들의 center 기준 위치 벡터를 방향각(radian)으로 바꿔 평균 입력을
 *   만든다.
 *
 * ring·입력 화살표·ghost needle·diagnostics는 모두 같은 원형 평균 관계의 분해 표시이지 별도
 * 관계가 아니다. ghost needle의 산술평균은 plain 산술이며 다른 vectra 관계가 아니다.
 */

import * as Anglex from '@cp949/vectra/angle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const RING_COLOR = 0x334155; // 방향 ring: 어두운 회청색
const INPUT_COLOR = 0x64748b; // 입력 방향 화살표(핸들 3개): 회색
const HANDLE_COLOR = 0xe2e8f0; // 방향 핸들(주 조작 대상): 밝은 회백
const MEAN_COLOR = 0x38bdf8; // 원형 평균 needle(핵심 출력): 하늘색
const NAIVE_COLOR = 0xf472b6; // 산술평균 ghost needle(대비): 분홍
const CENTER_COLOR = 0x64748b; // center 점: 회색

const RING_R = 150; // 방향 ring 반지름 (px)
const MEAN_LEN = 168; // 평균 needle 길이 (px)
const HIT_RADIUS = 26; // 핸들 hit 반경 (px)

// 초기 세 방향(deg). +170°/-160° 부근이라 ±180° 경계를 가로질러 산술평균이 깨지는 상황을 보인다
const INITIAL_DEG = [170, -160, 150];

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

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

  // center는 화면 중앙에 고정. 모든 방향 화살표·needle의 공통 꼭짓점이다
  const center: XY = { x: size.width / 2, y: size.height / 2 };

  // 방향 핸들 3개를 ring 위에 둔다. 각 핸들은 center 기준 "방향만" 의미한다
  const handles: XY[] = INITIAL_DEG.map((deg) => ({
    x: center.x + RING_R * Math.cos(toRad(deg)),
    y: center.y + RING_R * Math.sin(toRad(deg)),
  }));

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let meanAngle = 0; // 핵심 출력: 세 방향각의 원형 평균 (radian)
  let naiveAngle = 0; // 대비용: 세 방향각의 단순 산술평균 (radian, wrap 보정 없음)
  let deltaDeg = 0; // 두 평균의 최단 각차 (deg)

  let grabbed = -1; // 잡은 핸들 index, 없으면 -1

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const rebuild = (): void => {
    // 각 핸들의 center 기준 방향각. fromVector는 atan2라 항상 finite [-π, π]
    const angles = handles.map((h) => Anglex.fromVector({ x: h.x - center.x, y: h.y - center.y }));

    // 핵심: sin 합·cos 합 방향 = 원형 평균. ±180° 경계를 올바르게 넘어 합성한다
    meanAngle = Anglex.averageAngle(angles);

    // 대비: 단순 산술평균. +170°와 -160°가 ~5°로 평균되는 등 경계에서 깨지는 값(보정하지 않는다)
    naiveAngle = (angles[0] + angles[1] + angles[2]) / 3;

    // 두 평균의 최단 각차. atan2(sin,cos)로 [-π, π] wrap 후 절대값
    const diff = meanAngle - naiveAngle;
    deltaDeg = Math.abs(toDeg(Math.atan2(Math.sin(diff), Math.cos(diff))));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 가장 가까운 핸들을 hit 반경 안에서 잡는다 (방향 입력 핸들이 주 조작 대상)
    grabbed = -1;
    let best = HIT_RADIUS;
    handles.forEach((h, i) => {
      const d = Math.hypot(p.x - h.x, p.y - h.y);
      if (d <= best) {
        best = d;
        grabbed = i;
      }
    });
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (grabbed < 0) return;
    const p = getCanvasXY(e);
    // 잡은 핸들을 ring 위로 투영한다. 방향만 바뀌고 거리는 일정 (각 계산은 거리에 무관)
    const a = Math.atan2(p.y - center.y, p.x - center.x);
    handles[grabbed].x = center.x + RING_R * Math.cos(a);
    handles[grabbed].y = center.y + RING_R * Math.sin(a);
    rebuild();
  };

  const onPointerUp = (): void => {
    grabbed = -1;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);

  rebuild();

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    const cx = center.x;
    const cy = center.y;

    // 방향 ring(핸들이 도는 둘레)
    g.circle(cx, cy, RING_R).stroke({ color: RING_COLOR, width: 1 });

    // 입력 방향 화살표 3개: center → 각 핸들 (평균에 들어가는 raw 방향)
    handles.forEach((h) => {
      g.moveTo(cx, cy).lineTo(h.x, h.y).stroke({ color: INPUT_COLOR, width: 2, alpha: 0.8 });
    });

    // 산술평균 ghost needle: 흐리게. 경계 입력에서 원형 평균과 어긋난다
    g.moveTo(cx, cy)
      .lineTo(cx + MEAN_LEN * Math.cos(naiveAngle), cy + MEAN_LEN * Math.sin(naiveAngle))
      .stroke({ color: NAIVE_COLOR, width: 2, alpha: 0.45 });

    // 원형 평균 needle(핵심 출력): 또렷하게
    g.moveTo(cx, cy)
      .lineTo(cx + MEAN_LEN * Math.cos(meanAngle), cy + MEAN_LEN * Math.sin(meanAngle))
      .stroke({ color: MEAN_COLOR, width: 4 });

    // 방향 핸들(주 조작 대상): grab 시 크게
    handles.forEach((h, i) => {
      g.circle(h.x, h.y, grabbed === i ? 11 : 9).fill({ color: HANDLE_COLOR });
    });
    // center 점(평균의 꼭짓점)
    g.circle(cx, cy, 4).fill({ color: CENTER_COLOR });

    const fmt = (n: number): string => n.toFixed(1).padStart(7);
    label.text = [
      `mean  : ${fmt(toDeg(meanAngle))} deg   circular`,
      `naive : ${fmt(toDeg(naiveAngle))} deg   arithmetic`,
      `delta : ${fmt(deltaDeg)} deg   drag handles`,
    ].join('\n');
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    label.destroy();
    g.destroy();
  };
}
