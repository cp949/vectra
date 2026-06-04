/**
 * Bias Curve
 *
 * b 파라미터 핸들을 drag하면 bias(t, b) 출력 곡선이 저값 또는 고값 쪽으로 휘어지는 변화를
 * 실시간 확인한다. 등속 ghost marker와 bias 진행 marker를 segment 위에 함께 구동한다.
 *
 * - Easingx.bias: Schlick-style bias scalar shaping 함수. amount가 0.5보다 작으면 곡선이
 *   저값 쪽으로, 0.5보다 크면 고값 쪽으로 구부러진다. amount === 0.5는 linear와 일치.
 */

import * as Easingx from '@cp949/vectra/easing';
import * as Interpolationx from '@cp949/vectra/interpolation';
import * as Segmentx from '@cp949/vectra/segment';

type XY = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, segment } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 14 },
  });
  label.position.set(380, 60);
  app.stage.addChild(label);

  // 곡선 graph 영역 상수 (x: t 입력 축, y: bias(t,b) 출력 축)
  const PLOT_LEFT = 70;
  const PLOT_RIGHT = 320;
  const PLOT_TOP = 70;
  const PLOT_BOTTOM = 290;
  const PLOT_SAMPLES = 80;

  // b 파라미터 수평 핸들 트랙
  const B_TRACK_Y = 400;
  const B_TRACK_LEFT = 70;
  const B_TRACK_RIGHT = 620;
  const HIT_RADIUS = 18;

  // b 초깃값 0.25: 저값 쪽으로 치우침. 핸들 x 좌표 초기화
  let b = 0.25;
  const bHandle: XY = {
    x: Interpolationx.remap(b, 0.01, 0.99, B_TRACK_LEFT, B_TRACK_RIGHT),
    y: B_TRACK_Y,
  };

  // bias marker와 등속 ghost marker 출력 buffer (매 프레임 재기록)
  const biasedPt: XY = { x: 0, y: 0 };
  const ghostPt: XY = { x: 0, y: 0 };

  const CYCLE_MS = 2400;
  let elapsed = 0;

  let grabbed = false;
  const canvas = app.canvas;

  const onPointerDown = (e: PointerEvent): void => {
    const dx = e.offsetX - bHandle.x;
    const dy = e.offsetY - bHandle.y;
    if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) grabbed = true;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const clamped = Math.max(B_TRACK_LEFT, Math.min(B_TRACK_RIGHT, e.offsetX));
    bHandle.x = clamped;
    // 핸들 x → b 값. open bound (0.01, 0.99) 유지해 RangeError 방지
    b = Math.max(0.01, Math.min(0.99, Interpolationx.remap(clamped, B_TRACK_LEFT, B_TRACK_RIGHT, 0.01, 0.99)));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (ticker: PIXI.Ticker): void => {
    elapsed += ticker.deltaMS;
    if (elapsed >= CYCLE_MS) elapsed -= CYCLE_MS;

    const t = elapsed / CYCLE_MS;
    const biased = Easingx.bias(t, b);

    // bias marker와 ghost marker 위치를 segment 위 t 값으로 계산
    Segmentx.pointAtTInto(biasedPt, segment, biased);
    Segmentx.pointAtTInto(ghostPt, segment, t);

    g.clear();

    // graph 테두리와 linear 기준 대각선
    g.rect(PLOT_LEFT, PLOT_TOP, PLOT_RIGHT - PLOT_LEFT, PLOT_BOTTOM - PLOT_TOP).stroke({
      color: 0x334155,
      width: 1,
    });
    g.moveTo(PLOT_LEFT, PLOT_BOTTOM).lineTo(PLOT_RIGHT, PLOT_TOP).stroke({ color: 0x1e293b, width: 1 });

    // bias 곡선: b < 0.5이면 저값 쪽 볼록, b > 0.5이면 고값 쪽 볼록
    for (let i = 0; i <= PLOT_SAMPLES; i++) {
      const s = i / PLOT_SAMPLES;
      const px = Interpolationx.remap(s, 0, 1, PLOT_LEFT, PLOT_RIGHT);
      const py = Interpolationx.remap(Easingx.bias(s, b), 0, 1, PLOT_BOTTOM, PLOT_TOP);
      if (i === 0) {
        g.moveTo(px, py);
      } else {
        g.lineTo(px, py);
      }
    }
    g.stroke({ color: 0x38bdf8, width: 2 });

    // graph 위 현재 진행 점 (x = t, y = biased)
    const dotX = Interpolationx.remap(t, 0, 1, PLOT_LEFT, PLOT_RIGHT);
    const dotY = Interpolationx.remap(biased, 0, 1, PLOT_BOTTOM, PLOT_TOP);
    g.circle(dotX, dotY, 5).fill(0xf472b6);

    // segment 이동 경로
    g.moveTo(segment.a.x, segment.a.y).lineTo(segment.b.x, segment.b.y).stroke({ color: 0x475569, width: 3 });

    // 등속 ghost marker (회색 외곽선)와 bias 진행 marker (분홍 채움)
    g.circle(ghostPt.x, ghostPt.y, 9).stroke({ color: 0x94a3b8, width: 2 });
    g.circle(biasedPt.x, biasedPt.y, 9).fill(0xf472b6);

    // b 파라미터 수평 트랙
    g.moveTo(B_TRACK_LEFT, B_TRACK_Y).lineTo(B_TRACK_RIGHT, B_TRACK_Y).stroke({ color: 0x334155, width: 2 });
    // b=0.5 중앙 눈금: 이 위치에서 곡선이 linear와 일치
    const midX = Interpolationx.remap(0.5, 0.01, 0.99, B_TRACK_LEFT, B_TRACK_RIGHT);
    g.moveTo(midX, B_TRACK_Y - 8)
      .lineTo(midX, B_TRACK_Y + 8)
      .stroke({ color: 0x475569, width: 1 });
    // b 핸들
    g.circle(bHandle.x, bHandle.y, grabbed ? 9 : 7).fill({ color: 0x34d399 });
    g.circle(bHandle.x, bHandle.y, HIT_RADIUS).stroke({ color: 0x34d399, width: 1, alpha: 0.16 });

    label.text = `b ${b.toFixed(2)}\nt ${t.toFixed(2)}  biased ${biased.toFixed(2)}`;
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
