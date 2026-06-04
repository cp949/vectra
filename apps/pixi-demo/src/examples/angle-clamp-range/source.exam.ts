/**
 * Angle Clamp Range
 *
 * 화면 중앙 피벗 둘레의 handle 1개를 drag하면 clampAngle이 피벗→handle 방향의 raw 각을 고정 허용
 * 부채꼴 `[START, END]`(CCW 구간)로 clamp한 출력 각을 보인다. handle을 부채꼴 안에 두면 출력
 * needle이 입력을 그대로 따라가고(자유), 부채꼴 밖으로 끌면 출력 needle이 가장 가까운 경계(start
 * 또는 end)에 달라붙는다. turret/knob/joint의 min-max 회전 한계(rotation limit)와 같은 작업 흐름이다.
 *
 * - Angles.clampAngle: raw 각을 허용 CCW 구간으로 clamp한 출력 각을 돌려준다. scalar 반환이라
 *   *Into companion이 없어 그대로 쓴다. 화면의 유일한 핵심 관계.
 *
 * raw needle(faint)·output needle(bright)·허용 부채꼴·두 경계 ray·raw→output 당김 호는 모두 같은
 * clamp 관계의 분해 표시이지 두 번째 관계가 아니다(angle-snap-dial의 raw/snap needle 선례).
 */

import * as Angles from '@cp949/vectra/angle';

type XY = { x: number; y: number };

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

  // 피벗(회전 중심)은 화면 중앙에 고정 (needle과 허용 부채꼴의 중심)
  const pivot: XY = { x: size.width / 2, y: size.height / 2 };

  // 허용 회전 구간. clampAngle은 START에서 END까지 CCW(양의 radian 방향) inclusive 구간으로 clamp한다.
  // 고정 non-degenerate 구간이라 zero-length(START===END) 경계는 미발생.
  const START_DEG = -55;
  const END_DEG = 70;
  const START_RAD = (START_DEG * Math.PI) / 180;
  const END_RAD = (END_DEG * Math.PI) / 180;

  // needle 길이와 부채꼴 반지름
  const NEEDLE_LEN = 150;
  const DIAL_R = 170;

  // 입력 handle은 사용자가 끄는 유일한 주 대상. 초기 각도를 구간 밖(130°)에 둬 clamp를 바로 보인다
  const handle: XY = {
    x: pivot.x + 120 * Math.cos((130 * Math.PI) / 180),
    y: pivot.y + 120 * Math.sin((130 * Math.PI) / 180),
  };

  const HIT_RADIUS = 24;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(handle.x - p.x, handle.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // handle을 화면 안으로만 clamp. 각도만 쓰므로 피벗과의 거리는 결과에 영향이 없다(항상 finite raw)
    handle.x = Math.max(16, Math.min(size.width - 16, p.x));
    handle.y = Math.max(16, Math.min(size.height - 16, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1).padStart(7);

  // 피벗에서 각도 방향으로 길이 len 만큼 뻗은 점
  const tip = (angle: number, len: number): XY => ({
    x: pivot.x + len * Math.cos(angle),
    y: pivot.y + len * Math.sin(angle),
  });

  // 각을 (-π, π]로 접어 두 각의 최소 차이를 구한다 (inside/경계 판정용)
  const wrapToPi = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

  const render = (): void => {
    // raw 각 = 피벗 → handle 방향. atan2라 항상 (-π, π] 범위의 finite 값
    const raw = Math.atan2(handle.y - pivot.y, handle.x - pivot.x);

    // 핵심 호출: raw 각을 허용 CCW 구간 [START, END]로 clamp. 구간 안이면 raw 그대로, 밖이면 가까운 경계
    const out = Angles.clampAngle(raw, START_RAD, END_RAD);

    // 출력이 raw와 사실상 같으면 구간 안(자유), 다르면 어느 경계에 달라붙었는지 판정
    const isInside = Math.abs(wrapToPi(out - raw)) < 1e-9;
    const atStart = Math.abs(wrapToPi(out - START_RAD)) < 1e-9;
    const status = isInside ? 'inside' : atStart ? '-> start' : '-> end';

    const rawDeg = (raw * 180) / Math.PI;
    const outDeg = (out * 180) / Math.PI;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // dial 바깥 원(고정 기준)
    g.circle(pivot.x, pivot.y, DIAL_R).stroke({ color: 0x334155, width: 1 });

    // 허용 부채꼴(faint green): START→END CCW 구간. PIXI arc도 증가-각 방향이라 clampAngle 구간과 일치
    g.moveTo(pivot.x, pivot.y)
      .arc(pivot.x, pivot.y, DIAL_R, START_RAD, END_RAD)
      .lineTo(pivot.x, pivot.y)
      .fill({ color: 0x4ade80, alpha: 0.12 });

    // 두 경계 ray(start/end): 출력이 달라붙는 한계 위치를 보인다
    for (const edge of [START_RAD, END_RAD]) {
      const e = tip(edge, DIAL_R);
      g.moveTo(pivot.x, pivot.y).lineTo(e.x, e.y).stroke({ color: 0x4ade80, width: 1.5, alpha: 0.5 });
    }

    // raw needle(faint white): 사용자가 끄는 연속 입력 각도
    const rawEnd = tip(raw, NEEDLE_LEN);
    g.moveTo(pivot.x, pivot.y).lineTo(rawEnd.x, rawEnd.y).stroke({ color: 0x94a3b8, width: 1.5, alpha: 0.7 });

    // raw → out 당김 호. clamp가 입력을 경계까지 얼마나 당겼는지(같은 관계의 분해)를 보인다
    if (!isInside) {
      g.arc(pivot.x, pivot.y, NEEDLE_LEN - 30, Math.min(raw, out), Math.max(raw, out)).stroke({
        color: 0xf59e0b,
        width: 2,
        alpha: 0.8,
      });
    }

    // output needle(bright green): clampAngle 결과 각도
    const outEnd = tip(out, NEEDLE_LEN);
    g.moveTo(pivot.x, pivot.y).lineTo(outEnd.x, outEnd.y).stroke({ color: 0x4ade80, width: 3 });
    g.circle(outEnd.x, outEnd.y, 5).fill({ color: 0x4ade80 });

    // handle 점(유일 drag 대상)
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: 0xe2e8f0 });
    // 피벗 점(회전 중심)
    g.circle(pivot.x, pivot.y, 4).fill({ color: 0x64748b });

    label.text = [`input : ${fmt(rawDeg)} deg   drag handle`, `output: ${fmt(outDeg)} deg`, `status: ${status}`].join(
      '\n'
    );
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
