/**
 * Weighted Loot Table
 *
 * 오른쪽 세로 track의 노브를 끌어 가장 희귀한 등급(legendary)의 드롭 가중치를 정하면, ticker가
 * 매 프레임 그 가중치 분포로 드롭을 누적하고 각 등급의 경험적 드롭 빈도 막대가 `weight/total`
 * 목표 비율(점선 tick)로 수렴한다. legendary 가중치를 바꾸면 같은 seed로 tally를 리셋해 새 분포에서
 * 수렴 과정을 다시 보여준다.
 *
 * - Randomx.weightedChoice: 등급 index 배열에서 가중치 비율대로 한 등급을 뽑는 한 번의 드롭.
 *   음수/non-finite/length 불일치 weight면 RangeError이므로 가중치는 항상 양의 유한값으로 둔다.
 * - Randomx.createRng: 같은 seed에서 재현 가능한 난수 stream을 만든다. legendary 가중치 변경 시
 *   같은 seed로 재생성해 수렴 경로를 재현한다.
 */

import * as Randomx from '@cp949/vectra/random';

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

  // 재현 가능한 stream을 만드는 고정 seed. legendary 가중치 변경 시 같은 seed로 rng를 재생성한다
  const SEED = 'vectra-weighted-loot-table';
  // 프레임당 드롭 수. 누적이 빨라 수렴이 눈에 보이되 한 번에 끝나지 않을 정도로 둔다
  const DRAWS_PER_FRAME = 8;

  // 등급 정의. index가 weightedChoice의 item이고, 색은 막대/이름 표시에만 쓴다
  const tiers = [
    { name: 'common', color: 0x94a3b8 },
    { name: 'uncommon', color: 0x4ade80 },
    { name: 'rare', color: 0x38bdf8 },
    { name: 'legendary', color: 0xfacc15 },
  ];
  const LEGENDARY = tiers.length - 1;
  const items = tiers.map((_, i) => i);
  // common/uncommon/rare 가중치는 고정. legendary만 노브로 바꾼다
  const FIXED_WEIGHTS = [64, 24, 10];
  // legendary 가중치 clamp 범위. 항상 양수라 positive 합계 0(=undefined)이 발생하지 않는다
  const WEIGHT_MIN = 0.5;
  const WEIGHT_MAX = 40;

  // 막대 plot 영역
  const barLeft = 170;
  const barMaxWidth = size.width - barLeft - 150;
  const rowTop = 90;
  const rowGap = 78;
  const barHeight = 34;

  // legendary 가중치 노브를 올리고 내리는 세로 track (주 조작 대상)
  const trackX = size.width - 70;
  const trackTop = rowTop;
  const trackBottom = rowTop + (tiers.length - 1) * rowGap + barHeight;

  // legendary 가중치(주 상태)와 등급별 누적 드롭 카운트
  let legendaryWeight = 4;
  // 가중치 변경 감지용. 직전 값과 달라지면 tally를 리셋한다
  let lastWeight = Number.NaN;
  let rng = Randomx.createRng(SEED);
  const counts = new Array<number>(tiers.length).fill(0);

  const HIT_RADIUS = 24;
  let grabbing = false;

  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // legendary 가중치를 track 위 y로 매핑한다. WEIGHT_MIN이 bottom, WEIGHT_MAX가 top에 온다
  const knobY = (): number => {
    const t = (legendaryWeight - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN);
    return trackBottom - t * (trackBottom - trackTop);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const pt = getCanvasXY(e);
    if (Math.hypot(trackX - pt.x, knobY() - pt.y) <= HIT_RADIUS) {
      grabbing = true;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbing) return;
    const pt = getCanvasXY(e);
    // 화면 y를 [0,1]로 역매핑한 뒤 [WEIGHT_MIN, WEIGHT_MAX]로 확대하고 clamp한다.
    // 이 clamp가 weightedChoice에 항상 양의 유한 가중치를 보장한다
    const t = (trackBottom - pt.y) / (trackBottom - trackTop);
    const clamped = Math.max(0, Math.min(1, t));
    legendaryWeight = WEIGHT_MIN + clamped * (WEIGHT_MAX - WEIGHT_MIN);
  };

  const onPointerUp = (): void => {
    grabbing = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 등급 이름을 막대 왼쪽에 한 번만 그려둔다 (scene 축 라벨, diagnostics 아님)
  const nameLabels = tiers.map((tier, i) => {
    const t = new PIXI.Text({
      text: tier.name,
      style: { fill: tier.color, fontFamily: 'monospace', fontSize: 13 },
    });
    t.position.set(28, rowTop + i * rowGap + barHeight / 2 - 8);
    app.stage.addChild(t);
    return t;
  });

  // dashed 세로선을 짧은 segment로 그린다 (목표 비율 tick 표시용)
  const dashedVLine = (x: number, y0: number, y1: number, color: number): void => {
    for (let y = y0; y < y1; y += 10) {
      g.moveTo(x, y).lineTo(x, Math.min(y + 6, y1));
    }
    g.stroke({ color, width: 2, alpha: 0.95 });
  };

  const render = (): void => {
    // legendary 가중치가 바뀌면 누적 tally와 rng stream을 같은 seed로 리셋해 새 분포로 다시 수렴시킨다
    if (legendaryWeight !== lastWeight) {
      lastWeight = legendaryWeight;
      rng = Randomx.createRng(SEED);
      counts.fill(0);
    }

    // 이번 프레임 가중치 벡터. legendary만 가변, 나머지는 고정값을 이어붙인다
    const weights = [...FIXED_WEIGHTS, legendaryWeight];
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // 이번 프레임 드롭을 누적한다. 가중치가 큰 등급일수록 더 자주 뽑힌다
    for (let i = 0; i < DRAWS_PER_FRAME; i++) {
      const picked = Randomx.weightedChoice(items, weights, rng);
      if (picked !== undefined) counts[picked]++;
    }

    const totalDraws = counts.reduce((sum, c) => sum + c, 0);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i] as { name: string; color: number };
      const rowY = rowTop + i * rowGap;
      // 0..1 전체 폭 frame (비율을 읽는 기준 테두리)
      g.rect(barLeft, rowY, barMaxWidth, barHeight).stroke({ color: 0x1e293b, width: 1 });

      // 경험적 드롭 빈도 막대: 길이 = count / 전체 드롭 수
      const freq = totalDraws > 0 ? (counts[i] as number) / totalDraws : 0;
      const w = freq * barMaxWidth;
      if (w > 0) {
        g.rect(barLeft, rowY, w, barHeight).fill({ color: tier.color, alpha: 0.65 });
      }

      // 같은 관계의 목표값: weight/total 비율 위치에 점선 tick을 깔아 막대 끝이 수렴하는 곳을 보인다
      const targetX = barLeft + ((weights[i] as number) / totalWeight) * barMaxWidth;
      dashedVLine(targetX, rowY - 6, rowY + barHeight + 6, 0xf472b6);
    }

    // legendary 가중치 track (주 조작 축)
    g.moveTo(trackX, trackTop).lineTo(trackX, trackBottom).stroke({ color: 0x1e293b, width: 2 });
    // legendary 막대 row와 knob을 잇는 guide로 노브가 legendary 등급을 조작함을 보인다
    const legendaryRowY = rowTop + LEGENDARY * rowGap + barHeight / 2;
    g.moveTo(barLeft + barMaxWidth + 8, legendaryRowY)
      .lineTo(trackX, knobY())
      .stroke({ color: 0x475569, width: 1, alpha: 0.5 });
    g.circle(trackX, knobY(), grabbing ? 12 : 10).fill({ color: 0xfacc15 });

    // legendary 등급의 경험적 빈도와 목표 비율 (수렴 대상 관계의 핵심 읽기)
    const legendaryFreq = totalDraws > 0 ? (counts[LEGENDARY] as number) / totalDraws : 0;
    const legendaryTarget = legendaryWeight / totalWeight;

    label.text = [
      `legendary weight : ${legendaryWeight.toFixed(1)}  (fixed 64/24/10)  drag knob (right)`,
      `legendary freq   : ${legendaryFreq.toFixed(3)}  →  target ${legendaryTarget.toFixed(3)}`,
      `samples          : ${totalDraws}`,
    ].join('\n');
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    for (const t of nameLabels) t.destroy();
    label.destroy();
    g.destroy();
  };
}
