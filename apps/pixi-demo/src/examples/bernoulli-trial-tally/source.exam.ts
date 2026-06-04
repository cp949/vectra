/**
 * Bernoulli Trial Tally
 *
 * 오른쪽 세로 track의 p knob을 끌어 성공 확률을 정하면, ticker가 매 프레임 그 확률로 베르누이 시행을
 * 누적하고 경험적 성공 빈도 막대가 p 기준선으로 수렴한다(대수의 법칙). p를 바꾸면 누적 tally를 같은
 * seed로 리셋해 새 p에서 수렴 과정을 다시 보여준다.
 *
 * - Random.bernoulli: 확률 p로 true, 1-p로 false를 반환하는 한 번의 시행. p<=0이면 항상 false,
 *   p>=1이면 항상 true.
 * - Random.createRng: 같은 seed에서 재현 가능한 난수 stream을 만든다. p 변경 시 같은 seed로 재생성해
 *   수렴 경로를 재현한다.
 */

import * as Random from '@cp949/vectra/random';

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

  // 재현 가능한 stream을 만드는 고정 seed. p 변경 시 같은 seed로 rng를 재생성한다
  const SEED = 'vectra-bernoulli-tally';
  // 프레임당 시행 수. 누적이 빨라 수렴이 눈에 보이되 한 번에 끝나지 않을 정도로 둔다
  const TRIALS_PER_FRAME = 6;

  // 막대가 자라 오르는 세로 plot 영역
  const baselineY = size.height - 70;
  const plotTop = 80;
  const plotHeight = baselineY - plotTop;

  // success(true) 막대와 complement(false) 막대 위치
  const barWidth = 120;
  const successX = 150;
  const failX = successX + barWidth + 60;

  // p knob을 올리고 내리는 세로 track (주 조작 대상)
  const trackX = size.width - 70;

  // 성공 확률(주 상태)과 누적 시행 카운트
  let p = 0.5;
  // p 변경 감지용. 직전 p와 달라지면 tally를 리셋한다
  let lastP = Number.NaN;
  let rng = Random.createRng(SEED);
  let trueCount = 0;
  let falseCount = 0;

  const HIT_RADIUS = 24;
  let grabbing = false;

  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // p knob의 현재 화면 y. p=0이 baseline, p=1이 plotTop에 오도록 매핑한다
  const knobY = (): number => baselineY - p * plotHeight;

  const onPointerDown = (e: PointerEvent): void => {
    const pt = getCanvasXY(e);
    if (Math.hypot(trackX - pt.x, knobY() - pt.y) <= HIT_RADIUS) {
      grabbing = true;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbing) return;
    const pt = getCanvasXY(e);
    // 화면 y를 [0,1] 확률로 역매핑하고 clamp한다. bernoulli는 [0,1] 밖이면 RangeError이므로
    // 이 clamp가 항상 유효 입력을 보장한다
    p = Math.max(0, Math.min(1, (baselineY - pt.y) / plotHeight));
  };

  const onPointerUp = (): void => {
    grabbing = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // dashed 수평선을 segment 단위로 그린다 (p 기준선 표시용)
  const dashedHLine = (x0: number, x1: number, y: number, color: number): void => {
    for (let x = x0; x < x1; x += 14) {
      g.moveTo(x, y).lineTo(Math.min(x + 8, x1), y);
    }
    g.stroke({ color, width: 2, alpha: 0.9 });
  };

  const render = (): void => {
    // p가 바뀌면 누적 tally와 rng stream을 같은 seed로 리셋해 새 p로 다시 수렴시킨다
    if (p !== lastP) {
      lastP = p;
      rng = Random.createRng(SEED);
      trueCount = 0;
      falseCount = 0;
    }

    // 이번 프레임 시행을 누적한다. p<=0이면 항상 false, p>=1이면 항상 true가 쌓인다
    for (let i = 0; i < TRIALS_PER_FRAME; i++) {
      if (Random.bernoulli(p, rng)) trueCount++;
      else falseCount++;
    }

    const total = trueCount + falseCount;
    // 경험적 성공 빈도. 시행이 쌓일수록 p로 수렴한다
    const successFreq = total > 0 ? trueCount / total : 0;

    // 양끝 p는 결정적(deterministic) 결과라 knob을 경고색으로 구분한다
    const deterministic = p <= 0 || p >= 1;
    const accent = 0x38bdf8;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // baseline (막대 바닥)
    g.moveTo(60, baselineY)
      .lineTo(failX + barWidth + 20, baselineY)
      .stroke({ color: 0x334155, width: 1 });

    // 각 막대의 0..1 전체 높이 frame (비율을 읽는 기준 테두리)
    g.rect(successX, plotTop, barWidth, plotHeight).stroke({ color: 0x1e293b, width: 1 });
    g.rect(failX, plotTop, barWidth, plotHeight).stroke({ color: 0x1e293b, width: 1 });

    // success(true) 막대: 높이 = 경험적 성공 빈도
    const successH = successFreq * plotHeight;
    if (successH > 0) {
      g.rect(successX, baselineY - successH, barWidth, successH).fill({ color: accent, alpha: 0.65 });
    }
    // complement(false) 막대: 높이 = 1 - 성공 빈도
    const failH = (1 - successFreq) * plotHeight;
    if (failH > 0) {
      g.rect(failX, baselineY - failH, barWidth, failH).fill({ color: 0x64748b, alpha: 0.55 });
    }

    // 같은 관계의 목표값: success 막대 위에 p 기준선을 깔아 막대 top이 수렴하는 곳을 보인다
    dashedHLine(successX - 8, successX + barWidth + 8, baselineY - p * plotHeight, 0xfacc15);

    // p knob track (주 조작 축)
    g.moveTo(trackX, plotTop).lineTo(trackX, baselineY).stroke({ color: 0x1e293b, width: 2 });
    // track 위 p 위치와 같은 높이를 잇는 guide로 knob이 p 기준선과 같은 높이임을 보인다
    g.moveTo(successX - 8, baselineY - p * plotHeight)
      .lineTo(trackX, knobY())
      .stroke({ color: 0x475569, width: 1, alpha: 0.5 });
    g.circle(trackX, knobY(), grabbing ? 12 : 10).fill({
      color: deterministic ? 0xf87171 : 0xe2e8f0,
    });

    label.text = [
      `p           : ${p.toFixed(3)}${deterministic ? '  (deterministic)' : ''}  drag knob (right)`,
      `success freq: ${successFreq.toFixed(3)}  → p`,
      `samples     : ${total}`,
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
