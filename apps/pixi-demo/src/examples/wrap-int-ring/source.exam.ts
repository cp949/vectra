/**
 * Wrap Int Ring
 *
 * 정수 슬롯 ring(0..7) 아래 가로 트랙에서 scrubber를 drag해 정수 raw를 정하면, 같은 raw를 두 wrap
 * 함수가 ring 인덱스로 감싼다. raw가 ring 범위 [0,7] 밖(음수/큰 값)이어도 cyclic으로 돌아와 항상
 * 유효한 슬롯을 가리킨다. inclusive `[0,7]`는 슬롯 8개 전부에 도달하지만, half-open `[0,7)`는 상한
 * 슬롯(=7)을 제외(span이 1 작음)해 같은 raw가 한 슬롯 차이로 갈리는 두 range convention을 한 ring에
 * 드러낸다.
 *
 * - Maths.wrapIntInclusive: raw를 closed range [0,7]로 감싼 슬롯 인덱스. 상한 7 포함(슬롯 8개 도달).
 * - Maths.wrapIntHalfOpen: raw를 half-open range [0,7)로 감싼 슬롯 인덱스. 상한 7 제외(raw=7 → 0).
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

  // ring 구성: 슬롯 0..MAX를 원 둘레에 등각 배치한다. wrap 범위는 [MIN, MAX]
  const SLOTS = 8;
  const MIN = 0;
  const MAX = SLOTS - 1; // = 7. inclusive 상한이자 half-open이 제외하는 슬롯
  const cx = 280;
  const cy = 230;
  const R = 150;

  // 슬롯 i의 중심 좌표. 12시(top)에서 시계방향으로 등각 배치
  const slotXY = (i: number): XY => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / SLOTS;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  };

  // 슬롯 인덱스 라벨(0..7). PIXI.Text로만 글자를 그린다(g.text 미사용)
  const slotLabels: PIXI.Text[] = [];
  for (let i = 0; i < SLOTS; i++) {
    const t = new PIXI.Text({
      text: String(i),
      style: { fill: 0x94a3b8, fontFamily: 'monospace', fontSize: 13 },
    });
    t.anchor.set(0.5);
    const p = slotXY(i);
    t.position.set(p.x, p.y - 26); // 슬롯 dot 바깥쪽에 인덱스 표기
    app.stage.addChild(t);
    slotLabels.push(t);
  }

  // raw scrubber: 정수 raw를 정하는 유일한 drag 대상. ring 범위 밖 정수도 포함
  const MARGIN = 48;
  const trackY = 392;
  const trackLeft = MARGIN;
  const trackRight = size.width - MARGIN;
  const RAW_MIN = -10; // ring 범위 [0,7] 양옆으로 넉넉히 둬서 cyclic wrap을 보인다
  const RAW_MAX = 18;

  // raw(정수) ↔ 트랙 x 좌표 변환
  const xAtRaw = (raw: number): number =>
    trackLeft + ((raw - RAW_MIN) / (RAW_MAX - RAW_MIN)) * (trackRight - trackLeft);
  const rawAtX = (x: number): number => {
    const t = (x - trackLeft) / (trackRight - trackLeft);
    return RAW_MIN + t * (RAW_MAX - RAW_MIN);
  };

  let raw = 3; // 초기 raw(정수)
  let grabbed = false;

  const HIT_RADIUS = 22;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // knob 근처를 눌렀을 때만 잡는다
    grabbed = Math.hypot(xAtRaw(raw) - p.x, trackY - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 드래그 위치를 정수 raw로 snap한다(wrapInt*는 safe integer만 받음). 범위로 clamp
    raw = Math.max(RAW_MIN, Math.min(RAW_MAX, Math.round(rawAtX(p.x))));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => String(n).padStart(4);

  const render = (): void => {
    // 같은 정수 raw를 두 range convention으로 ring 인덱스에 감싼다(scalar 반환, *Into 없음)
    // - inclusive [0,7]: span 8 → 슬롯 0..7 전부 도달
    // - half-open [0,7): span 7 → 슬롯 0..6 도달, raw=7은 0으로 접힘(슬롯 7 제외)
    // 음수 raw도 positive modulo로 ring 안으로 감긴다(raw=-1 → inc 7, half 6)
    const inc = Maths.wrapIntInclusive(raw, MIN, MAX);
    const half = Maths.wrapIntHalfOpen(raw, MIN, MAX);
    // 두 결과가 갈리는 경계(상한/음수 wrap)면 강조선을 잇는다
    const diverged = inc !== half;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // ring 윤곽(슬롯이 놓인 원)
    g.circle(cx, cy, R).stroke({ color: 0x334155, width: 2 });

    // 슬롯 dot: 기본은 어두운 점. 슬롯 MAX(=7)는 half-open이 절대 못 닿아 warn 윤곽으로 표시
    for (let i = 0; i < SLOTS; i++) {
      const p = slotXY(i);
      const isExcluded = i === MAX; // half-open [0,7)이 제외하는 상한 슬롯
      g.circle(p.x, p.y, 10).fill({ color: 0x1e293b });
      if (isExcluded) {
        g.circle(p.x, p.y, 14).stroke({ color: 0xf59e0b, width: 2, alpha: 0.7 });
      } else {
        g.circle(p.x, p.y, 10).stroke({ color: 0x475569, width: 1 });
      }
    }

    // inc/half가 갈리면 두 슬롯을 잇는 연결선(한 슬롯 차이를 시각화)
    if (diverged) {
      const a = slotXY(inc);
      const b = slotXY(half);
      g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ color: 0x64748b, width: 1.5, alpha: 0.6 });
    }

    // inclusive marker: 채운 원(상한 슬롯에도 도달 가능)
    const incP = slotXY(inc);
    g.circle(incP.x, incP.y, 13).fill({ color: 0x22d3ee });

    // half-open marker: 윤곽 ring(상한 슬롯 제외). inc와 겹치면 한 슬롯에 합쳐 보인다
    const halfP = slotXY(half);
    g.circle(halfP.x, halfP.y, 18).stroke({ color: 0xfacc15, width: 3 });

    // raw scrubber 트랙 baseline
    g.moveTo(trackLeft, trackY).lineTo(trackRight, trackY).stroke({ color: 0x334155, width: 2 });

    // in-range zone [MIN, MAX]: 이 밖의 정수도 ring으로 감긴다는 대비를 위해 강조
    g.rect(xAtRaw(MIN), trackY - 6, xAtRaw(MAX) - xAtRaw(MIN), 12).fill({
      color: 0x1d4ed8,
      alpha: 0.25,
    });

    // 정수 tick: 각 raw 값 위치에 눈금
    for (let v = RAW_MIN; v <= RAW_MAX; v++) {
      const x = xAtRaw(v);
      g.moveTo(x, trackY - 7)
        .lineTo(x, trackY + 7)
        .stroke({ color: 0x1e293b, width: 1 });
    }

    // scrubber knob: 유일한 drag 대상
    const kx = xAtRaw(raw);
    g.circle(kx, trackY, grabbed ? 11 : 9).fill({ color: 0xfacc15 });
    g.circle(kx, trackY, HIT_RADIUS).stroke({ color: 0xfacc15, width: 1, alpha: 0.16 });

    label.text = [
      `raw      : ${fmt(raw)}    drag scrubber`,
      `inclusive: ${fmt(inc)}    [${MIN},${MAX}] reaches all ${SLOTS}`,
      `half-open: ${fmt(half)}    [${MIN},${MAX}) skips slot ${MAX}`,
    ].join('\n');
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    for (const t of slotLabels) t.destroy();
    label.destroy();
    g.destroy();
  };
}
