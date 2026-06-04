/**
 * Circle Tank Fill
 *
 * 화면 고정 원(원통 탱크 단면)에 수위 선 1개를 두고, 그 선을 위아래로 drag하면 수면 아래 잠긴
 * 활꼴(circular segment) 단면적을 매 drag마다 `segmentArea(circle, θ)`로 다시 구한다. 수위를
 * 올리면 잠긴 중심각 θ가 커지고 채워진 영역과 단면적이 함께 자라, "수평 원통 탱크/파이프 단면이
 * 수위에 따라 얼마나 채워지는가"(circular segment area)라는 작업 흐름을 보인다. 채워진 영역 자체가
 * 반환된 단면적의 영역 표시다.
 *
 * - Circlex.segmentArea: 잠긴 호의 중심각 θ에 대응하는 활꼴 단면적 A = ½·r²·(|θ|−sin|θ|)를
 *   반환한다. 단일 핵심 관계 수위 → θ → A의 출력이다. number를 직접 반환해 `*Into` companion이
 *   없으므로 그대로 호출한다(out-buffer scaffold 미사용).
 * - Circlex.area: disk 전체 넓이 πr². 채움 비율(A / πr²) 분모로만 쓴다. 같은 단면적 관계를 비율로
 *   읽은 분해이지 두 번째 관계가 아니다.
 *
 * depth·area·fill(%)은 같은 활꼴 단면적 관계를 입력 수위·출력 넓이·disk 대비 비율로 읽은 분해
 * diagnostics다(두 번째 관계 아님).
 */

import * as Circlex from '@cp949/vectra/circle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const TANK_COLOR = 0x334155; // 탱크 둘레: 어두운 회청색
const WATER_COLOR = 0x38bdf8; // 잠긴 활꼴 영역(핵심 출력): 하늘색
const SURFACE_COLOR = 0x7dd3fc; // 수면 선: 밝은 하늘색
const HANDLE_COLOR = 0xa78bfa; // 수위 핸들(주 조작 대상): 보라
const HANDLE_R = 7; // 수위 핸들 반지름 (px)
const GRAB_PAD = 18; // 핸들 grab 허용 여유 (px)
const ARC_STEPS = 96; // 잠긴 호 fill 샘플 수 (순수 drawing)

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

  // 고정 원: 원통 탱크의 원형 단면. center C + 반지름 R. 조작 대상이 아니다
  const cx = size.width / 2;
  const cy = size.height / 2;
  const R = 150;
  const circle = { center: { x: cx, y: cy }, radius: R };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 vectra 할당 없음)
  let level = cy + R * 0.35; // 수면의 화면 y. 시작 수위는 중심보다 약간 아래
  let theta = 0; // 잠긴 호의 중심각 θ
  let wet = 0; // 잠긴 활꼴 단면적 A = segmentArea(circle, θ)
  let pct = 0; // 채움 비율 A / πr²
  let alpha = 0; // 수면 현의 param 각 (fill 호 시작각)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const rebuild = (): void => {
    // 수위 선을 탱크 세로 범위 [cy−R, cy+R] 안으로 clamp → 항상 finite
    level = Math.max(cy - R, Math.min(cy + R, level));

    // 바닥(cy+R)에서의 수위 깊이 d ∈ [0, 2R]
    const d = cy + R - level;
    // 중심에서 수면까지의 부호 거리 / R. d=0 → 1, d=R → 0, d=2R → -1
    const s0 = Math.max(-1, Math.min(1, (R - d) / R));

    // 잠긴 호의 중심각 θ = 2·acos(s0) ∈ [0, 2π].
    // segmentArea는 |θ| 기준이고 θ>π에서 major segment를 정상 반환하므로 절반 초과 수위도
    // 분기 없이 맞다 (d>R → θ>π).
    theta = 2 * Math.acos(s0);

    // 단일 핵심 관계: 수위 → θ → 잠긴 활꼴 단면적 A
    wet = Circlex.segmentArea(circle, theta);
    // 같은 관계를 disk 대비 비율로 읽은 분해 (segmentArea가 분자, area가 분모)
    pct = wet / Circlex.area(circle);

    // 수면 현의 param 각. fill은 alpha → (π − alpha)까지의 호 (수면 아래쪽)
    alpha = Math.asin(s0);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 수면 선 근처를 누르면 잡는다 (수위 선이 유일한 조작 대상)
    grabbed = Math.abs(p.y - level) <= HANDLE_R + GRAB_PAD;
    if (grabbed) {
      level = p.y;
      rebuild();
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    level = getCanvasXY(e).y;
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

    // 잠긴 활꼴 영역 fill: alpha → (π − alpha) 호를 샘플 (순수 drawing, vectra 호출 없음).
    // 닫는 변이 수면 현과 일치하므로 별도 chord lineTo 없이 poly가 활꼴이 된다.
    const sweep = Math.PI - 2 * alpha;
    if (sweep > 1e-6) {
      g.moveTo(cx + R * Math.cos(alpha), cy + R * Math.sin(alpha));
      for (let i = 1; i <= ARC_STEPS; i++) {
        const a = alpha + sweep * (i / ARC_STEPS);
        g.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
      }
      g.fill({ color: WATER_COLOR, alpha: 0.45 });
    }

    // 탱크 둘레
    g.circle(cx, cy, R).stroke({ color: TANK_COLOR, width: 2 });

    // 수면 선: 탱크 폭에 걸친 수평선 (현). 렌더링만, 폭을 vectra로 계산하지 않는다
    const half = R * Math.cos(alpha); // = √(R² − (level−cy)²)
    g.moveTo(cx - half, level)
      .lineTo(cx + half, level)
      .stroke({ color: SURFACE_COLOR, width: 2 });

    // 수위 핸들 (주 조작 대상, 수면 선 좌측 끝)
    g.circle(cx - half, level, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    // diagnostics: 단일 활꼴 단면적 관계를 입력 수위·출력 넓이·비율로 읽는다 (3개)
    const depth = cy + R - level;
    label.text = [
      `depth: ${depth.toFixed(1)} px   drag ↕`,
      `area : ${wet.toFixed(0)} px²`,
      `fill : ${(pct * 100).toFixed(1)} %`,
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
