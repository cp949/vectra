/**
 * Polyline Length Ratio
 *
 * segment 길이가 제각각인 polyline 위에서 ratio t를 등속으로 0↔1 왕복시키면 marker가
 * 등속(등거리)으로 경로를 걸어간다. 꼭짓점을 drag해 경로 모양을 바꿔도 t는 같은 시간에
 * 0→1을 완주하고, 등비율 ghost dot은 vertex가 아닌 등거리 위치로 다시 분포한다. 이로써
 * "normalized arclength ratio = 전체 길이 대비 거리 비율(등비율 = 등거리)"을 드러낸다.
 *
 * - Polylines.pointAtLengthRatioInto: ratio∈[0,1]을 전체 arclength 거리로 환산해 그 위치의 point를
 *   out에 기록한다(중심 관계). animated marker와 등비율 ghost dot 모두 같은 함수로 만든다.
 * - Polylines.length: polyline 전체 arclength. diagnostics의 total과 covered(= t×total) 표시에 쓴다.
 */

import * as Polylines from '@cp949/vectra/polyline';

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

  // 주 조작 대상: 경로 모양. segment 길이가 일부러 제각각이라 등비율≠등vertex를 드러낸다.
  const points: XY[] = [
    { x: 90, y: 330 },
    { x: 200, y: 130 },
    { x: 300, y: 300 },
    { x: 540, y: 120 },
    { x: 650, y: 350 },
  ];

  // 등비율 marker를 찍을 normalized 위치. 0과 1은 첫/끝 vertex에 정확히 닿는다(clamp 경계).
  const GHOST_RATIOS = [0, 0.25, 0.5, 0.75, 1];

  // ratio 애니메이션 상태: ticker가 t를 등속으로 0↔1 ping-pong (사람이 직접 끌지 않음)
  let t = 0;
  let dir = 1;
  const SPEED = 0.18; // 초당 ratio 변화량

  // ticker hot path: 프레임마다 재계산하므로 out buffer를 재사용해 재할당을 피한다
  const markerOut: XY = { x: 0, y: 0 };
  const ghostOut: XY = { x: 0, y: 0 };

  const HIT_RADIUS = 16;
  let dragIndex = -1;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 가장 가까운 꼭짓점을 잡는다
    for (let i = 0; i < points.length; i++) {
      if (Math.hypot(points[i].x - p.x, points[i].y - p.y) <= HIT_RADIUS) {
        dragIndex = i;
        return;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (dragIndex < 0) return;
    const p = getCanvasXY(e);
    // 잡은 꼭짓점을 canvas 안으로 clamp해 이동
    points[dragIndex].x = Math.max(12, Math.min(size.width - 12, p.x));
    points[dragIndex].y = Math.max(40, Math.min(size.height - 12, p.y));
  };

  const onPointerUp = (): void => {
    dragIndex = -1;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    // t를 등속으로 전진/후진. ratio는 함수 내부에서 [0,1]로 clamp되지만 시각적으로도 가둔다.
    const dt = app.ticker.deltaMS / 1000;
    t += dir * SPEED * dt;
    if (t >= 1) {
      t = 1;
      dir = -1;
    } else if (t <= 0) {
      t = 0;
      dir = 1;
    }

    const total = Polylines.length(points);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // polyline 경로(청록 stroke)
    for (let i = 0; i < points.length; i++) {
      if (i === 0) g.moveTo(points[i].x, points[i].y);
      else g.lineTo(points[i].x, points[i].y);
    }
    g.stroke({ color: 0x22d3ee, width: 2 });

    // 꼭짓점(흰 점): drag 가능한 경로 편집 handle
    for (let i = 0; i < points.length; i++) {
      g.circle(points[i].x, points[i].y, dragIndex === i ? 8 : 6).fill({ color: 0xe2e8f0 });
    }

    // 등비율 ghost dot(faint amber): vertex가 아닌 등거리 위치 → 등비율=등거리를 보인다
    for (const r of GHOST_RATIOS) {
      Polylines.pointAtLengthRatioInto(ghostOut, points, r);
      g.circle(ghostOut.x, ghostOut.y, 4).fill({ color: 0xf59e0b, alpha: 0.5 });
    }

    // 핵심 호출: 현재 ratio t의 경로 위 위치 → animated marker(밝은 초록)
    Polylines.pointAtLengthRatioInto(markerOut, points, t);
    g.circle(markerOut.x, markerOut.y, 7).fill({ color: 0x4ade80 });

    label.text = [
      `ratio  : ${t.toFixed(3)}`,
      `covered: ${(t * total).toFixed(1)} px`,
      `total  : ${total.toFixed(1)} px`,
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
