/**
 * Distribute Equal Gaps
 *
 * 오른쪽 anchor 박스를 drag하면 `distributeEquallyInto`가 양 끝 박스 사이에 놓인 중간 박스들을
 * 인접 간격이 모두 같아지는(`gap-x`) target 위치로 재분배한다. anchor를 멀리 끌수록 균등 간격이
 * 커지고, 가깝게 끌면 줄다가 중간 박스들이 겹치며 간격이 음수가 된다.
 *
 * - EditorGeometry.distributeEquallyInto: bounds 배열을 받아 정렬 기준 첫/마지막(양 끝 anchor)을
 *   제외한 중간 박스들의 새 top-left 좌표를 out 배열에 기록한다. `'gap-x'`는 인접 박스 사이
 *   간격을 균등화한다.
 */

import * as EditorGeometry from '@cp949/vectra/editor-geometry';

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

  const BOX_H = 80;
  const BAND_TOP = size.height / 2 - BOX_H / 2;

  // 박스 5개의 source 위치(top-left x)와 너비. box0=왼쪽 anchor(고정), box4=오른쪽 anchor(drag).
  // 중간 3개는 일부러 불균등/겹침으로 흩어둔 source 슬롯이고, 분배 결과는 따로 계산해 그린다.
  const srcX = [60, 115, 150, 180, 460];
  const boxW = [50, 40, 56, 44, 58];
  // 정렬 기준 첫(box0)/마지막(box4)은 분배에서 이동하지 않으므로 source x를 그대로 렌더한다.
  const LEFT_ANCHOR = 0;
  const RIGHT_ANCHOR = 4;

  // box4 drag 범위. 왼쪽 끝은 box3 source(180)보다 크게 잡아 box4가 항상 정렬상 마지막 anchor로
  // 유지되게 한다(입력 minVal 오름차순 정렬이라 box3 아래로 끌면 정렬이 뒤집힌다).
  const RIGHT_MIN = 185;
  const RIGHT_MAX = size.width - 12 - boxW[RIGHT_ANCHOR];

  // 매 프레임 재사용하는 분배 결과 버퍼. factory는 3-slot pool을 cursor로 돌려 프레임당 할당을 막는다.
  const targets: { index: number; point: XY }[] = [];
  const pointPool: XY[] = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];
  let poolCursor = 0;
  const factory = (): XY => pointPool[poolCursor++] ?? { x: 0, y: 0 };

  const grab = { dx: 0 };
  let dragging = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // 오른쪽 anchor 박스 hit test (단일 주 조작 대상)
  const insideRight = (p: XY): boolean => {
    const x = srcX[RIGHT_ANCHOR];
    return p.x >= x && p.x <= x + boxW[RIGHT_ANCHOR] && p.y >= BAND_TOP && p.y <= BAND_TOP + BOX_H;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    if (!insideRight(p)) return;
    dragging = true;
    grab.dx = p.x - srcX[RIGHT_ANCHOR];
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const p = getCanvasXY(e);
    // box4 left를 [RIGHT_MIN, RIGHT_MAX]로 clamp해 정렬 마지막 anchor 지위를 유지한다.
    srcX[RIGHT_ANCHOR] = Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, p.x - grab.dx));
  };

  const onPointerUp = (): void => {
    dragging = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1).padStart(7);

  // 분배된 렌더 x. 양 끝 anchor는 source 그대로, 중간은 distributeEqually 결과로 채운다.
  const renderX = [0, 0, 0, 0, 0];

  const render = (): void => {
    // 입력 bounds 배열을 source 위치로 구성한다(index 0..4 = box0..box4).
    const bounds = srcX.map((x, i) => ({
      min: { x, y: BAND_TOP },
      max: { x: x + boxW[i], y: BAND_TOP + BOX_H },
    }));

    // 핵심 호출: 'gap-x'로 중간 박스(index 1·2·3) target top-left를 out 배열에 기록한다.
    // 양 끝 anchor(정렬상 첫/마지막)는 이동하지 않아 출력에 포함되지 않는다.
    // 입력이 3개 미만이면 0을 반환하지만 여기선 5개라 미발생.
    poolCursor = 0;
    EditorGeometry.distributeEquallyInto(targets, bounds, 'gap-x', factory);

    // 양 끝 anchor는 source x 그대로 렌더한다.
    renderX[LEFT_ANCHOR] = srcX[LEFT_ANCHOR];
    renderX[RIGHT_ANCHOR] = srcX[RIGHT_ANCHOR];
    // 중간 박스는 분배 target x로 렌더한다.
    for (const t of targets) renderX[t.index] = t.point.x;

    // 진단값: 균등 간격은 box0.right→box1.left, span은 box0.right→box4.left.
    const box0Right = renderX[LEFT_ANCHOR] + boxW[LEFT_ANCHOR];
    const gap = renderX[1] - box0Right;
    const span = renderX[RIGHT_ANCHOR] - box0Right;
    const overlap = gap < 0; // 중간 박스가 겹치면 equalGap이 음수가 된다(겹침 경고)

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 중간 source 슬롯을 faint ghost로 깔아 "흩어진 입력 → 균등 출력" 변화를 보인다.
    for (let i = 1; i < RIGHT_ANCHOR; i++) {
      g.rect(srcX[i], BAND_TOP, boxW[i], BOX_H).stroke({ color: 0x475569, width: 1, alpha: 0.6 });
    }

    // 인접 박스 사이 등간격 bracket 4개. 모두 같은 값(=핵심 관계 증거). 음수면 warn 색.
    const cy = BAND_TOP + BOX_H + 18;
    for (let i = 0; i < RIGHT_ANCHOR; i++) {
      const x0 = renderX[i] + boxW[i];
      const x1 = renderX[i + 1];
      g.moveTo(x0, cy)
        .lineTo(x1, cy)
        .stroke({ color: overlap ? 0xf87171 : 0x38bdf8, width: 2 });
      g.moveTo(x0, cy - 5)
        .lineTo(x0, cy + 5)
        .stroke({ color: overlap ? 0xf87171 : 0x38bdf8, width: 1 });
      g.moveTo(x1, cy - 5)
        .lineTo(x1, cy + 5)
        .stroke({ color: overlap ? 0xf87171 : 0x38bdf8, width: 1 });
    }

    // 분배된 중간 박스(solid).
    for (let i = 1; i < RIGHT_ANCHOR; i++) {
      g.rect(renderX[i], BAND_TOP, boxW[i], BOX_H).fill({ color: overlap ? 0x7f1d1d : 0x334155 });
      g.rect(renderX[i], BAND_TOP, boxW[i], BOX_H).stroke({ color: 0xe2e8f0, width: 1.5 });
    }

    // 양 끝 anchor 박스(solid, 고정). 오른쪽은 drag 대상이라 강조한다.
    for (const i of [LEFT_ANCHOR, RIGHT_ANCHOR]) {
      const active = i === RIGHT_ANCHOR;
      g.rect(renderX[i], BAND_TOP, boxW[i], BOX_H).fill({ color: active && dragging ? 0x4ade80 : 0x0ea5e9 });
      g.rect(renderX[i], BAND_TOP, boxW[i], BOX_H).stroke({ color: 0xe2e8f0, width: 1.5 });
    }

    label.text = [
      `gap  : ${fmt(gap)} px${overlap ? '  (overlap!)' : ''}   drag the right anchor`,
      `span : ${fmt(span)} px`,
      `boxes: 5   (ends fixed, 3 middles distributed)`,
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
