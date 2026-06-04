/**
 * Grid Snap Bracket
 *
 * 트랙 위 probe 값을 drag하면 그 값을 감싸는 grid 칸의 아래 경계(snapFloor)와 위 경계(snapCeil)가
 * 강조되고, 둘 중 가까운 칸(snapTo)이 nearest marker로 표시된다. probe가 tick에 정확히 닿으면
 * floor=ceil=nearest가 되어 bracket 폭이 0으로 붕괴하는 경계 동작을 드러낸다. gap handle을 끌면
 * grid 해상도(칸 폭)가 바뀌어 같은 probe가 다른 칸에 맞춰진다.
 *
 * - Maths.snapFloor: 값보다 크지 않은 grid 칸. probe를 감싸는 칸의 아래 경계.
 * - Maths.snapCeil: 값보다 작지 않은 grid 칸. probe를 감싸는 칸의 위 경계.
 * - Maths.snapTo: 가장 가까운 grid 칸(반올림). floor/ceil 중 가까운 쪽을 고른다.
 */

import * as Maths from '@cp949/vectra/math';

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

  // 값 공간 = 화면 x축. 모든 grid/probe는 같은 수평 트랙 위에 둔다 (snap은 scalar → 1D)
  const trackY = size.height * 0.5;
  const MARGIN = 48;
  const START = MARGIN; // grid 기준점(start). 트랙 왼쪽 px로 고정한다
  const GAP_MIN = 16; // gap > 0 요구(0이면 snap*가 RangeError). 0폭 grid도 막는다

  // 주 drag 대상. grid 칸에 맞춰지는 측정 값
  const probe: XY = { x: size.width * 0.5, y: trackY };
  // 보조 handle: grid 칸 폭(gap)을 정하는 별도 짧은 트랙
  const gapTrackY = size.height * 0.5 + 96;
  const gapTrackLeft = MARGIN;
  const gapHandle: XY = { x: gapTrackLeft + 72, y: gapTrackY }; // 초기 gap = 72px

  const HIT_RADIUS = 20;
  let grabbed: XY | null = null;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 가장 가까운 handle 하나만 잡는다
    const candidates: XY[] = [probe, gapHandle];
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
    if (grabbed === gapHandle) {
      // gap handle: gapTrackLeft 기준 오른쪽 거리 = gap. GAP_MIN 이상으로 clamp(gap > 0 보장)
      grabbed.x = Math.max(gapTrackLeft + GAP_MIN, Math.min(size.width - MARGIN, p.x));
    } else {
      // probe: 트랙 폭 안에서 자유롭게 움직인다
      grabbed.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
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

  const fmt = (n: number): string => n.toFixed(1).padStart(7);

  const render = (): void => {
    const value = probe.x; // 맞출 값(px)
    const gap = gapHandle.x - gapTrackLeft; // 현재 grid 칸 폭(px), 항상 >= GAP_MIN

    // 같은 grid snap 관계의 세 방향. 모두 START 기준 gap 단위
    const floor = Maths.snapFloor(value, gap, START); // 값을 감싸는 칸의 아래 경계
    const ceil = Maths.snapCeil(value, gap, START); // 값을 감싸는 칸의 위 경계
    // 반올림(half-up): 칸 정중앙(x.5)이면 위쪽 칸으로 올라간다
    const nearest = Maths.snapTo(value, gap, START);

    // probe가 tick에 정확히 닿으면 floor=ceil → bracket 폭 0
    const onTick = floor === ceil;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 값 트랙 baseline
    g.moveTo(MARGIN, trackY)
      .lineTo(size.width - MARGIN, trackY)
      .stroke({ color: 0x334155, width: 2 });

    // grid tick: START부터 gap 간격으로 트랙 전체에 (snap 격자)
    for (let x = START; x <= size.width - MARGIN + 0.5; x += gap) {
      g.moveTo(x, trackY - 9)
        .lineTo(x, trackY + 9)
        .stroke({ color: 0x1e293b, width: 1 });
    }

    // probe를 감싸는 칸 [floor, ceil] 강조 fill
    g.rect(floor, trackY - 16, Math.max(ceil - floor, 1), 32).fill({
      color: onTick ? 0xf87171 : 0x1d4ed8,
      alpha: 0.28,
    });

    // floor marker(아래 경계) — 값보다 크지 않은 칸
    g.moveTo(floor, trackY - 22)
      .lineTo(floor, trackY + 22)
      .stroke({ color: 0x38bdf8, width: 2 });
    // ceil marker(위 경계) — 값보다 작지 않은 칸
    g.moveTo(ceil, trackY - 22)
      .lineTo(ceil, trackY + 22)
      .stroke({ color: 0xa78bfa, width: 2 });

    // nearest marker(반올림) — floor/ceil 중 가까운 칸에 굵게
    g.circle(nearest, trackY, 7).fill({ color: 0x22d3ee });

    // probe knob: 주 drag 대상
    g.circle(probe.x, probe.y, grabbed === probe ? 10 : 8).fill({ color: 0xfacc15 });
    g.circle(probe.x, probe.y, HIT_RADIUS).stroke({ color: 0xfacc15, width: 1, alpha: 0.16 });

    // gap 트랙과 handle(보조): grid 칸 폭을 정한다
    g.moveTo(gapTrackLeft, gapTrackY)
      .lineTo(size.width - MARGIN, gapTrackY)
      .stroke({ color: 0x334155, width: 2 });
    g.moveTo(gapTrackLeft, gapTrackY - 8)
      .lineTo(gapTrackLeft, gapTrackY + 8)
      .stroke({ color: 0x475569, width: 2 });
    g.circle(gapHandle.x, gapHandle.y, grabbed === gapHandle ? 9 : 7).fill({ color: 0x34d399 });
    g.circle(gapHandle.x, gapHandle.y, HIT_RADIUS).stroke({ color: 0x34d399, width: 1, alpha: 0.16 });

    label.text = [
      `floor  : ${fmt(floor)}   drag probe / gap`,
      `ceil   : ${fmt(ceil)}   value ${fmt(value)}`,
      `nearest: ${fmt(nearest)}   gap   ${fmt(gap)}`,
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
