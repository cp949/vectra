/**
 * Angle Directed Sweep
 *
 * 화면 중앙 고정 피벗에 고정 시작 ray(from)를 두고, 끝 ray 핸들 1개를 피벗 둘레로 drag하면
 * `sweepAngle(from, to, 'ccw')`가 from에서 to까지 CCW 방향으로 휩쓴 회전량 s를 `[0, 2π)`로 매
 * 프레임 다시 구해 그 크기만큼 wedge를 채운다. sweep이 반원(π)을 넘으면 `isReflexSweep`가 major
 * arc로 판정해 강조 색으로 바뀐다. "방향이 정해진 회전량을 재고 major/minor arc로 가른다"(directed
 * sweep) 작업 흐름을 보인다.
 *
 * - Anglex.sweepAngle: from에서 to까지 지정 방향(여기선 'ccw')의 sweep 크기를 `[0, 2π)` number로
 *   직접 반환한다. 채운 wedge의 각폭이 곧 이 값이다. scalar 반환이라 *Into companion이 없어 그대로
 *   호출한다. 화면의 유일한 핵심 관계.
 * - Anglex.isReflexSweep: 같은 (from, to, 'ccw') sweep이 π를 초과하는지(major arc) boolean으로
 *   반환한다. wedge 강조 색을 가르는 같은 관계의 분해 판정이다(두 번째 관계 아님).
 *
 * 채운 wedge·호 stroke·시작/끝 ray·핸들은 모두 같은 sweep 출력의 분해 표시이지 별도 관계가 아니다.
 */

import * as Anglex from '@cp949/vectra/angle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const DIAL_COLOR = 0x334155; // dial 바깥 원: 어두운 회청색
const START_COLOR = 0x64748b; // 고정 시작 ray(from): 회색
const END_COLOR = 0xf59e0b; // 끝 ray(to = 핸들 방향): 호박색
const WEDGE_MINOR = 0x38bdf8; // minor arc(sweep <= π) wedge fill: 하늘색
const WEDGE_REFLEX = 0xf472b6; // major arc(reflex, sweep > π) wedge fill: 분홍
const HANDLE_COLOR = 0xe2e8f0; // 끝각 핸들(주 조작 대상): 밝은 회백
const PIVOT_COLOR = 0x64748b; // 피벗 점(sweep 중심): 회색

const FROM_ANGLE = (-30 * Math.PI) / 180; // 고정 시작각(math 기준 -30°, 화면에선 우상향)
const DIAL_R = 165; // dial·wedge 반지름 (px)
const RAY_LEN = 150; // ray 길이 (px)
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

  // 피벗(sweep 중심)은 화면 중앙에 고정. 시작 ray와 끝 ray의 공통 꼭짓점이다
  const pivot: XY = { x: size.width / 2, y: size.height / 2 };

  // 끝각 ray 핸들: 유일한 drag 대상. 초기 각 100°(from으로부터 CCW로 130° sweep)에 둔다
  const handle: XY = {
    x: pivot.x + 130 * Math.cos((100 * Math.PI) / 180),
    y: pivot.y + 130 * Math.sin((100 * Math.PI) / 180),
  };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let toAngle = 0; // 끝각 = 피벗 → 핸들 방향 (atan2, 항상 finite)
  let sweep = 0; // 핵심 출력: from → to CCW sweep 크기 [0, 2π)
  let reflex = false; // 핵심 출력: sweep이 π 초과(major arc)인지

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp. 각도만 쓰므로 피벗과의 거리는 sweep 결과에 영향이 없다(항상 finite)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 끝각 = 피벗 → 핸들 방향. atan2라 항상 (-π, π] 범위의 finite 값
    toAngle = Math.atan2(handle.y - pivot.y, handle.x - pivot.x);

    // 단일 핵심 관계: 고정 from → to CCW sweep 크기. positiveModulo라 항상 [0, 2π)
    sweep = Anglex.sweepAngle(FROM_ANGLE, toAngle, 'ccw');
    // 같은 sweep이 반원(π)을 넘는 major arc인지 판정 (강조 색 분해)
    reflex = Anglex.isReflexSweep(FROM_ANGLE, toAngle, 'ccw');
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 핸들 근처를 누르면 잡는다 (끝각 ray가 유일한 조작 대상)
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

  const toDeg = (r: number): number => (r * 180) / Math.PI;

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    const px = pivot.x;
    const py = pivot.y;

    // dial 바깥 원(고정 기준 둘레)
    g.circle(px, py, DIAL_R).stroke({ color: DIAL_COLOR, width: 1 });

    // 채운 sweep wedge: from에서 sweep 크기만큼 호를 채운다. pixi arc는 증가 각 방향으로 그리므로
    // arc(from, from+sweep) span이 정확히 sweep과 같고, 끝점 각이 to(=핸들 방향)와 일치한다.
    // reflex(π 초과)면 강조 색으로 minor/major arc를 가른다
    const wedgeColor = reflex ? WEDGE_REFLEX : WEDGE_MINOR;
    g.moveTo(px, py)
      .arc(px, py, DIAL_R, FROM_ANGLE, FROM_ANGLE + sweep)
      .lineTo(px, py)
      .fill({ color: wedgeColor, alpha: 0.28 });

    // sweep 호 stroke: 채운 wedge 바깥 경계를 또렷이 표시 (같은 sweep의 분해)
    g.arc(px, py, DIAL_R, FROM_ANGLE, FROM_ANGLE + sweep).stroke({ color: wedgeColor, width: 3 });

    // 고정 시작 ray(from): sweep의 기준선 (조작 대상 아님)
    g.moveTo(px, py)
      .lineTo(px + RAY_LEN * Math.cos(FROM_ANGLE), py + RAY_LEN * Math.sin(FROM_ANGLE))
      .stroke({ color: START_COLOR, width: 2 });

    // 끝 ray(to = 핸들 방향): sweep 끝선. 항상 채운 wedge의 끝 경계와 일치한다
    g.moveTo(px, py)
      .lineTo(px + RAY_LEN * Math.cos(toAngle), py + RAY_LEN * Math.sin(toAngle))
      .stroke({ color: END_COLOR, width: 3 });

    // 끝각 핸들(주 조작 대상): grab 시 크게
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: HANDLE_COLOR });
    // 피벗 점(sweep 중심)
    g.circle(px, py, 4).fill({ color: PIVOT_COLOR });

    label.text = [
      `sweep    : ${toDeg(sweep).toFixed(1).padStart(6)} deg   drag end ray`,
      `reflex   : ${reflex ? 'yes (major arc)' : 'no  (minor arc)'}`,
      `direction: ccw`,
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
