/**
 * Inverse Lerp Track
 *
 * 시작 bound A와 끝 bound B가 정한 구간 [A, B] 위에서 probe knob을 drag하면 그 위치 값이
 * 구간에서 차지하는 비율 t를 0↔1로 읽는다(역보간). probe를 bound 바깥으로 끌면 raw t가 0 미만/
 * 1 초과가 되어 extrapolation을 드러내고, 같은 순간 clamped t는 bound에 고정된 marker로 표시돼
 * 두 정책을 한 장면에서 대비한다. vec-lerp-points가 보인 "t → 점"의 역방향("값 → t")이다.
 *
 * - Interpolation.inverseLerp: 구간 [a, b]에서 value의 비율 t = (value - a)/(b - a). clamp하지
 *   않으므로 구간 밖에서 t < 0 또는 t > 1.
 * - Interpolation.inverseLerpClamped: 같은 비율을 [0, 1]로 clamp한 값. bound 고정 marker로 표시.
 */

import * as Interpolation from '@cp949/vectra/interpolation';

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

  // 모든 handle은 같은 수평 트랙 직선 위에 둔다 (inverseLerp는 scalar 정규화 → 1D)
  const trackY = size.height * 0.5;
  const MARGIN = 40;
  const MIN_GAP = 60; // A.x < B.x 를 보장하는 최소 구간 폭 (a >= b면 inverseLerp가 RangeError)

  // 구간 [A, B]를 정의하는 두 bound. probe보다 안쪽에 둬 probe가 바깥으로 나갈 여지를 남긴다
  const boundA: XY = { x: size.width * 0.3, y: trackY };
  const boundB: XY = { x: size.width * 0.7, y: trackY };
  // 사용자가 끄는 주 대상. 구간 안팎을 자유롭게 움직이는 측정 값
  const probe: XY = { x: size.width * 0.5, y: trackY };

  const HIT_RADIUS = 20;
  let grabbed: XY | null = null;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 가장 가까운 handle 하나만 잡는다 (probe 우선 비교 후 bound)
    const candidates: XY[] = [probe, boundA, boundB];
    let best: XY | null = null;
    let bestD = HIT_RADIUS;
    for (const c of candidates) {
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      if (d <= bestD) {
        best = c;
        bestD = d;
      }
    }
    grabbed = best;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    if (grabbed === boundA) {
      // 시작 bound: 끝 bound보다 항상 MIN_GAP 이상 왼쪽 (ordered range 유지)
      grabbed.x = Math.max(MARGIN, Math.min(boundB.x - MIN_GAP, p.x));
    } else if (grabbed === boundB) {
      // 끝 bound: 시작 bound보다 항상 MIN_GAP 이상 오른쪽
      grabbed.x = Math.min(size.width - MARGIN, Math.max(boundA.x + MIN_GAP, p.x));
    } else {
      // probe: 캔버스 폭 안에서 자유롭게 (구간 바깥으로 나가 extrapolation을 보이게 함)
      grabbed.x = Math.max(10, Math.min(size.width - 10, p.x));
    }
  };

  const onPointerUp = (): void => {
    grabbed = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(3).padStart(8);

  const render = (): void => {
    // 구간 [A.x, B.x]에서 probe.x의 비율. clamp 없는 raw t (구간 밖이면 음수/1 초과)
    const tRaw = Interpolation.inverseLerp(boundA.x, boundB.x, probe.x);
    // 같은 비율을 [0, 1]로 clamp한 값. 구간 밖이면 0 또는 1에 고정된다
    const tClamp = Interpolation.inverseLerpClamped(boundA.x, boundB.x, probe.x);

    const outside = tRaw < 0 || tRaw > 1; // probe가 구간 밖인가 (extrapolation 영역)

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 구간 바깥으로 트랙을 옅게 연장 (raw t가 0~1을 벗어나는 extrapolation 도메인)
    g.moveTo(MARGIN - 20, trackY)
      .lineTo(size.width - MARGIN + 20, trackY)
      .stroke({ color: 0x1e293b, width: 2 });

    // [A, B] 본 구간 = 정규화 t ∈ [0, 1] 도메인
    g.moveTo(boundA.x, trackY).lineTo(boundB.x, trackY).stroke({ color: 0x475569, width: 4 });

    // 등간격 t 눈금 (0, .25, .5, .75, 1) → 트랙 위 균등 위치로 0~1 스케일을 보여준다
    for (let i = 0; i <= 4; i++) {
      const k = i / 4;
      const x = boundA.x + (boundB.x - boundA.x) * k; // t=k 위치 (정방향 환산은 표시용 보조선뿐)
      g.moveTo(x, trackY - 10)
        .lineTo(x, trackY + 10)
        .stroke({ color: 0x334155, width: 1 });
    }

    // A→probe fill bar: clamped t 비율을 두께로 표현 (구간 안 채움 정도)
    const fillEndX = boundA.x + (boundB.x - boundA.x) * tClamp;
    g.moveTo(boundA.x, trackY)
      .lineTo(fillEndX, trackY)
      .stroke({ color: outside ? 0xf87171 : 0x22d3ee, width: 8, alpha: 0.55 });

    // clamped marker: probe가 구간 밖이면 가까운 bound(t=0 또는 1)에 고정돼 clamp 정책을 드러낸다
    if (outside) {
      g.circle(fillEndX, trackY, 6).fill({ color: 0x22d3ee });
    }

    // bound A·B drag handle (구간을 정의하는 보조 handle)
    for (const b of [boundA, boundB]) {
      g.circle(b.x, b.y, grabbed === b ? 9 : 7).fill({ color: 0x38bdf8 });
      g.circle(b.x, b.y, HIT_RADIUS).stroke({ color: 0x38bdf8, width: 1, alpha: 0.16 });
    }

    // probe knob: 주 drag 대상. 구간 밖이면 색을 바꿔 extrapolation을 강조한다
    g.circle(probe.x, probe.y, grabbed === probe ? 10 : 8).fill({
      color: outside ? 0xf87171 : 0xfacc15,
    });
    g.circle(probe.x, probe.y, HIT_RADIUS).stroke({ color: 0xfacc15, width: 1, alpha: 0.16 });

    label.text = [
      `t raw  : ${fmt(tRaw)}   drag probe / A / B`,
      `t clamp: ${fmt(tClamp)}`,
      `value  : ${fmt(probe.x)} px`,
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
