/**
 * Normal Distribution Histogram
 *
 * seed가 고정된 RNG로 정규분포 scalar 샘플을 매 프레임 같은 sequence로 뽑아 1D 히스토그램을 그린다.
 * mean handle을 좌우로 drag하면 분포가 통째로 이동하고, stddev handle을 drag하면 폭이 넓어지거나
 * 좁아진다. stddev를 0까지 좁히면 모든 샘플이 mean 한 곳에 모여 spike가 되는 정책을 드러낸다.
 *
 * - Random.createRng: 같은 seed에서 동일한 난수 sequence를 만든다. 매 프레임 같은 z-sequence를
 *   재생산해 히스토그램이 깜빡이지 않게 한다.
 * - Random.normal: 표준정규 z를 (mean, stddev)로 transform한 정규분포 샘플. stddev=0이면 항상 mean.
 */

import * as Random from '@cp949/vectra/random';

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

  // 같은 seed로 매 프레임 RNG를 새로 만들어 동일한 N개 샘플을 재생산한다 (누적 상태 없음)
  const SEED = 'vectra-normal-histogram';
  const SAMPLE_COUNT = 2000;
  const BIN_COUNT = 48;

  // 값 공간 = 화면 x축. 좌우 margin 안쪽이 히스토그램 표시 범위
  const marginX = 48;
  const plotLeft = marginX;
  const plotRight = size.width - marginX;
  const plotWidth = plotRight - plotLeft;
  const baselineY = size.height - 70; // 막대가 자라 오르는 바닥선
  const plotTop = 90;
  const plotHeight = baselineY - plotTop;
  const trackY = baselineY + 34; // handle 트랙 (분포를 편집하는 보조 축)

  // mean handle(주 대상)과 stddev handle(보조). 초기값은 화면 중앙 + 폭 90px
  const meanHandle: XY = { x: (plotLeft + plotRight) / 2, y: trackY };
  const stddevHandle: XY = { x: (plotLeft + plotRight) / 2 + 90, y: trackY };

  // 막대 개수를 매 프레임 채워 넣는 재사용 버퍼
  const bins = new Array<number>(BIN_COUNT).fill(0);
  const binWidth = plotWidth / BIN_COUNT;

  const HIT_RADIUS = 22;
  let grabbed: 'mean' | 'stddev' | null = null;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // stddev handle을 먼저 검사해 두 handle이 겹쳐도 폭을 집을 수 있게 한다
    if (Math.hypot(stddevHandle.x - p.x, stddevHandle.y - p.y) <= HIT_RADIUS) {
      grabbed = 'stddev';
    } else if (Math.hypot(meanHandle.x - p.x, meanHandle.y - p.y) <= HIT_RADIUS) {
      grabbed = 'mean';
    } else {
      grabbed = null;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    const x = Math.max(plotLeft, Math.min(plotRight, p.x));
    if (grabbed === 'mean') {
      // mean 이동 시 stddev handle도 같은 offset만큼 따라가 폭을 유지한다
      const offset = stddevHandle.x - meanHandle.x;
      meanHandle.x = x;
      stddevHandle.x = Math.max(plotLeft, Math.min(plotRight, x + offset));
    } else {
      stddevHandle.x = x;
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

  const render = (): void => {
    const mean = meanHandle.x;
    // stddev는 두 handle 사이 거리(px). 음수가 되지 않게 clamp (normal은 음수 stddev에 throw)
    const stddev = Math.max(0, stddevHandle.x - meanHandle.x);

    // 매 프레임 RNG를 같은 seed로 재생성해 동일한 샘플을 재현한다
    const rng = Random.createRng(SEED);
    bins.fill(0);
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      // 핵심 호출: 표준정규 z를 (mean, stddev)로 transform. stddev=0이면 항상 mean
      const v = Random.normal(mean, stddev, rng);
      // 샘플 값을 bin index로 환산 (표시 범위 밖은 양끝 bin에 clamp)
      const idx = Math.max(0, Math.min(BIN_COUNT - 1, Math.floor((v - plotLeft) / binWidth)));
      bins[idx]++;
    }

    // 막대 높이 정규화를 위한 최대 bin count
    let maxCount = 1;
    for (let i = 0; i < BIN_COUNT; i++) maxCount = Math.max(maxCount, bins[i]);

    // stddev=0이면 모든 샘플이 mean 한 bin에 모인다 (spike degenerate)
    const collapsed = stddev === 0;
    const barColor = collapsed ? 0xf87171 : 0x38bdf8;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 바닥선
    g.moveTo(plotLeft, baselineY).lineTo(plotRight, baselineY).stroke({ color: 0x334155, width: 1 });

    // 히스토그램 막대
    for (let i = 0; i < BIN_COUNT; i++) {
      const h = (bins[i] / maxCount) * plotHeight;
      if (h <= 0) continue;
      const bx = plotLeft + i * binWidth;
      g.rect(bx + 0.5, baselineY - h, binWidth - 1, h).fill({ color: barColor, alpha: 0.6 });
    }

    // 같은 관계의 기준선: 이론 정규분포 곡선을 히스토그램 면적에 맞춰 faint하게 깐다
    if (!collapsed) {
      // 막대 높이와 같은 스케일이 되도록 pdf 최대값(=중심)을 maxCount에 맞춘다
      const peak = 1 / (stddev * Math.sqrt(2 * Math.PI));
      let first = true;
      for (let px = plotLeft; px <= plotRight; px += 2) {
        const z = (px - mean) / stddev;
        const pdf = Math.exp(-0.5 * z * z) / (stddev * Math.sqrt(2 * Math.PI));
        const y = baselineY - (pdf / peak) * plotHeight;
        if (first) {
          g.moveTo(px, y);
          first = false;
        } else {
          g.lineTo(px, y);
        }
      }
      g.stroke({ color: 0xfacc15, width: 1.5, alpha: 0.45 });
    } else {
      // spike: mean 위치 수직선으로 모든 샘플이 한 곳에 모임을 표시
      g.moveTo(mean, plotTop).lineTo(mean, baselineY).stroke({ color: barColor, width: 2 });
    }

    // mean 위치 수직 guide
    g.moveTo(mean, plotTop - 8)
      .lineTo(mean, baselineY)
      .stroke({ color: 0x64748b, width: 1 });

    // handle 트랙과 두 handle (분포를 편집하는 보조 축)
    g.moveTo(plotLeft, trackY).lineTo(plotRight, trackY).stroke({ color: 0x1e293b, width: 1 });
    // mean↔stddev 폭을 잇는 선으로 stddev가 거리임을 보인다
    g.moveTo(meanHandle.x, trackY).lineTo(stddevHandle.x, trackY).stroke({ color: 0x475569, width: 2 });
    g.circle(meanHandle.x, trackY, grabbed === 'mean' ? 11 : 9).fill({ color: 0xe2e8f0 });
    g.circle(stddevHandle.x, trackY, grabbed === 'stddev' ? 11 : 9).fill({ color: barColor });

    label.text = [
      `mean    : ${(mean - plotLeft).toFixed(0)} px   drag white=mean, color=stddev`,
      `stddev  : ${stddev.toFixed(0)} px${collapsed ? '  (spike: 모든 샘플이 mean)' : ''}`,
      `samples : ${SAMPLE_COUNT}`,
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
