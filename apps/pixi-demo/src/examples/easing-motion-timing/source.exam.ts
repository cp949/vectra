/**
 * Easing Motion Timing
 *
 * 진행도 막대가 0에서 1까지 일정 속도로 차오르는 동안, 같은 진행도를 선택된 easing 함수로
 * 변환해 segment 위 marker(분홍)를 움직인다. 비교용 등속 marker(회색 외곽선)가 함께 이동해
 * 가속/감속/overshoot 차이를 보여준다. 좌측 그래프에는 현재 easing 곡선과 진행 점을 그린다.
 * 한 주기가 끝날 때마다 easing 함수가 순환된다.
 *
 * - Easing.<fn>: 0..1 진행도를 timing 곡선으로 변환 (linear/quadOut/cubicInOut/backOut/bounceOut/elasticOut)
 * - Segments.pointAtTInto: eased 진행도를 segment 위 marker 위치로 변환 (매 프레임 buffer 재사용)
 * - Interpolation.remap: 정규화된 (진행도, eased) 값을 곡선 그래프 픽셀 좌표로 매핑
 */

import * as Easing from '@cp949/vectra/easing';
import * as Interpolation from '@cp949/vectra/interpolation';
import * as Segments from '@cp949/vectra/segment';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, segment } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  // 현재 easing 이름과 진행도 readout 라벨
  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 14 },
  });
  label.position.set(360, 60);
  app.stage.addChild(label);

  // 순환할 대표 easing 함수 (Easing barrel의 scalar timing 함수)
  const curves: { name: string; fn: (t: number) => number }[] = [
    { name: 'linear', fn: Easing.linear },
    { name: 'quadOut', fn: Easing.quadOut },
    { name: 'cubicInOut', fn: Easing.cubicInOut },
    { name: 'backOut', fn: Easing.backOut },
    { name: 'bounceOut', fn: Easing.bounceOut },
    { name: 'elasticOut', fn: Easing.elasticOut },
  ];

  // 곡선 그래프 영역 (좌상단)
  const PLOT_LEFT = 70;
  const PLOT_RIGHT = 320;
  const PLOT_TOP = 70;
  const PLOT_BOTTOM = 290;
  const PLOT_SAMPLES = 80;

  // eased marker와 등속 ghost marker 출력 buffer (매 프레임 재기록)
  const eased = { x: 0, y: 0 };
  const ghost = { x: 0, y: 0 };

  // 주기당 시간(ms)과 누적 시간
  const CYCLE_MS = 2200;
  let elapsed = 0;
  let curveIndex = 0;

  const render = (ticker: PIXI.Ticker): void => {
    elapsed += ticker.deltaMS;

    // 한 주기가 끝나면 다음 easing 함수로 순환
    if (elapsed >= CYCLE_MS) {
      elapsed -= CYCLE_MS;
      curveIndex = (curveIndex + 1) % curves.length;
    }

    const curve = curves[curveIndex];

    // 진행도 p: 0..1 sawtooth. easing 함수가 이 값을 timing 곡선으로 변환한다.
    const p = elapsed / CYCLE_MS;
    const e = curve.fn(p);

    // eased 진행도와 등속 진행도를 각각 segment 위 위치로 변환한다.
    // 동일 buffer를 매 프레임 재기록하는 hot path이므로 *Into를 사용한다.
    Segments.pointAtTInto(eased, segment, e);
    Segments.pointAtTInto(ghost, segment, p);

    g.clear();

    // 그래프 테두리와 기준선 (대각선 = linear 기준)
    g.rect(PLOT_LEFT, PLOT_TOP, PLOT_RIGHT - PLOT_LEFT, PLOT_BOTTOM - PLOT_TOP).stroke({
      color: 0x334155,
      width: 1,
    });
    g.moveTo(PLOT_LEFT, PLOT_BOTTOM).lineTo(PLOT_RIGHT, PLOT_TOP).stroke({ color: 0x1e293b, width: 1 });

    // 현재 easing 곡선: 정규화된 (s, fn(s)) 표본을 remap으로 픽셀 좌표에 매핑한다.
    for (let i = 0; i <= PLOT_SAMPLES; i++) {
      const s = i / PLOT_SAMPLES;
      const px = Interpolation.remap(s, 0, 1, PLOT_LEFT, PLOT_RIGHT);
      const py = Interpolation.remap(curve.fn(s), 0, 1, PLOT_BOTTOM, PLOT_TOP);
      if (i === 0) {
        g.moveTo(px, py);
      } else {
        g.lineTo(px, py);
      }
    }
    g.stroke({ color: 0x38bdf8, width: 2 });

    // 그래프 위 현재 진행 점
    const dotX = Interpolation.remap(p, 0, 1, PLOT_LEFT, PLOT_RIGHT);
    const dotY = Interpolation.remap(e, 0, 1, PLOT_BOTTOM, PLOT_TOP);
    g.circle(dotX, dotY, 5).fill(0xf472b6);

    // 이동 경로 segment
    g.moveTo(segment.a.x, segment.a.y).lineTo(segment.b.x, segment.b.y).stroke({ color: 0x475569, width: 3 });

    // 등속 ghost marker (회색 외곽선)와 eased marker (분홍 채움)
    g.circle(ghost.x, ghost.y, 9).stroke({ color: 0x94a3b8, width: 2 });
    g.circle(eased.x, eased.y, 9).fill(0xf472b6);

    label.text = `${curve.name}\nprogress ${p.toFixed(2)}  eased ${e.toFixed(2)}`;
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    g.destroy();
    label.destroy();
  };
}
