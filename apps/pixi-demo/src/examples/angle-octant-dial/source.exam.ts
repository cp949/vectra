/**
 * Angle Octant Dial
 *
 * 화면 중앙 고정 피벗 둘레에 8개 45° 부채꼴(octant)을 깔고, 입력 needle 핸들 1개를 피벗 둘레로
 * drag하면 `octant(angle)`이 그 방향이 어느 등분면 bucket(0..7)에 속하는지 매 프레임 분류해
 * 활성 부채꼴 하나만 밝게 강조한다. needle은 항상 강조 부채꼴 안에 들어가, "방향을 8등분면 중
 * 하나로 분류한다"(direction sector classification) 작업 흐름을 보인다.
 *
 * - Anglex.octant: 입력 각을 `wrapRadiansPositive` 기준 `[k·π/4, (k+1)·π/4)` half-open bucket
 *   번호(0..7)로 분류해 number로 직접 반환한다. 경계각은 다음 bucket에 포함되고 `2π` equivalent는
 *   `0`이다. scalar 반환이라 *Into companion이 없으므로 그대로 호출한다. 화면의 유일한 핵심 관계.
 *
 * 8개 부채꼴 fill·경계 spoke·needle은 모두 같은 octant 출력의 분해 표시이지 두 번째 관계가 아니다.
 */

import * as Anglex from '@cp949/vectra/angle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const DIAL_COLOR = 0x334155; // dial 바깥 원·경계 spoke: 어두운 회청색
const SECTOR_DIM = 0x1e293b; // 비활성 부채꼴 fill: faint
const SECTOR_HOT = 0x4ade80; // 활성 부채꼴 fill(현재 octant): 초록
const NEEDLE_COLOR = 0xf59e0b; // 입력 needle(현재 방향): 호박색
const HANDLE_COLOR = 0xe2e8f0; // 핸들(주 조작 대상): 밝은 회백
const PIVOT_COLOR = 0x64748b; // 피벗 점(분류 중심): 회색

const OCTANT_COUNT = 8; // 등분면 개수
const SECTOR_RAD = (Math.PI * 2) / OCTANT_COUNT; // 부채꼴 1개의 각폭 = 45°
const DIAL_R = 170; // dial·부채꼴 반지름 (px)
const NEEDLE_LEN = 150; // needle 길이 (px)
const HIT_RADIUS = 24; // 핸들 hit 반경 (px)
const MARGIN = 16; // 핸들 화면 clamp margin (px)

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

  // 피벗(분류 중심)은 화면 중앙에 고정 (모든 부채꼴과 needle의 중심)
  const pivot: XY = { x: size.width / 2, y: size.height / 2 };

  // 입력 needle 핸들: 유일한 drag 대상. 초기 각 30°(octant 0)에 둔다
  const handle: XY = {
    x: pivot.x + 120 * Math.cos((30 * Math.PI) / 180),
    y: pivot.y + 120 * Math.sin((30 * Math.PI) / 180),
  };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let angle = 0; // 입력각 = 피벗 → 핸들 방향 (atan2, 항상 finite)
  let idx = 0; // 핵심 출력: angle이 속한 octant bucket 번호 (0..7)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp. 각도만 쓰므로 피벗과의 거리는 분류 결과에 영향이 없다(항상 finite)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 입력각 = 피벗 → 핸들 방향. atan2라 항상 (-π, π] 범위의 finite 값
    angle = Math.atan2(handle.y - pivot.y, handle.x - pivot.x);

    // 단일 핵심 관계: 이 방향이 속한 8등분면 bucket 번호. half-open 분류라 항상 0..7
    idx = Anglex.octant(angle);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 핸들 근처를 누르면 잡는다 (입력 needle이 유일한 조작 대상)
    grabbed = Math.hypot(p.x - handle.x, p.y - handle.y) <= HIT_RADIUS;
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

  const fmt = (n: number): string => n.toFixed(1).padStart(7);
  const toDeg = (r: number): number => (r * 180) / Math.PI;

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    // 8개 부채꼴을 그린다. 부채꼴 k는 [k·45°, (k+1)·45°)이고 octant 함수와 같은 각 기준이라
    // 활성 부채꼴(idx)이 항상 needle을 포함한다 → "이 방향은 등분면 idx" 분류를 그대로 보임
    for (let k = 0; k < OCTANT_COUNT; k++) {
      const start = k * SECTOR_RAD;
      const end = start + SECTOR_RAD;
      const hot = k === idx; // 현재 octant 출력과 일치하는 부채꼴만 강조
      g.moveTo(pivot.x, pivot.y)
        .arc(pivot.x, pivot.y, DIAL_R, start, end)
        .lineTo(pivot.x, pivot.y)
        .fill({ color: hot ? SECTOR_HOT : SECTOR_DIM, alpha: hot ? 0.32 : 0.5 });
    }

    // 부채꼴 경계 spoke 8개(k·45°): bucket 분할선을 드러낸다
    for (let k = 0; k < OCTANT_COUNT; k++) {
      const a = k * SECTOR_RAD;
      g.moveTo(pivot.x, pivot.y)
        .lineTo(pivot.x + DIAL_R * Math.cos(a), pivot.y + DIAL_R * Math.sin(a))
        .stroke({ color: DIAL_COLOR, width: 1 });
    }

    // dial 바깥 원(고정 기준 둘레)
    g.circle(pivot.x, pivot.y, DIAL_R).stroke({ color: DIAL_COLOR, width: 1 });

    // 입력 needle(현재 방향): raw angle 방향으로 뻗어 강조 부채꼴 안에 놓인다
    const tipX = pivot.x + NEEDLE_LEN * Math.cos(angle);
    const tipY = pivot.y + NEEDLE_LEN * Math.sin(angle);
    g.moveTo(pivot.x, pivot.y).lineTo(tipX, tipY).stroke({ color: NEEDLE_COLOR, width: 3 });

    // 핸들 점(주 조작 대상): grab 시 크게
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: HANDLE_COLOR });
    // 피벗 점(분류 중심)
    g.circle(pivot.x, pivot.y, 4).fill({ color: PIVOT_COLOR });

    // 현재 octant의 bucket 경계를 도(degree)로 환산해 diagnostics range로 읽는다(inline 분해)
    const lo = idx * (360 / OCTANT_COUNT);
    const hi = lo + 360 / OCTANT_COUNT;

    label.text = [
      `angle : ${fmt(toDeg(angle))} deg   drag needle`,
      `octant: ${idx}`,
      `range : [${lo.toFixed(0)}, ${hi.toFixed(0)}) deg`,
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
