/**
 * Stepped Timing Track
 *
 * 진행도 t가 0에서 1까지 등속으로 차오르는 동안, 같은 t를 CSS/GSAP steps() 스타일 계단형
 * timing으로 변환해 트랙 위 marker가 count개의 이산 위치만 밟으며 이동한다. count handle을
 * 위아래로 drag하면 계단 수가 바뀌어 marker가 더 잘게 또는 더 듬성 밟는다. 왼쪽 graph에는
 * 계단 곡선과 현재 진행 점을 그린다. direction "end"는 t=1에서만 마지막 칸으로 튀므로,
 * t가 1에 닿는 hold 구간에서 marker가 끝점으로 snap하는 동작을 드러낸다.
 *
 * - Easing.steps: 등속 t를 count개 계단의 floor(t*count)/count 값으로 변환 (direction "end")
 * - Segments.pointAtTInto: 계단형 t를 트랙 segment 위 marker 위치로 변환 (매 프레임 buffer 재사용)
 * - Interpolation.remap: 정규화된 (t, stepped) 값을 곡선 graph 픽셀 좌표로 매핑
 */

import * as Easing from '@cp949/vectra/easing';
import * as Interpolation from '@cp949/vectra/interpolation';
import * as Segments from '@cp949/vectra/segment';

type XY = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, segment } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 14 },
  });
  label.position.set(360, 60);
  app.stage.addChild(label);

  // 계단 곡선 graph 영역 (좌상단)
  const PLOT_LEFT = 70;
  const PLOT_RIGHT = 320;
  const PLOT_TOP = 70;
  const PLOT_BOTTOM = 290;
  const PLOT_SAMPLES = 240; // 계단 모서리를 또렷이 그리려고 촘촘히 표본

  // count handle 수직 트랙 (오른쪽). 위로 끌수록 계단 수 증가
  const COUNT_MIN = 1; // steps count는 양의 정수 >= 1 (위반 시 RangeError)
  const COUNT_MAX = 12;
  const COUNT_TRACK_X = 660;
  const COUNT_TRACK_TOP = 80;
  const COUNT_TRACK_BOTTOM = 300;
  // 초기 count = 5에 대응하는 y로 handle을 둔다
  const initRatio = (5 - COUNT_MIN) / (COUNT_MAX - COUNT_MIN);
  const countHandle: XY = {
    x: COUNT_TRACK_X,
    y: COUNT_TRACK_BOTTOM - initRatio * (COUNT_TRACK_BOTTOM - COUNT_TRACK_TOP),
  };

  const HIT_RADIUS = 20;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(countHandle.x - p.x, countHandle.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 수직 트랙 안으로 clamp. x는 트랙에 고정한다
    countHandle.y = Math.max(COUNT_TRACK_TOP, Math.min(COUNT_TRACK_BOTTOM, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // marker 출력 buffer (매 프레임 재기록하는 hot path)
  const marker = { x: 0, y: 0 };

  // 0→1 등속 구간(RUN_MS) + t=1 hold 구간(HOLD_MS). hold에서 마지막 칸 snap을 보여준다
  const RUN_MS = 2400;
  const HOLD_MS = 700;
  let elapsed = 0;

  const render = (ticker: PIXI.Ticker): void => {
    elapsed += ticker.deltaMS;
    if (elapsed >= RUN_MS + HOLD_MS) elapsed = 0;

    // handle y → 계단 수. 정수로 반올림하고 [MIN, MAX]로 clamp (steps의 정수 요구 충족)
    const ratio = (COUNT_TRACK_BOTTOM - countHandle.y) / (COUNT_TRACK_BOTTOM - COUNT_TRACK_TOP);
    const count = Math.max(COUNT_MIN, Math.min(COUNT_MAX, Math.round(COUNT_MIN + ratio * (COUNT_MAX - COUNT_MIN))));

    // 등속 진행도 t. hold 구간에서는 1로 고정한다
    const t = Math.min(elapsed / RUN_MS, 1);
    // 계단형 timing: direction "end"는 floor(t*count)/count, t=1에서만 정확히 1로 snap
    const stepped = Easing.steps(t, count, 'end');

    // 계단형 t를 트랙 위 marker 위치로 변환 (동일 buffer 재사용)
    Segments.pointAtTInto(marker, segment, stepped);

    g.clear();

    // graph 테두리와 linear 기준 대각선
    g.rect(PLOT_LEFT, PLOT_TOP, PLOT_RIGHT - PLOT_LEFT, PLOT_BOTTOM - PLOT_TOP).stroke({
      color: 0x334155,
      width: 1,
    });
    g.moveTo(PLOT_LEFT, PLOT_BOTTOM).lineTo(PLOT_RIGHT, PLOT_TOP).stroke({ color: 0x1e293b, width: 1 });

    // 계단 곡선: 표본을 이어 그려 floor 모서리를 또렷한 staircase로 표현한다
    for (let i = 0; i <= PLOT_SAMPLES; i++) {
      const s = i / PLOT_SAMPLES;
      const px = Interpolation.remap(s, 0, 1, PLOT_LEFT, PLOT_RIGHT);
      const py = Interpolation.remap(Easing.steps(s, count, 'end'), 0, 1, PLOT_BOTTOM, PLOT_TOP);
      if (i === 0) {
        g.moveTo(px, py);
      } else {
        g.lineTo(px, py);
      }
    }
    g.stroke({ color: 0x38bdf8, width: 2 });

    // graph 위 현재 진행 점 (x=등속 t, y=계단값)
    const dotX = Interpolation.remap(t, 0, 1, PLOT_LEFT, PLOT_RIGHT);
    const dotY = Interpolation.remap(stepped, 0, 1, PLOT_BOTTOM, PLOT_TOP);
    g.circle(dotX, dotY, 5).fill(0xf472b6);

    // 이동 트랙 segment와 계단 위치 tick (count칸의 밟을 수 있는 지점)
    g.moveTo(segment.a.x, segment.a.y).lineTo(segment.b.x, segment.b.y).stroke({ color: 0x475569, width: 3 });
    for (let k = 0; k < count; k++) {
      const tickT = k / count;
      const tx = segment.a.x + (segment.b.x - segment.a.x) * tickT;
      const ty = segment.a.y + (segment.b.y - segment.a.y) * tickT;
      g.circle(tx, ty, 4).stroke({ color: 0x475569, width: 2 });
    }

    // 계단형 marker (분홍). count칸 중 한 위치에만 머문다
    g.circle(marker.x, marker.y, 9).fill(0xf472b6);

    // count handle 수직 트랙과 handle (주 drag 대상)
    g.moveTo(COUNT_TRACK_X, COUNT_TRACK_TOP)
      .lineTo(COUNT_TRACK_X, COUNT_TRACK_BOTTOM)
      .stroke({ color: 0x334155, width: 2 });
    g.circle(countHandle.x, countHandle.y, grabbed ? 9 : 7).fill({ color: 0x34d399 });
    g.circle(countHandle.x, countHandle.y, HIT_RADIUS).stroke({ color: 0x34d399, width: 1, alpha: 0.16 });

    label.text = `count ${count}\nt ${t.toFixed(2)}  stepped ${stepped.toFixed(2)}`;
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
