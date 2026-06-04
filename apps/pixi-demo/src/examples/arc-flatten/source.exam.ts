/**
 * Arc Flatten
 *
 * 화면 고정 semicircle 원호를 adaptive subdivision으로 polyline에 근사한다. 오른쪽 flatness
 * 슬라이더 knob 1개를 위아래로 drag하면 chord-error 허용오차가 바뀌어, 같은 호를 근사하는
 * polyline의 segment 수와 호-polyline 사이 최대 gap이 함께 변한다. 허용오차를 끝까지 키우면
 * 전체 호가 단일 chord(segment 1개)로 붕괴해 "tolerance가 크면 근사가 거칠어진다"를 드러낸다.
 *
 * - Curves.arcFlattenInto: center form arc를 flatness 이하 chord-error가 되도록 adaptive하게
 *   분할해 polyline point를 out 배열에 기록한다(중심 관계). 참조용 true arc도 같은 함수를
 *   아주 작은 flatness로 호출해 만든다.
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

  // 고정 원호: 중심 하단, rx === ry 라 원형 호, 기울기 없음, 180° smile(π → 2π)
  const cx = 300;
  const cy = 250;
  const radius = 150;
  const arc = {
    cx,
    cy,
    rx: radius,
    ry: radius,
    xRotation: 0,
    startAngle: Math.PI,
    endAngle: 2 * Math.PI,
    sweep: true,
  };

  // flatness 슬라이더: 세로 트랙. 위 = fine(작은 flatness), 아래 = coarse(큰 flatness)
  const trackX = 620;
  const trackTop = 80;
  const trackBottom = 380;
  const MIN_FLAT = 0.2; // 위 끝: 미세 근사
  // 끝 값은 semicircle sagitta(= radius)보다 크게 잡아 단일 chord 붕괴를 가능케 한다
  const MAX_FLAT = 200;
  // knob 초기 위치: 트랙 중간보다 살짝 위 (적당히 촘촘한 상태로 시작)
  let knobY = trackTop + (trackBottom - trackTop) * 0.32;

  // knob y → flatness (선형). 추가 vectra API 없이 inline 매핑으로 단일 API 유지
  const flatnessAt = (y: number): number => {
    const t = (y - trackTop) / (trackBottom - trackTop); // 0(위) ~ 1(아래)
    return MIN_FLAT + (MAX_FLAT - MIN_FLAT) * t;
  };

  // ticker hot path: 매 프레임 재계산하므로 out 배열을 재사용해 프레임당 재할당을 피한다
  const polyOut: XY[] = [];
  const refOut: XY[] = [];

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
    // knob을 트랙 범위로 clamp
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
    const flatness = flatnessAt(knobY);

    // 핵심 호출: flatness 허용오차로 호를 adaptive polyline 근사
    Curves.arcFlattenInto(polyOut, arc, { flatness });
    // 참조 true arc: 같은 API를 아주 작은 flatness로 호출해 dense polyline 생성
    Curves.arcFlattenInto(refOut, arc, { flatness: 0.05 });

    // 원호와 polyline 사이 최대 gap: 원호라 |중심까지 거리 - radius|로 정확히 측정
    // 인접 vertex의 midpoint가 호에서 얼마나 벗어났는지로 chord-error 근사를 본다
    let maxGap = 0;
    let worstX = 0;
    let worstY = 0;
    for (let i = 0; i + 1 < polyOut.length; i++) {
      const mx = (polyOut[i].x + polyOut[i + 1].x) * 0.5;
      const my = (polyOut[i].y + polyOut[i + 1].y) * 0.5;
      const gap = Math.abs(Math.hypot(mx - cx, my - cy) - radius);
      if (gap > maxGap) {
        maxGap = gap;
        worstX = mx;
        worstY = my;
      }
    }

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // center 점
    g.circle(cx, cy, 3).fill({ color: 0x64748b });

    // 참조 true arc(faint 굵은 회색): 근사 대상이 되는 매끄러운 호
    for (let i = 0; i < refOut.length; i++) {
      const pt = refOut[i];
      if (i === 0) g.moveTo(pt.x, pt.y);
      else g.lineTo(pt.x, pt.y);
    }
    g.stroke({ color: 0x475569, width: 6, alpha: 0.55 });

    // adaptive polyline(밝은 청록): 실제 근사 결과
    for (let i = 0; i < polyOut.length; i++) {
      const pt = polyOut[i];
      if (i === 0) g.moveTo(pt.x, pt.y);
      else g.lineTo(pt.x, pt.y);
    }
    g.stroke({ color: 0x22d3ee, width: 2 });

    // polyline vertex(흰 점): segment 경계. flatness가 클수록 점이 줄어든다
    for (let i = 0; i < polyOut.length; i++) {
      g.circle(polyOut[i].x, polyOut[i].y, 3.5).fill({ color: 0xe2e8f0 });
    }

    // 최악 gap segment의 midpoint에서 호 표면까지 radial 표시(허용오차의 의미를 시각화)
    if (maxGap > 0.01) {
      const len = Math.hypot(worstX - cx, worstY - cy) || 1;
      const arcX = cx + ((worstX - cx) / len) * radius;
      const arcY = cy + ((worstY - cy) / len) * radius;
      g.moveTo(worstX, worstY).lineTo(arcX, arcY).stroke({ color: 0xf59e0b, width: 2 });
      g.circle(worstX, worstY, 4).fill({ color: 0xf59e0b });
    }

    // flatness 슬라이더 트랙과 knob(주 drag 대상)
    g.moveTo(trackX, trackTop).lineTo(trackX, trackBottom).stroke({ color: 0x334155, width: 4 });
    g.circle(trackX, knobY, grabbed ? 10 : 8).fill({ color: 0x4ade80 });

    const segments = Math.max(0, polyOut.length - 1);
    label.text = [
      `flatness: ${flatness.toFixed(2)} px`,
      `segments: ${segments}`,
      `max gap : ${maxGap.toFixed(2)} px`,
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
