/**
 * Angle Snap Dial
 *
 * 화면 중앙 피벗 둘레의 handle 1개를 drag하면 snapAngle이 피벗→handle 방향의 연속 각도를 가장
 * 가까운 step 눈금(여기선 15°)으로 snap한 needle을 보인다. handle을 부드럽게 돌려도 snap needle은
 * 15° 눈금 사이를 건너뛰며 딸깍 떨어지듯 움직인다. 에디터에서 shift를 누른 채 회전할 때의 각도
 * 스냅과 같은 작업 흐름이다.
 *
 * - EditorGeometry.snapAngle: 연속 raw 각도(radian)를 STEP 단위로 snap한 각도를 돌려준다.
 *   scalar 반환이라 *Into companion이 없어 그대로 쓴다. 화면의 유일한 핵심 관계.
 *
 * raw needle(faint)·snap needle(bright)·둘레 step 눈금·두 needle 사이 호는 모두 같은 snap 관계의
 * 분해 표시이지 두 번째 관계가 아니다.
 */

import * as EditorGeometry from '@cp949/vectra/editor-geometry';

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

  // 피벗(회전 중심)은 화면 중앙에 고정 (두 needle과 눈금 dial의 중심)
  const pivot: XY = { x: size.width / 2, y: size.height / 2 };

  // snap 간격. snapAngle precondition(finite, !=0)을 항상 만족하는 고정 양수 상수.
  // 15°는 360°를 24등분(정수)이라 ±180° wrap에서 눈금이 일관되게 닫힌다.
  const STEP_DEG = 15;
  const STEP_RAD = (STEP_DEG * Math.PI) / 180;

  // needle 길이와 눈금 dial 반지름
  const NEEDLE_LEN = 150;
  const DIAL_R = 170;

  // angle handle은 사용자가 끄는 유일한 주 대상. 초기 각도를 눈금 사이(≈37°)로 둬 snap을 바로 보인다
  const handle: XY = {
    x: pivot.x + 120 * Math.cos((37 * Math.PI) / 180),
    y: pivot.y + 120 * Math.sin((37 * Math.PI) / 180),
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
    // handle을 화면 안으로만 clamp. 각도만 쓰므로 피벗과의 거리는 결과에 영향이 없다
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

  const render = (): void => {
    // raw 각도 = 피벗 → handle 방향. atan2라 항상 (-π, π] 범위의 finite 값
    const raw = Math.atan2(handle.y - pivot.y, handle.x - pivot.x);

    // 핵심 호출: 연속 raw 각도를 STEP 단위 눈금으로 snap. tie(정확히 중간)는 +방향으로 올림
    const snapped = EditorGeometry.snapAngle(raw, STEP_RAD);

    const rawDeg = (raw * 180) / Math.PI;
    const snappedDeg = (snapped * 180) / Math.PI;
    // snap된 눈금을 강조하려고 [0,360) 정규화 각도로 환산
    const snappedNorm = ((snappedDeg % 360) + 360) % 360;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // dial 바깥 원(고정 기준)
    g.circle(pivot.x, pivot.y, DIAL_R).stroke({ color: 0x334155, width: 1 });

    // step 눈금 24개. snap된 눈금만 밝게 강조해 needle이 어느 눈금에 떨어졌는지 보인다
    for (let deg = 0; deg < 360; deg += STEP_DEG) {
      const a = (deg * Math.PI) / 180;
      // 현재 눈금이 snap 결과와 같은 방향인지 (wrap 고려 최소 각차 < 0.5°)
      const isSnapped = Math.abs(((deg - snappedNorm + 180) % 360) - 180) < 0.5;
      const inner = tip(a, isSnapped ? DIAL_R - 22 : DIAL_R - 10);
      const outer = tip(a, DIAL_R);
      g.moveTo(inner.x, inner.y)
        .lineTo(outer.x, outer.y)
        .stroke({ color: isSnapped ? 0x4ade80 : 0x475569, width: isSnapped ? 3 : 1 });
    }

    // raw needle(faint white): 사용자가 끄는 연속 입력 각도
    const rawEnd = tip(raw, NEEDLE_LEN);
    g.moveTo(pivot.x, pivot.y).lineTo(rawEnd.x, rawEnd.y).stroke({ color: 0x94a3b8, width: 1.5, alpha: 0.7 });

    // raw → snapped 사이 호. snap이 입력을 얼마나 당겼는지(같은 관계의 분해)를 보인다
    g.arc(pivot.x, pivot.y, NEEDLE_LEN - 30, Math.min(raw, snapped), Math.max(raw, snapped)).stroke({
      color: 0xf59e0b,
      width: 2,
      alpha: 0.8,
    });

    // snap needle(bright green): snapAngle 결과 각도
    const snapEnd = tip(snapped, NEEDLE_LEN);
    g.moveTo(pivot.x, pivot.y).lineTo(snapEnd.x, snapEnd.y).stroke({ color: 0x4ade80, width: 3 });
    g.circle(snapEnd.x, snapEnd.y, 5).fill({ color: 0x4ade80 });

    // handle 점(유일 drag 대상)
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: 0xe2e8f0 });
    // 피벗 점(회전 중심)
    g.circle(pivot.x, pivot.y, 4).fill({ color: 0x64748b });

    label.text = [
      `raw    : ${fmt(rawDeg)} deg   drag handle`,
      `snapped: ${fmt(snappedDeg)} deg`,
      `step   : ${fmt(STEP_DEG)} deg`,
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
