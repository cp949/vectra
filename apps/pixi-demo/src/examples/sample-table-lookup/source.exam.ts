/**
 * Sample Table Lookup
 *
 * 균등 간격 scalar sample 배열을 꺾은선 그래프로 깔고, 가로 트랙의 probe를 drag하면 그 위치를
 * t∈[0,1]로 읽어 sampleTableAt가 표에서 linear 보간한 값을 marker로 표시한다. t=0은 첫 sample,
 * t=1은 마지막 sample에 정확히 닿고, 두 sample 사이는 직선 보간이라 marker가 꺾은선 위를 미끄러진다.
 *
 * - Interpolation.sampleTableAt: t∈[0,1]을 표 전체 범위로 매핑해 균등 간격 sample을 linear 보간 조회한다.
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

  // 균등 parameter 간격의 고정 scalar 표 (lookup table). 값은 [0, 1] 정규화 높이
  const table = [0.12, 0.62, 0.32, 0.88, 0.22, 0.7, 0.4];

  // 그래프 영역: x는 표 전체(t 0→1), y는 값 0→1을 위로
  const left = size.width * 0.12;
  const right = size.width * 0.88;
  const top = size.height * 0.2;
  const bottom = size.height * 0.8;
  const plotW = right - left;
  const plotH = bottom - top;

  // t∈[0,1] → 그래프 x, 값 v∈[0,1] → 그래프 y(위로 증가)
  const tToX = (t: number): number => left + plotW * t;
  const vToY = (v: number): number => bottom - plotH * v;
  // sample index i → 그 sample의 parameter 위치 t = i/(n-1) (균등 간격)
  const sampleT = (i: number): number => i / (table.length - 1);

  // 사용자가 끄는 유일한 대상: t 위치를 정하는 scrubber. 가로로만 이동한다
  const probe: XY = { x: tToX(0.5), y: bottom };

  const HIT_RADIUS = 22;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // probe는 트랙(bottom) 근처에서 가로 위치만 비교해 잡는다
    if (Math.abs(p.x - probe.x) <= HIT_RADIUS && Math.abs(p.y - bottom) <= HIT_RADIUS * 2) {
      grabbed = true;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // probe.x를 그래프 폭 안으로 clamp → t가 항상 [0,1] (sampleTableAt 기본 clamp 정책과 일치)
    probe.x = Math.max(left, Math.min(right, p.x));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(3).padStart(7);

  const render = (): void => {
    // probe.x를 그래프 폭 비율로 환산 → 조회 파라미터 t∈[0,1]
    const t = (probe.x - left) / plotW;
    // 핵심 호출: 균등 간격 표에서 t 위치 값을 linear 보간 조회 (기본 옵션 = linear + [0,1] clamp)
    const value = Interpolation.sampleTableAt(table, t);

    // 현재 t를 감싸는 두 sample index(보간 구간). t=1이면 floor가 n-1이 되므로 lower를 n-2로 clamp
    const pos = t * (table.length - 1);
    const lower = Math.min(table.length - 2, Math.floor(pos));
    const upper = lower + 1;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 그래프 axis 박스 (값 0~1 도메인 테두리)
    g.rect(left, top, plotW, plotH).stroke({ color: 0x1e293b, width: 2 });

    // 각 sample의 parameter 위치에 세로 가이드 → t 축이 균등 간격임을 보여준다
    for (let i = 0; i < table.length; i++) {
      const x = tToX(sampleT(i));
      g.moveTo(x, top).lineTo(x, bottom).stroke({ color: 0x1e293b, width: 1 });
    }

    // sample을 잇는 꺾은선 = sampleTableAt가 linear 보간하는 경로 그 자체
    g.moveTo(tToX(sampleT(0)), vToY(table[0]));
    for (let i = 1; i < table.length; i++) {
      g.lineTo(tToX(sampleT(i)), vToY(table[i]));
    }
    g.stroke({ color: 0x475569, width: 3 });

    // sample dot(표의 원소 = 보간 anchor). 현재 구간 양 끝 sample은 밝게 강조
    for (let i = 0; i < table.length; i++) {
      const active = i === lower || i === upper;
      g.circle(tToX(sampleT(i)), vToY(table[i]), active ? 6 : 4).fill({
        color: active ? 0x38bdf8 : 0x334155,
      });
    }

    const markerX = tToX(t);
    const markerY = vToY(value);

    // t 세로 scrubber 라인 (probe가 가리키는 파라미터 위치)
    g.moveTo(markerX, top).lineTo(markerX, bottom).stroke({ color: 0xfacc15, width: 1, alpha: 0.5 });

    // 조회 결과 marker: 꺾은선 위 보간점. probe t에 따라 선 위를 미끄러진다
    g.circle(markerX, markerY, 7).fill({ color: 0xfacc15 });

    // probe scrubber handle: 가로 트랙의 유일한 drag 대상
    g.circle(probe.x, bottom, grabbed ? 10 : 8).fill({ color: 0xf97316 });
    g.circle(probe.x, bottom, HIT_RADIUS).stroke({ color: 0xf97316, width: 1, alpha: 0.16 });

    label.text = [`t      : ${fmt(t)}   drag probe`, `value  : ${fmt(value)}`, `segment: ${lower} -> ${upper}`].join(
      '\n'
    );
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
