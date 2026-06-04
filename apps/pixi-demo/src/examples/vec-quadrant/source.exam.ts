/**
 * Vector Quadrant
 *
 * 화면 중앙 고정 원점을 기준으로 probe를 drag하면 원점→probe 벡터가 몇 사분면에 있는지
 * quadrant 번호(Ⅰ~Ⅳ)로 분류하고, 해당 영역만 밝게 강조한다. probe를 x축이나 y축 위로 끌면
 * 번호가 0이 되어 어느 영역도 강조되지 않고 축이 강조되는 "축 위" degenerate 정책을 드러낸다.
 *
 * - Vectors.quadrant: 벡터의 (x, y) 부호로 사분면 번호를 반환한다(1~4, 축 위는 0). 수학 관례라
 *   y가 위로 양수이므로 벡터를 만들 때 화면 y를 뒤집어 표시 영역과 번호를 일치시킨다.
 */

import * as Vectors from '@cp949/vectra/vec';

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

  // 사분면 번호 라벨 4개(Ⅰ~Ⅳ). 위치는 render에서 각 영역 중앙에 맞춘다
  const romanTexts = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'].map((t) => {
    const txt = new PIXI.Text({
      text: t,
      style: { fill: 0x64748b, fontFamily: 'monospace', fontSize: 22 },
    });
    app.stage.addChild(txt);
    return txt;
  });

  // 원점은 화면 중앙 고정
  const origin: XY = { x: size.width / 2, y: size.height / 2 };
  // 판정 대상 probe (주 drag 대상)
  const probe: XY = { x: origin.x + 150, y: origin.y - 110 };

  // 사분면 번호 1~4를 배열 index 0~3에 대응시킨 색
  const quadColors = [0x38bdf8, 0xf472b6, 0xa78bfa, 0xfbbf24];
  const HIT_RADIUS = 24;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // probe 근처를 누르면 잡는다
    grabbed = Math.hypot(probe.x - p.x, probe.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 잡은 probe를 화면 안으로 clamp
    probe.x = Math.max(16, Math.min(size.width - 16, p.x));
    probe.y = Math.max(16, Math.min(size.height - 16, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const signStr = (n: number): string => (n > 0 ? '+' : n < 0 ? '-' : '0');

  const render = (): void => {
    // 화면 y는 아래로 증가하므로, 수학 관례(위가 양수)에 맞추려 y를 뒤집어 벡터를 만든다
    const v: XY = { x: probe.x - origin.x, y: origin.y - probe.y };
    // (x, y) 부호로 사분면 번호 결정. 축 위(x=0 또는 y=0)면 0
    const q = Vectors.quadrant(v);
    const onAxis = q === 0;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 4개 화면 영역을 각 사분면 색으로 칠한다. 현재 사분면만 진하게, 나머지는 옅게
    // 화면 좌표 영역 -> 표시 사분면 번호 매핑 (y-up 변환과 일치)
    const regions: { x: number; y: number; w: number; h: number; quad: number }[] = [
      { x: origin.x, y: 0, w: size.width - origin.x, h: origin.y, quad: 1 }, // 우상 = Ⅰ
      { x: 0, y: 0, w: origin.x, h: origin.y, quad: 2 }, // 좌상 = Ⅱ
      { x: 0, y: origin.y, w: origin.x, h: size.height - origin.y, quad: 3 }, // 좌하 = Ⅲ
      { x: origin.x, y: origin.y, w: size.width - origin.x, h: size.height - origin.y, quad: 4 }, // 우하 = Ⅳ
    ];
    for (const r of regions) {
      const active = !onAxis && r.quad === q;
      g.rect(r.x, r.y, r.w, r.h).fill({ color: quadColors[r.quad - 1], alpha: active ? 0.28 : 0.07 });
    }

    // 축 (원점 통과). 축 위 판정이면 강조해 degenerate 상태를 드러낸다
    const axisColor = onAxis ? 0xfacc15 : 0x475569;
    const axisWidth = onAxis ? 3 : 1.5;
    g.moveTo(0, origin.y).lineTo(size.width, origin.y).stroke({ color: axisColor, width: axisWidth });
    g.moveTo(origin.x, 0).lineTo(origin.x, size.height).stroke({ color: axisColor, width: axisWidth });

    // 원점→probe 벡터 화살표
    const arrowColor = onAxis ? 0xfacc15 : quadColors[q - 1];
    g.moveTo(origin.x, origin.y).lineTo(probe.x, probe.y).stroke({ color: arrowColor, width: 3 });
    const len = Math.hypot(probe.x - origin.x, probe.y - origin.y) || 1;
    const ux = (probe.x - origin.x) / len;
    const uy = (probe.y - origin.y) / len;
    const ah = 14;
    // 진행 방향에 수직인 벡터로 화살촉 양 날개를 만든다
    const nx = -uy;
    const ny = ux;
    const baseX = probe.x - ux * ah;
    const baseY = probe.y - uy * ah;
    g.moveTo(probe.x, probe.y)
      .lineTo(baseX + nx * (ah * 0.5), baseY + ny * (ah * 0.5))
      .lineTo(baseX - nx * (ah * 0.5), baseY - ny * (ah * 0.5))
      .closePath()
      .fill({ color: arrowColor });

    // 원점 marker
    g.circle(origin.x, origin.y, 5).fill({ color: 0xe2e8f0 });
    // probe marker (주 대상, 사분면 색)
    g.circle(probe.x, probe.y, grabbed ? 11 : 9).fill({ color: arrowColor });

    // 로마숫자 라벨을 각 영역 중앙에 배치하고, 현재 사분면만 밝게
    for (let i = 0; i < regions.length; i++) {
      const r = regions[i];
      const txt = romanTexts[i];
      txt.position.set(r.x + r.w / 2 - txt.width / 2, r.y + r.h / 2 - txt.height / 2);
      txt.style.fill = !onAxis && r.quad === q ? quadColors[r.quad - 1] : 0x64748b;
    }

    label.text = [
      `quadrant : ${onAxis ? 'on axis (0)' : `Q${q}`}   drag probe`,
      `sign x   : ${signStr(v.x)}`,
      `sign y   : ${signStr(v.y)}`,
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
    for (const txt of romanTexts) txt.destroy();
    g.destroy();
  };
}
