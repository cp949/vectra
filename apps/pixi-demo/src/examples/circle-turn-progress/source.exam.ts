/**
 * Circle Turn Progress
 *
 * 화면 고정 원(center C + 반지름 R)과 하단 수평 트랙을 두고, 트랙 위 노브 1개를 좌우로 drag하면 그
 * px 위치를 turn fraction `t ∈ [0,1]`(회전 한 바퀴를 1로 본 진행률)로 환산한다. `pointAtTurn(circle, t)`이
 * 그 진행률에 해당하는 둘레 위 점 M을 매 drag마다 다시 구하고, turn=0(angle 0 = +x 동쪽)에서 M까지
 * 호를 채워 progress ring을 그린다. 핵심 관계는 turn fraction → 둘레 위 점 1개뿐이다. 각도(radian)가
 * 아니라 "한 바퀴를 1로 정규화한 fraction"으로 둘레 위치를 잡는 작업 흐름(progress %/clock fraction)을
 * 보인다.
 *
 * - Circlex.pointAtTurn: turn fraction(= angle / 2π)을 원 둘레 위 점으로 매핑한다. 단일 핵심 관계
 *   t → M의 출력이다. 둘레 점을 드래그마다 한 번 구해 한 번만 쓰므로 allocating companion을 쓴다
 *   (out-buffer scaffold 미사용).
 *
 * turn·angle(°)·point(px)는 같은 turn 관계를 진행률·각도·좌표로 읽은 분해 diagnostics이고, 채운 호·C→M
 * 반지름 선·시작 tick·둘레 마커도 같은 단일 관계의 분해 표시다(두 번째 관계 아님). angle(°)은 turn을
 * plain 산술로 읽은 표시일 뿐 별도 각도 API가 아니다.
 */

import * as Circlex from '@cp949/vectra/circle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const CIRCLE_COLOR = 0x334155; // 고정 원 둘레: 어두운 회청색
const ARC_COLOR = 0x38bdf8; // 0→turn 진행 호 (핵심 출력 강조): 하늘색
const RADIUS_COLOR = 0x94a3b8; // C→M 반지름 선: 밝은 회색
const START_COLOR = 0x64748b; // turn=0 시작 tick (고정 기준): 회색
const MARKER_COLOR = 0xa3e635; // 둘레 진행 점 M (핵심 출력): 연두
const TRACK_COLOR = 0x475569; // 하단 트랙: 회청색
const KNOB_COLOR = 0xa78bfa; // 트랙 노브 (주 조작 대상): 보라
const KNOB_R = 8; // 노브 반지름 (px)
const ARC_STEPS = 96; // 진행 호 그리기 샘플 수 (순수 drawing)

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

  // 고정 원: center C + 반지름 R. 조작 대상이 아니다
  const cx = size.width / 2;
  const cy = size.height * 0.42;
  const R = 140;
  const circle = { center: { x: cx, y: cy }, radius: R };

  // turn=0 위치(angle 0 = +x 동쪽). pointAtTurn(circle, 0)의 시작 기준점
  const startX = cx + R;
  const startY = cy;

  // 하단 수평 트랙: 노브가 움직이는 범위. 노브 x → turn fraction
  const trackY = size.height * 0.86;
  const trackL = size.width * 0.18;
  const trackR = size.width * 0.82;

  // 유일한 drag 대상: 트랙 위 노브. 초기 turn=0.25
  let knobX = trackL + (trackR - trackL) * 0.25;

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 vectra 할당 없음)
  let turn = 0; // turn fraction t ∈ [0,1]
  let mx = startX; // 둘레 진행 점 M = pointAtTurn(circle, turn)
  let my = startY;

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

  const rebuild = (): void => {
    // 노브 x를 트랙 양끝으로 clamp → turn ∈ [0,1] (pointAtTurn은 wrap하지 않으므로 입력 범위를
    // 트랙으로 가둬 한 바퀴 진행률만 demo한다. t>1 오버슈트는 두 번째 동작이라 만들지 않는다)
    knobX = Math.max(trackL, Math.min(trackR, knobX));
    turn = clamp01((knobX - trackL) / (trackR - trackL));

    // 단일 핵심 관계: turn fraction → 원 둘레 위 점 M
    const m = Circlex.pointAtTurn(circle, turn);
    mx = m.x;
    my = m.y;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 노브 근처를 누르면 잡는다 (노브가 유일한 조작 대상)
    grabbed = Math.hypot(p.x - knobX, p.y - trackY) <= KNOB_R + 16;
    if (grabbed) {
      knobX = p.x;
      rebuild();
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    knobX = getCanvasXY(e).x;
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

  const fmt = (n: number): string => n.toFixed(1).padStart(6);

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    // 고정 원 둘레
    g.circle(cx, cy, R).stroke({ color: CIRCLE_COLOR, width: 1 });

    // 0→turn 진행 호: angle 0(+x)에서 turn*2π까지 샘플링해 lineTo (순수 drawing, vectra 호출 없음)
    const sweep = turn * 2 * Math.PI;
    g.moveTo(startX, startY);
    for (let i = 1; i <= ARC_STEPS; i++) {
      const a = sweep * (i / ARC_STEPS);
      g.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
    }
    g.stroke({ color: ARC_COLOR, width: 3 });

    // C→M 반지름 선: 진행 점이 둘레의 어느 방향인지 보인다
    g.moveTo(cx, cy).lineTo(mx, my).stroke({ color: RADIUS_COLOR, width: 1 });

    // turn=0 시작 tick (고정 기준점, +x 동쪽)
    g.circle(startX, startY, 4).fill({ color: START_COLOR });

    // 둘레 진행 점 M = pointAtTurn(circle, turn) (핵심 출력)
    g.circle(mx, my, 7).fill({ color: MARKER_COLOR });

    // 하단 트랙 + 진행 구간 강조
    g.moveTo(trackL, trackY).lineTo(trackR, trackY).stroke({ color: TRACK_COLOR, width: 2 });
    g.moveTo(trackL, trackY).lineTo(knobX, trackY).stroke({ color: ARC_COLOR, width: 2 });

    // 트랙 노브 (주 조작 대상)
    g.circle(knobX, trackY, grabbed ? KNOB_R + 2 : KNOB_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: KNOB_COLOR, width: grabbed ? 3 : 2 });

    // diagnostics: 같은 turn 관계를 진행률·각도·둘레 점 좌표로 읽는다 (3개)
    label.text = [
      `turn : ${turn.toFixed(3)}   drag knob`,
      `angle: ${fmt(turn * 360)}°`,
      `point: (${mx.toFixed(0)}, ${my.toFixed(0)})`,
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
