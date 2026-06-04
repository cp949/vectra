/**
 * Remap Gauge Needle
 *
 * 수평 입력 트랙의 노브 1개를 좌우로 drag하면 그 px 위치를 `remap`으로 게이지 바늘의 각도 범위로
 * 선형 변환해 바늘이 호를 따라 움직인다. 노브를 트랙 양끝 너머로 끌면 `remap`은 clamp하지 않으므로
 * raw 바늘이 게이지 호 밖으로 외삽되고, 같은 순간 `clamp`을 거친 marker는 호 끝에 고정돼 두 정책을
 * 한 장면에서 대비한다. 입력 범위(px)와 출력 범위(각도)가 서로 다르다는 점이 핵심이다.
 *
 * - Mathx.remap: 노브 x를 입력 트랙 범위 [trackL, trackR]에서 바늘 각도 범위 [A_START, A_END]로
 *   선형 변환한다. 단일 핵심 관계 "노브 위치 → 바늘 각도"의 출력이고, source range 밖에서는 clamp
 *   없이 외삽한다. number를 직접 반환해 `*Into` companion이 없으므로 그대로 호출한다.
 * - Mathx.clamp: 노브 x를 트랙 범위로 제한한 뒤 같은 remap에 넣어 호 끝에 고정되는 clamped 바늘을
 *   만든다. remap의 외삽과 대비되는 clamp 정책 표시다(같은 관계의 다른 정책).
 * - Vectorx.fromAngle: 각도 → 단위 방향 벡터 (cos, sin). pivot에서 이 방향으로 바늘 끝점을 잡는다.
 */

import * as Mathx from '@cp949/vectra/math';
import * as Vectorx from '@cp949/vectra/vec';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const ARC_COLOR = 0x334155; // 게이지 호 face: 어두운 회청색
const TRACK_COLOR = 0x475569; // 입력 트랙: 회청색
const NEEDLE_COLOR = 0x7dd3fc; // raw 바늘(핵심 출력): 밝은 하늘색
const CLAMP_COLOR = 0xfbbf24; // clamped marker: 호박색
const KNOB_COLOR = 0xa78bfa; // 입력 노브(주 조작 대상): 보라
const KNOB_R = 8; // 노브 반지름 (px)
const GRAB_PAD = 16; // 노브 grab 허용 여유 (px)
const NLEN = 132; // 바늘 길이 (px)
const ARC_STEPS = 80; // 게이지 호 샘플 수 (순수 drawing)

// 게이지 호 각도 범위. screen 좌표에서 fromAngle=(cos,sin)이고 sin<0이 위쪽이다.
// up-left(-150°) → up-right(-30°), 약 120° sweep으로 바늘이 아래로 내려가지 않는다.
const A_START = (-5 * Math.PI) / 6;
const A_END = -Math.PI / 6;

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

  // 게이지 pivot(바늘 회전 중심)과 입력 트랙. 모두 화면 고정 기준선이다
  const pivot = { x: size.width / 2, y: size.height * 0.6 };
  const trackY = size.height * 0.82; // 입력 트랙의 화면 y
  const trackL = size.width * 0.18; // 트랙 좌측 끝 (입력 범위 하한)
  const trackR = size.width * 0.82; // 트랙 우측 끝 (입력 범위 상한)
  // 외삽 시연용으로 노브가 트랙 밖으로 약간 나갈 수 있게 두되 화면 안에 가둔다
  const knobMin = trackL - size.width * 0.12;
  const knobMax = trackR + size.width * 0.12;

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 vectra 할당 없음)
  let knobX = (trackL + trackR) / 2; // 노브의 화면 x. 시작은 트랙 중앙
  let angle = 0; // raw 바늘 각도 = remap(knobX, ...)
  let clampedAngle = 0; // clamp 후 remap한 바늘 각도
  let pct = 0; // 트랙 비율 % (외삽 시 0 미만/100 초과)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    // canvas CSS 크기가 screen 크기와 다를 수 있어 비율로 보정한다
    return {
      x: (e.clientX - r.left) * (size.width / r.width),
      y: (e.clientY - r.top) * (size.height / r.height),
    };
  };

  const rebuild = (): void => {
    // 노브 x를 화면 안(트랙 밖 외삽 여유 포함)으로만 제한 → remap 입력은 항상 finite
    knobX = Math.max(knobMin, Math.min(knobMax, knobX));

    // 단일 핵심 관계: 노브 x 위치(px range) → 바늘 각도(radian range). clamp 없이 외삽한다
    angle = Mathx.remap(knobX, trackL, trackR, A_START, A_END);

    // 같은 관계에 clamp 정책 적용: 노브 x를 트랙 범위로 가둔 뒤 같은 remap → 호 끝에 고정
    clampedAngle = Mathx.remap(Mathx.clamp(knobX, trackL, trackR), trackL, trackR, A_START, A_END);

    // 트랙 비율 표시값 (plain 산술, 외삽 시 0~100 밖). 별도 단위 remap이 아니다
    pct = ((knobX - trackL) / (trackR - trackL)) * 100;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 노브 근처를 누르면 잡는다 (노브가 유일한 조작 대상)
    grabbed = Math.hypot(p.x - knobX, p.y - trackY) <= KNOB_R + GRAB_PAD;
    if (grabbed) {
      knobX = p.x;
      rebuild();
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    knobX = getCanvasXY(e).x; // 노브는 수평으로만 움직인다 (y 고정)
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
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    // 게이지 호 face: A_START → A_END 구간을 샘플해 그린다 (순수 drawing, vectra 호출 없음)
    g.moveTo(pivot.x + NLEN * Math.cos(A_START), pivot.y + NLEN * Math.sin(A_START));
    for (let i = 1; i <= ARC_STEPS; i++) {
      const a = A_START + (A_END - A_START) * (i / ARC_STEPS);
      g.lineTo(pivot.x + NLEN * Math.cos(a), pivot.y + NLEN * Math.sin(a));
    }
    g.stroke({ color: ARC_COLOR, width: 3 });

    // 입력 트랙(수평선) + 양끝 tick
    g.moveTo(trackL, trackY).lineTo(trackR, trackY).stroke({ color: TRACK_COLOR, width: 2 });
    for (const tx of [trackL, trackR]) {
      g.moveTo(tx, trackY - 8)
        .lineTo(tx, trackY + 8)
        .stroke({ color: TRACK_COLOR, width: 2 });
    }

    // clamped marker: 호 위에 고정되는 점 (clamp 정책). 각도 → 끝점은 fromAngle로 계산
    const cdir = Vectorx.fromAngle(clampedAngle);
    g.circle(pivot.x + NLEN * cdir.x, pivot.y + NLEN * cdir.y, 7).fill({ color: CLAMP_COLOR });

    // raw 바늘: pivot에서 remap 각도 방향으로 뻗는다. 외삽 시 호 밖까지 나간다
    const dir = Vectorx.fromAngle(angle);
    g.moveTo(pivot.x, pivot.y)
      .lineTo(pivot.x + NLEN * dir.x, pivot.y + NLEN * dir.y)
      .stroke({ color: NEEDLE_COLOR, width: 3 });

    // pivot hub
    g.circle(pivot.x, pivot.y, 6).fill({ color: NEEDLE_COLOR });

    // 입력 노브 (주 조작 대상)
    g.circle(knobX, trackY, grabbed ? KNOB_R + 2 : KNOB_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: KNOB_COLOR, width: grabbed ? 3 : 2 });

    // diagnostics: 같은 remap 관계를 입력 비율·출력 각도·정책 상태로 읽는다 (3개)
    const extrapolated = knobX < trackL || knobX > trackR;
    label.text = [
      `pos   : ${pct.toFixed(1)} %   drag ↔`,
      `angle : ${((angle * 180) / Math.PI).toFixed(1)}°`,
      `state : ${extrapolated ? 'extrapolated (no clamp)' : 'in range'}`,
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
