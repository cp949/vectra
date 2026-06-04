/**
 * Circle Sagitta
 *
 * 화면 고정 원(center C + 반지름 R)과 고정 호 시작점 A를 두고, 호 끝점 핸들 B 1개를 원 둘레로
 * drag하면 `sagitta(circle, θ)`가 그 호의 활꼴 높이(sagitta) h = r(1 − cos(θ/2))를 매 drag마다 다시
 * 구한다. B를 옮기면 중심각 θ가 커지거나 작아지고, 현 중점 M에서 호 정점 apex까지의 선분 길이가
 * 곧 h로 따라 바뀌어 "호(현)가 얼마나 부풀어 있는가 = 활꼴 높이를 구한다"(circular segment
 * sagitta / arc height)는 작업 흐름을 보인다. 그려진 M→apex 선분 길이는 반환된 h와 정확히 같다.
 *
 * - Circlex.sagitta: 중심각 θ에 대응하는 활꼴 높이 scalar h를 반환한다. 단일 핵심 관계
 *   θ → h(=r(1−cos(θ/2)))의 출력이다. number를 직접 반환해 `*Into` companion이 없으므로 그대로
 *   호출한다(out-buffer scaffold 미사용).
 *
 * θ°·h·R은 같은 sagitta 관계를 입력 각·출력 높이·반지름으로 읽은 분해 diagnostics이고, 호·현·현
 * 중점·정점·sagitta 선분도 같은 단일 관계의 분해 표시다(두 번째 관계 아님).
 */

import * as Circlex from '@cp949/vectra/circle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const CIRCLE_COLOR = 0x334155; // 고정 원 둘레: 어두운 회청색
const ARC_COLOR = 0x38bdf8; // A→B 호 강조: 하늘색
const CHORD_COLOR = 0x94a3b8; // 현 AB: 밝은 회색
const SAGITTA_COLOR = 0xa3e635; // sagitta 선분 M→apex (핵심 출력): 연두
const START_COLOR = 0x64748b; // 고정 호 시작점 A: 회색
const APEX_COLOR = 0xfbbf24; // 호 정점 apex: 호박색
const HANDLE_COLOR = 0xa78bfa; // 호 끝점 핸들 B (주 조작 대상): 보라
const HANDLE_R = 7; // B 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const START_ANGLE = -Math.PI / 2; // 고정 호 시작 각 (원 위쪽). 조작 대상 아님
const ARC_STEPS = 72; // 호 그리기 샘플 수 (순수 drawing)

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
  const cy = size.height / 2 + 10;
  const R = 150;
  const circle = { center: { x: cx, y: cy }, radius: R };

  // 고정 호 시작점 A (원 위 START_ANGLE 위치)
  const ax = cx + R * Math.cos(START_ANGLE);
  const ay = cy + R * Math.sin(START_ANGLE);

  // 호 끝점 핸들 B: 유일한 drag 대상. pointer 방향각을 원 둘레로 투영해 결정한다
  const handle: XY = { x: cx + R * Math.cos(0.9), y: cy + R * Math.sin(0.9) };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 vectra 할당 없음)
  let theta = 0; // 중심각 θ (A→B CCW sweep, [0, 2π))
  let sag = 0; // 활꼴 높이 h = sagitta(circle, θ)
  let bx = handle.x; // 원 둘레 위 호 끝점 B
  let by = handle.y;
  let apexX = ax; // 호 정점 (이등분각 방향 원 위 점)
  let apexY = ay;
  let mx = ax; // 현 AB 중점
  let my = ay;

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → pointer 좌표가 항상 finite (비유한 입력 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // pointer 방향각을 원 둘레로 투영해 호 끝점 B를 얻는다 (radial 핸들이 호 끝점을 정의하므로
    // from-angle-scalar-input-not-point 함정 아님: θ는 이 호의 sweep이라 directionTo와 동치가 아니다)
    const bAngle = Math.atan2(handle.y - cy, handle.x - cx);
    // 중심각 θ = A→B CCW sweep을 [0, 2π)로 정규화
    theta = (((bAngle - START_ANGLE) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // 단일 핵심 관계: 중심각 θ → 활꼴 높이 h = r(1 − cos(θ/2))
    sag = Circlex.sagitta(circle, theta);

    // B를 원 둘레 위로 투영 (핸들 dot을 원 위에 그린다)
    bx = cx + R * Math.cos(bAngle);
    by = cy + R * Math.sin(bAngle);

    // 호 정점 apex: 이등분각(START + θ/2) 방향 원 위 점
    const midAngle = START_ANGLE + theta / 2;
    apexX = cx + R * Math.cos(midAngle);
    apexY = cy + R * Math.sin(midAngle);

    // 현 AB 중점 M: 이등분 방향으로 C에서 R·cos(θ/2)만큼 떨어진 점과 일치한다
    mx = (ax + bx) / 2;
    my = (ay + by) / 2;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // B 핸들 근처를 누르면 잡는다 (B가 유일한 조작 대상)
    grabbed = Math.hypot(p.x - bx, p.y - by) <= HANDLE_R + 16;
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
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    // 고정 원 둘레
    g.circle(cx, cy, R).stroke({ color: CIRCLE_COLOR, width: 1 });

    // A→B 호 강조: θ를 샘플링해 lineTo (순수 drawing, vectra 호출 없음)
    g.moveTo(ax, ay);
    for (let i = 1; i <= ARC_STEPS; i++) {
      const a = START_ANGLE + theta * (i / ARC_STEPS);
      g.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
    }
    g.stroke({ color: ARC_COLOR, width: 2 });

    // 현 AB: 호의 양 끝을 잇는 직선 (sagitta는 이 현에서 호까지의 높이)
    g.moveTo(ax, ay).lineTo(bx, by).stroke({ color: CHORD_COLOR, width: 1 });

    // sagitta 선분 M→apex: 길이 = R(1 − cos(θ/2)) = h. 이 선분 길이가 곧 반환된 sagitta다
    g.moveTo(mx, my).lineTo(apexX, apexY).stroke({ color: SAGITTA_COLOR, width: 3 });

    // 호 시작점 A (고정)
    g.circle(ax, ay, 5).fill({ color: START_COLOR });
    // 호 정점 apex
    g.circle(apexX, apexY, 5).fill({ color: APEX_COLOR });

    // 호 끝점 핸들 B (주 조작 대상, 원 둘레 위)
    g.circle(bx, by, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    // diagnostics: 단일 sagitta 관계를 입력 각·출력 높이·반지름으로 읽는다 (3개)
    label.text = [
      `theta  : ${((theta * 180) / Math.PI).toFixed(1)}°   drag B`,
      `sagitta: ${sag.toFixed(1)}`,
      `R      : ${R}`,
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
