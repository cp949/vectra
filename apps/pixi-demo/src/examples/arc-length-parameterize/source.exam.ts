/**
 * Arc Length Parameterize
 *
 * 고정 타원 호 위에서 등거리(등호장) marker가 등속으로 이동한다. ratio r은 ticker가 0↔1로
 * 등속 왕복시키지만, 타원에서는 같은 t 간격이 같은 호 길이가 아니므로 arcTAtLength로 거리→t를
 * 거쳐야 marker가 등속(등호장)으로 걷는다. 오른쪽 aspect knob 1개로 ry를 바꿔 원(ry=rx, t=ratio
 * 선형)↔타원(ry<rx, t≠ratio 비선형)을 오가며, 등거리 ghost dot이 등각이 아닌 등호장 위치에
 * 분포함을 보인다. ratio 대비 t의 차이가 비선형성의 수치 증거다.
 *
 * - Curves.arcTAtLength: arc length 거리(=ratio×total)를 호 파라미터 t로 역매핑한다(중심 관계).
 *   animated marker와 등거리 ghost dot 모두 이 함수로 만든다.
 * - Curves.arcPointAtTInto: 파라미터 t 위치의 호 위 point를 out에 기록한다. marker·ghost·호
 *   곡선 stroke 렌더에 재사용 buffer로 쓴다.
 * - Curves.arcLengthAtT: 호 전체 길이 = arcLengthAtT(arc, 1). ratio→거리 환산과 diagnostics에 쓴다.
 */

import * as Curves from '@cp949/vectra/curve';

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

  // 고정 호 형상: 중심 좌상단, 하단 반타원(startAngle 0 → endAngle π). rx 고정, ry만 knob으로 바꾼다.
  const cx = 280;
  const cy = 200;
  const rx = 170;
  const startAngle = 0;
  const endAngle = Math.PI;

  // aspect knob: 세로 트랙. 위 = 원(ry=rx), 아래 = 납작한 타원(ry=MIN_RY). ry는 항상 > 0이라 비퇴화.
  const trackX = 620;
  const trackTop = 90;
  const trackBottom = 360;
  const MIN_RY = 24; // 하한을 양수로 둬 degenerate(ry<=0) 호를 원천 차단한다
  // 초기 knob: 트랙 중간보다 아래 → 기본을 또렷한 타원으로 시작해 비선형성을 바로 보인다
  let knobY = trackTop + (trackBottom - trackTop) * 0.58;

  // knob y → ry (선형). 위(t=0)면 ry=rx 원, 아래(t=1)면 ry=MIN_RY. 추가 vectra API 없이 inline 매핑.
  const ryAt = (y: number): number => {
    const t = (y - trackTop) / (trackBottom - trackTop); // 0(위) ~ 1(아래)
    return rx - (rx - MIN_RY) * t;
  };

  // 등거리 ghost dot을 찍을 normalized 거리비율. 0과 1은 distance clamp로 호 양 끝에 정확히 닿는다.
  const GHOST_RATIOS = [0, 0.25, 0.5, 0.75, 1];
  // 호 곡선 stroke 샘플 수
  const CURVE_STEPS = 48;

  // ratio 애니메이션 상태: ticker가 r을 등속으로 0↔1 ping-pong (사람이 직접 끌지 않음)
  let r = 0;
  let dir = 1;
  const SPEED = 0.16; // 초당 ratio 변화량

  // hot path buffer: 프레임마다 재계산하므로 재사용해 재할당을 피한다(arcPointAtTInto는 companion 없음)
  const markerOut: XY = { x: 0, y: 0 };
  const ghostOut: XY = { x: 0, y: 0 };
  const curveOut: XY = { x: 0, y: 0 };

  const HIT_RADIUS = 18;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(trackX - p.x, knobY - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // knob을 트랙 범위로 clamp → ry가 [MIN_RY, rx] 안에 머문다
    knobY = Math.max(trackTop, Math.min(trackBottom, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    // ratio r을 등속으로 전진/후진. 거리는 함수 내부에서 [0,total]로 clamp되지만 시각적으로도 가둔다.
    const dt = app.ticker.deltaMS / 1000;
    r += dir * SPEED * dt;
    if (r >= 1) {
      r = 1;
      dir = -1;
    } else if (r <= 0) {
      r = 0;
      dir = 1;
    }

    const ry = ryAt(knobY);
    // sweep: endAngle(π) > startAngle(0)이라 각도 증가 = 시계 방향(clockwise) → sweep true
    const arc = { cx, cy, rx, ry, xRotation: 0, startAngle, endAngle, sweep: true };

    // 호 전체 길이. ry가 줄수록(납작) 짧아진다. ratio→거리 환산 기준.
    const total = Curves.arcLengthAtT(arc, 1);

    // 핵심 호출 1: 현재 ratio의 거리를 t로 역매핑 → animated marker의 t (등속 = 등호장 이동)
    const t = Curves.arcTAtLength(arc, r * total);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 타원 중심
    g.circle(cx, cy, 3).fill({ color: 0x64748b });

    // 호 곡선(faint 청록): t를 등간격으로 샘플해 stroke. 등각 샘플이라 등호장이 아님에 주의.
    for (let i = 0; i < CURVE_STEPS; i++) {
      Curves.arcPointAtTInto(curveOut, arc, i / (CURVE_STEPS - 1));
      if (i === 0) g.moveTo(curveOut.x, curveOut.y);
      else g.lineTo(curveOut.x, curveOut.y);
    }
    g.stroke({ color: 0x22d3ee, width: 2, alpha: 0.6 });

    // 등거리 ghost dot(faint amber): arcTAtLength로 거리비율→t→point. 타원에서 등각이 아닌 등호장 분포.
    for (const gr of GHOST_RATIOS) {
      const gt = Curves.arcTAtLength(arc, gr * total);
      Curves.arcPointAtTInto(ghostOut, arc, gt);
      g.circle(ghostOut.x, ghostOut.y, 4).fill({ color: 0xf59e0b, alpha: 0.5 });
    }

    // animated marker(밝은 초록): 현재 t 위치. ry=rx 원이면 등각=등호장이라 ghost와 정확히 겹친다.
    Curves.arcPointAtTInto(markerOut, arc, t);
    g.circle(markerOut.x, markerOut.y, 7).fill({ color: 0x4ade80 });

    // aspect 슬라이더 트랙과 knob(주 drag 대상). ry=rx면 원(선형), 작을수록 타원(비선형).
    g.moveTo(trackX, trackTop).lineTo(trackX, trackBottom).stroke({ color: 0x334155, width: 4 });
    g.circle(trackX, knobY, grabbed ? 10 : 8).fill({ color: 0x4ade80 });

    label.text = [
      // ratio(입력)와 t(arcTAtLength 결과)의 차이가 비선형성의 수치 증거. 원이면 t==ratio.
      `ratio: ${r.toFixed(3)}`,
      `t    : ${t.toFixed(3)}`,
      `total: ${total.toFixed(1)} px`,
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
