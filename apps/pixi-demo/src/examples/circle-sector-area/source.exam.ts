/**
 * Circle Sector Area
 *
 * 화면 고정 원(center C + 반지름 R)과 고정 부채꼴 시작 반지름을 두고, 끝 반지름 핸들 B 1개를 원
 * 둘레로 drag하면 `sectorArea(circle, θ)`가 두 반지름과 호가 둘러싼 부채꼴(파이 조각)의 넓이
 * A = ½·r²·|θ|를 매 drag마다 다시 구한다. B를 옮기면 중심각 θ가 커지거나 작아지고 채워진 부채꼴
 * 영역이 함께 자라/줄어, "두 반지름 사이 호가 감싼 영역의 넓이를 구한다"(circular sector area)는
 * 작업 흐름을 보인다. 채워진 wedge 자체가 반환된 넓이 A의 영역 표시다.
 *
 * - Circlex.sectorArea: 중심각 θ에 대응하는 부채꼴 넓이 scalar A를 반환한다. 단일 핵심 관계
 *   θ → A(=½·r²·|θ|)의 출력이다. number를 직접 반환해 `*Into` companion이 없으므로 그대로
 *   호출한다(out-buffer scaffold 미사용).
 *
 * θ°·area·fill(% = θ/2π)은 같은 sector 관계를 입력 각·출력 넓이·disk 대비 비율로 읽은 분해
 * diagnostics이고, 채워진 wedge·두 반지름·호도 같은 단일 관계의 분해 표시다(두 번째 관계 아님).
 */

import * as Circlex from '@cp949/vectra/circle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const CIRCLE_COLOR = 0x334155; // 고정 원 둘레: 어두운 회청색
const SECTOR_FILL = 0x38bdf8; // 부채꼴 채움(핵심 출력 넓이): 하늘색
const RADIUS_COLOR = 0x94a3b8; // 두 반지름 경계선: 밝은 회색
const ARC_COLOR = 0xa3e635; // A→B 호 경계 강조: 연두
const START_COLOR = 0x64748b; // 고정 시작 반지름 끝점: 회색
const CENTER_COLOR = 0xfbbf24; // 원 중심 C: 호박색
const HANDLE_COLOR = 0xa78bfa; // 끝 반지름 핸들 B (주 조작 대상): 보라
const HANDLE_R = 7; // B 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const START_ANGLE = -Math.PI / 2; // 고정 부채꼴 시작 각 (원 위쪽). 조작 대상 아님
const ARC_STEPS = 96; // 부채꼴 호 그리기 샘플 수 (순수 drawing)

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

  // 고정 부채꼴 시작 반지름 끝점 (원 위 START_ANGLE 위치)
  const sx = cx + R * Math.cos(START_ANGLE);
  const sy = cy + R * Math.sin(START_ANGLE);

  // 끝 반지름 핸들 B: 유일한 drag 대상. pointer 방향각을 원 둘레로 투영해 결정한다
  const handle: XY = { x: cx + R * Math.cos(1.6), y: cy + R * Math.sin(1.6) };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 vectra 할당 없음)
  let theta = 0; // 중심각 θ (시작→B CCW sweep, [0, 2π))
  let area = 0; // 부채꼴 넓이 A = sectorArea(circle, θ)
  let bx = handle.x; // 원 둘레 위 끝 반지름 점 B
  let by = handle.y;

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
    // pointer 방향각을 원 둘레로 투영해 끝 반지름 점 B를 얻는다 (radial 핸들이 부채꼴 끝
    // 반지름을 정의하므로 from-angle-scalar-input-not-point 함정 아님: θ는 부채꼴 sweep이라
    // directionTo와 동치가 아니다)
    const bAngle = Math.atan2(handle.y - cy, handle.x - cx);
    // 중심각 θ = 시작→B CCW sweep을 [0, 2π)로 정규화
    theta = (((bAngle - START_ANGLE) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // 단일 핵심 관계: 중심각 θ → 부채꼴 넓이 A = ½·r²·θ
    area = Circlex.sectorArea(circle, theta);

    // B를 원 둘레 위로 투영 (핸들 dot을 원 위에 그린다)
    bx = cx + R * Math.cos(bAngle);
    by = cy + R * Math.sin(bAngle);
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

    // 채워진 부채꼴 wedge: C → 시작 반지름 → 호 샘플 → C. 이 영역이 곧 반환된 넓이 A다
    g.moveTo(cx, cy);
    g.lineTo(sx, sy);
    for (let i = 1; i <= ARC_STEPS; i++) {
      const a = START_ANGLE + theta * (i / ARC_STEPS);
      g.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
    }
    g.lineTo(cx, cy);
    g.fill({ color: SECTOR_FILL, alpha: 0.28 });

    // A→B 호 경계 강조 (순수 drawing, vectra 호출 없음)
    g.moveTo(sx, sy);
    for (let i = 1; i <= ARC_STEPS; i++) {
      const a = START_ANGLE + theta * (i / ARC_STEPS);
      g.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
    }
    g.stroke({ color: ARC_COLOR, width: 2 });

    // 두 반지름 경계: C→시작점, C→B (부채꼴을 가두는 두 변)
    g.moveTo(cx, cy).lineTo(sx, sy).stroke({ color: RADIUS_COLOR, width: 1 });
    g.moveTo(cx, cy).lineTo(bx, by).stroke({ color: RADIUS_COLOR, width: 1 });

    // 부채꼴 시작 반지름 끝점 (고정)
    g.circle(sx, sy, 5).fill({ color: START_COLOR });
    // 원 중심 C
    g.circle(cx, cy, 5).fill({ color: CENTER_COLOR });

    // 끝 반지름 핸들 B (주 조작 대상, 원 둘레 위)
    g.circle(bx, by, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    // diagnostics: 단일 sector 관계를 입력 각·출력 넓이·disk 대비 비율로 읽는다 (3개)
    // fill%는 θ/2π inline 분해라 disk-area API를 끌어오지 않는다 (두 번째 관계 아님)
    label.text = [
      `theta: ${((theta * 180) / Math.PI).toFixed(1)}°   drag B`,
      `area : ${area.toFixed(0)}`,
      `fill : ${((theta / (2 * Math.PI)) * 100).toFixed(1)}%`,
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
