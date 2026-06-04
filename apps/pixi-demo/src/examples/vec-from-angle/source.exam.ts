/**
 * Vec From Angle
 *
 * 화면 위쪽 수평 각도 슬라이더 핸들 1개를 drag하면 슬라이더 위치가 스칼라 각 θ(0~360°)로
 * 매핑되고, `fromAngle`이 그 각에 해당하는 단위 방향 벡터 (cos θ, sin θ)를 단위원 위에 다시
 * 구성한다. 입력이 점이 아닌 순수 각도값이라, 두 점에서 방향을 얻는 directionTo와 달리 "각도
 * 하나에서 단위 방향을 만든다"는 구성 작업 흐름을 보인다.
 *
 * - Vectors.fromAngle: 스칼라 각 θ(라디안)를 단위 방향 벡터 (cos θ, sin θ)로 구성해 새 object로
 *   반환한다. 슬라이더 변경당 1회 단발 결과라 allocating companion을 그대로 호출한다(out-buffer
 *   scaffold 미사용). |dir|은 항상 1이고 throw/붕괴가 없어 라이브 warn 경로가 없다.
 */

import * as Vectors from '@cp949/vectra/vec';

type XY = { x: number; y: number };

const TRACK_COLOR = 0x334155; // 슬라이더 트랙(입력 위젯): 어두운 회색
const TICK_COLOR = 0x475569; // 트랙 0/90/180/270/360 눈금: 회색
const HANDLE_COLOR = 0xa78bfa; // 슬라이더 핸들(주 조작 대상): 보라
const CIRCLE_COLOR = 0x1e293b; // 단위원 둘레(고정): 짙은 회색
const REF_COLOR = 0x334155; // 0° 기준 ray(각도 원점 표시): 어두운 회색
const DIR_COLOR = 0x38bdf8; // 단위 방향 arrow(fromAngle 출력): 하늘색
const TWO_PI = Math.PI * 2;

const TRACK_X0 = 120; // 슬라이더 트랙 시작 x (θ=0°)
const TRACK_X1 = 600; // 슬라이더 트랙 끝 x (θ=360°)
const TRACK_Y = 70; // 슬라이더 트랙 y (수평 고정)
const HANDLE_R = 8; // 슬라이더 핸들 반지름 (px)
const GRAB_PAD = 22; // 트랙 잡기 허용 세로 여유 (px)

const CX = 360; // 단위원 중심 x (고정)
const CY = 270; // 단위원 중심 y (고정)
const UNIT_R = 120; // 단위 방향을 그릴 원 반지름 (px) — 단위 벡터를 화면 크기로 키운 값

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

  // 슬라이더 핸들 x: 유일한 drag 대상. 이 스칼라 위치 하나가 각 θ를 정한다(y는 트랙에 고정)
  let handleX = 180;

  // 슬라이더 변경 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let theta = 0; // 슬라이더 위치 → 스칼라 각 θ(라디안)
  let dir: XY = { x: 0, y: 0 }; // fromAngle(θ) 단위 방향 벡터
  let tip: XY = { x: 0, y: 0 }; // 단위원 위 끝점 = center + dir·UNIT_R
  let angleDeg = 0; // θ를 도(°)로 표시 (같은 각의 표현)
  let dirLen = 0; // |dir| (단위라 항상 1)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들 x를 트랙 범위로 clamp → 슬라이더 위치가 항상 finite (non-finite 각 미발생)
  const clampToTrack = (x: number): void => {
    handleX = Math.max(TRACK_X0, Math.min(TRACK_X1, x));
  };

  const rebuild = (): void => {
    // 슬라이더 위치를 정규화 비율 p∈[0,1]로, 다시 스칼라 각 θ∈[0,2π)로 매핑한다
    const p = (handleX - TRACK_X0) / (TRACK_X1 - TRACK_X0);
    theta = p * TWO_PI;

    // 단일 핵심 관계: 스칼라 각 θ → 단위 방향 벡터. 점 쌍이 개입하지 않는다
    dir = Vectors.fromAngle(theta);

    // 단위 벡터를 단위원 반지름 UNIT_R로 키워 화면에 그린다 (screen y가 아래라 θ 증가는 시계방향)
    tip = { x: CX + dir.x * UNIT_R, y: CY + dir.y * UNIT_R };

    angleDeg = (theta * 180) / Math.PI; // 같은 각의 도(°) 표현
    dirLen = Math.hypot(dir.x, dir.y); // 단위 길이 불변(1) 확인용
  };

  const onPointerDown = (e: PointerEvent): void => {
    const pt = getCanvasXY(e);
    // 트랙 근처(세로 여유 안)를 누르면 슬라이더를 잡고 그 x로 핸들을 옮긴다
    grabbed = Math.abs(pt.y - TRACK_Y) <= GRAB_PAD && pt.x >= TRACK_X0 - GRAB_PAD && pt.x <= TRACK_X1 + GRAB_PAD;
    if (grabbed) {
      clampToTrack(pt.x);
      rebuild();
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    clampToTrack(getCanvasXY(e).x); // 슬라이더는 1-DOF: x만 변한다
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

    // 슬라이더 트랙(입력 위젯) + 0/90/180/270/360 눈금
    g.moveTo(TRACK_X0, TRACK_Y).lineTo(TRACK_X1, TRACK_Y).stroke({ color: TRACK_COLOR, width: 3 });
    for (let i = 0; i <= 4; i += 1) {
      const tx = TRACK_X0 + ((TRACK_X1 - TRACK_X0) * i) / 4;
      g.moveTo(tx, TRACK_Y - 7)
        .lineTo(tx, TRACK_Y + 7)
        .stroke({ color: TICK_COLOR, width: 1 });
    }

    // 단위원 둘레(고정) + 0° 기준 ray(각도 원점 = +x 방향)
    g.circle(CX, CY, UNIT_R).stroke({ color: CIRCLE_COLOR, width: 2 });
    g.moveTo(CX, CY)
      .lineTo(CX + UNIT_R, CY)
      .stroke({ color: REF_COLOR, width: 1, alpha: 0.8 });

    // 단위 방향 arrow 몸통: center → tip (fromAngle 출력을 UNIT_R로 키운 벡터)
    g.moveTo(CX, CY).lineTo(tip.x, tip.y).stroke({ color: DIR_COLOR, width: 4 });

    // 화살촉: tip에서 방향 반대로 물러나 dir에 수직 (−dir.y, dir.x)로 두 갈래 벌린다
    const back = 14; // 화살촉 뒤로 물러나는 길이 (px)
    const wing = 8; // 화살촉 좌우 벌림 (px)
    const bx = tip.x - dir.x * back;
    const by = tip.y - dir.y * back;
    const nx = -dir.y; // dir에 수직인 단위 벡터
    const ny = dir.x;
    g.moveTo(tip.x, tip.y)
      .lineTo(bx + nx * wing, by + ny * wing)
      .stroke({ color: DIR_COLOR, width: 4 });
    g.moveTo(tip.x, tip.y)
      .lineTo(bx - nx * wing, by - ny * wing)
      .stroke({ color: DIR_COLOR, width: 4 });

    // 단위원 위 끝점 dot + 중심 dot
    g.circle(tip.x, tip.y, 6).fill({ color: DIR_COLOR });
    g.circle(CX, CY, 4).fill({ color: 0x94a3b8 });

    // 슬라이더 핸들(주 조작 대상)
    g.circle(handleX, TRACK_Y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    label.text = [
      `angle: ${angleDeg.toFixed(1)}°   drag slider`,
      `dir  : (${dir.x.toFixed(2)}, ${dir.y.toFixed(2)})`,
      `|dir|: ${dirLen.toFixed(2)}  (unit)`,
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
