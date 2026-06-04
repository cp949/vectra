/**
 * Angle Bisect Shortest
 *
 * 화면 중앙 고정 피벗에 고정 기준 ray A와 입력 ray B 핸들 1개를 두고, B를 피벗 둘레로 drag하면
 * `bisectAngle(A, b)`가 A와 b 사이의 **더 짧은 호**를 정확히 절반으로 가르는 이등분 각 m을 매
 * 프레임 다시 계산한다. B를 어느 쪽으로 끌든 이등분선은 항상 두 ray 사이의 짧은 호 한가운데에
 * 놓여, "두 방향 사이의 (최단 경로) 각 이등분선을 구한다"는 classic angle bisector 작업 흐름을
 * 보인다.
 *
 * - Anglex.bisectAngle: (A, b) 두 각의 shortest signed delta 절반을 더한 이등분 각을 number로 직접
 *   반환한다(`A + angleDelta(A, b) / 2`, 결과를 wrap하지 않음). scalar 반환이라 *Into companion이
 *   없으므로 그대로 호출한다. 화면의 유일한 핵심 관계.
 *
 * 기준 ray A·입력 ray B·bisector needle·짧은 호 wedge·두 절반 호는 모두 같은 bisectAngle 출력의
 * 분해 표시이지 두 번째 관계가 아니다(vec-midpoint의 등분 절반 선례).
 */

import * as Anglex from '@cp949/vectra/angle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const DIAL_COLOR = 0x334155; // dial 바깥 원(고정 기준): 어두운 회청색
const WEDGE_COLOR = 0x4ade80; // 짧은 호 wedge·두 절반 호: 초록(이등분 대상 호)
const REF_COLOR = 0x64748b; // 기준 ray A(faint): 회색
const BISECT_COLOR = 0xf59e0b; // bisector needle m(bright): 호박색
const HANDLE_COLOR = 0xe2e8f0; // 입력 ray B 핸들(주 조작 대상): 밝은 회백
const PIVOT_COLOR = 0x64748b; // 피벗 점(회전 중심): 회색

const A_RAD = 0; // 고정 기준각 A: 0°(동쪽). 고정 finite라 bisectAngle RangeError 미발생
const DIAL_R = 170; // dial·wedge 반지름 (px)
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

  // 피벗(회전 중심)은 화면 중앙에 고정 (모든 ray와 호의 중심)
  const pivot: XY = { x: size.width / 2, y: size.height / 2 };

  // 입력 ray B 핸들: 유일한 drag 대상. 초기 각을 110°에 둬 이등분선(55°)을 바로 보인다
  const handle: XY = {
    x: pivot.x + 120 * Math.cos((110 * Math.PI) / 180),
    y: pivot.y + 120 * Math.sin((110 * Math.PI) / 180),
  };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let b = 0; // 입력각 = 피벗 → 핸들 방향 (atan2, 항상 finite)
  let m = 0; // 핵심 출력: A와 b 사이 더 짧은 호의 이등분 각 (bisectAngle)
  let delta = 0; // 같은 출력의 분해: shortest signed sweep = 2 * (m - A) (= angleDelta(A, b))

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp. 각도만 쓰므로 피벗과의 거리는 결과에 영향이 없다(항상 finite b)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 입력각 b = 피벗 → 핸들 방향. atan2라 항상 (-π, π] 범위의 finite 값
    b = Math.atan2(handle.y - pivot.y, handle.x - pivot.x);

    // 단일 핵심 관계: A와 b 사이 더 짧은 호의 이등분 각 (결과를 wrap하지 않음)
    m = Anglex.bisectAngle(A_RAD, b);

    // 같은 출력의 inline 분해: shortest signed delta = 2 * (m - A). bisectAngle 항등이라
    // angleDelta 재호출 없이 도출한다. |delta| = π(antipodal)면 angleDelta 정책상 -π로 감긴다
    delta = 2 * (m - A_RAD);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 핸들 근처를 누르면 잡는다 (입력 ray B가 유일한 조작 대상)
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

  // 피벗에서 각도 방향으로 길이 len 만큼 뻗은 점
  const tip = (angle: number, len: number): XY => ({
    x: pivot.x + len * Math.cos(angle),
    y: pivot.y + len * Math.sin(angle),
  });

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    // dial 바깥 원(고정 기준)
    g.circle(pivot.x, pivot.y, DIAL_R).stroke({ color: DIAL_COLOR, width: 1 });

    // 이등분 대상인 더 짧은 호 wedge: A에서 delta 방향으로만 채운다(짧은 쪽). delta<0이면
    // 반대 방향으로 sweep해 항상 |delta| ≤ π 짧은 호만 덮는다 → 이등분선이 이 호를 절반으로 가름
    g.moveTo(pivot.x, pivot.y)
      .arc(pivot.x, pivot.y, DIAL_R, A_RAD, A_RAD + delta, delta < 0)
      .lineTo(pivot.x, pivot.y)
      .fill({ color: WEDGE_COLOR, alpha: 0.12 });

    // 두 절반 호(A→m, m→b)를 같은 색·다른 반지름으로 그려 |A→m| = |m→b|를 드러낸다
    g.arc(pivot.x, pivot.y, NEEDLE_LEN - 26, A_RAD, m, delta < 0).stroke({
      color: WEDGE_COLOR,
      width: 2,
      alpha: 0.8,
    });
    g.arc(pivot.x, pivot.y, NEEDLE_LEN - 44, m, b, delta < 0).stroke({
      color: WEDGE_COLOR,
      width: 2,
      alpha: 0.8,
    });

    // 기준 ray A needle(faint): 이등분의 한쪽 기준 방향
    const aEnd = tip(A_RAD, NEEDLE_LEN);
    g.moveTo(pivot.x, pivot.y).lineTo(aEnd.x, aEnd.y).stroke({ color: REF_COLOR, width: 1.5, alpha: 0.8 });

    // 입력 ray B needle(drag 대상): 사용자가 끄는 두 번째 방향
    const bEnd = tip(b, NEEDLE_LEN);
    g.moveTo(pivot.x, pivot.y).lineTo(bEnd.x, bEnd.y).stroke({ color: HANDLE_COLOR, width: 1.5, alpha: 0.9 });

    // bisector needle m(bright): bisectAngle 결과 = 짧은 호의 한가운데
    const mEnd = tip(m, NEEDLE_LEN);
    g.moveTo(pivot.x, pivot.y).lineTo(mEnd.x, mEnd.y).stroke({ color: BISECT_COLOR, width: 3 });
    g.circle(mEnd.x, mEnd.y, 5).fill({ color: BISECT_COLOR });

    // 핸들 점(주 조작 대상): grab 시 크게
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: HANDLE_COLOR });
    // 피벗 점(회전 중심)
    g.circle(pivot.x, pivot.y, 4).fill({ color: PIVOT_COLOR });

    const toDeg = (r: number): number => (r * 180) / Math.PI;

    label.text = [
      `input : ${fmt(toDeg(b))} deg   drag handle`,
      `bisect: ${fmt(toDeg(m))} deg`,
      `half  : ${fmt(Math.abs(toDeg(delta)) / 2)} deg`,
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
