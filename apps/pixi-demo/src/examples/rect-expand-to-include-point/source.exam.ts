/**
 * Rect Expand To Include Point
 *
 * 화면 중앙 고정 base rect를 draggable probe point가 포함되도록 최소 확장한다. probe를 base
 * 밖으로 끌면 그 점이 넘어선 변(들)만 자라고(비대칭 expand-only), probe가 base 안이면 결과가
 * base와 같아 확장이 일어나지 않는다.
 *
 * - Rects.expandToIncludePointInto: base ∪ {probe}를 담는 최소 rect를 out-buffer에 기록한다.
 *   min(x, px)/max(right, px) 산식이라 point 방향으로만 자라며 절대 줄지 않는다(empty 분기 없음).
 */

import * as Rects from '@cp949/vectra/rect';

type XY = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };

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

  // base rect는 화면 중앙 고정 (확장의 기준이 되는 원본 box)
  const base: Rect = {
    x: size.width / 2 - 90,
    y: size.height / 2 - 60,
    width: 180,
    height: 120,
  };
  // probe point (주 drag 대상). 초기 위치는 base 오른쪽 아래 밖이라 두 변이 자란 상태
  const probe: XY = { x: base.x + base.width + 70, y: base.y + base.height + 40 };

  // 확장 결과를 매 프레임 기록할 out-buffer (companion이 없어 *Into 직접 사용, 1개 재사용)
  const expanded: Rect = { x: 0, y: 0, width: 0, height: 0 };

  const HIT_RADIUS = 22;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // probe와의 거리로 잡기 판정
    grabbed = Math.hypot(probe.x - p.x, probe.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // probe는 2D 자유 이동 (point 포함은 2D 관계)
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

  // base 변에서 expanded 변으로의 이동을 화살표로 표시 (이동한 변만 그려 비대칭 확장을 강조)
  const drawDelta = (fromX: number, fromY: number, toX: number, toY: number, color: number): void => {
    if (Math.abs(toX - fromX) + Math.abs(toY - fromY) < 1) return;
    g.moveTo(fromX, fromY).lineTo(toX, toY).stroke({ color, width: 1, alpha: 0.7 });
    g.circle(toX, toY, 2.5).fill({ color, alpha: 0.7 });
  };

  const render = (): void => {
    // 핵심 호출: base가 probe를 포함하도록 최소 확장. min/max 산식, 결과는 절대 base보다 작아지지 않음
    Rects.expandToIncludePointInto(expanded, base, probe);

    // probe가 base 안이면 확장이 없어 결과 == base (확장 없음)
    const inside = expanded.width === base.width && expanded.height === base.height;
    const hi = inside ? 0x64748b : 0x4ade80;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // expanded rect (point 방향으로 자란 최소 포함 box)
    g.rect(expanded.x, expanded.y, expanded.width, expanded.height)
      .fill({ color: hi, alpha: 0.12 })
      .stroke({ color: hi, width: 2 });

    // base rect (고정 기준, 점선 느낌의 중립색 외곽선)
    g.rect(base.x, base.y, base.width, base.height).stroke({ color: 0xcbd5e1, width: 2 });

    // 변 중점 기준으로 base→expanded 이동을 표시 (point가 넘어선 변만 화살표가 생긴다)
    const ecx = (expanded.x + expanded.x + expanded.width) / 2;
    const ecy = (expanded.y + expanded.y + expanded.height) / 2;
    const bcx = base.x + base.width / 2;
    const bcy = base.y + base.height / 2;
    drawDelta(base.x, bcy, expanded.x, ecy, hi); // 왼쪽 변
    drawDelta(base.x + base.width, bcy, expanded.x + expanded.width, ecy, hi); // 오른쪽 변
    drawDelta(bcx, base.y, ecx, expanded.y, hi); // 위쪽 변
    drawDelta(bcx, base.y + base.height, ecx, expanded.y + expanded.height, hi); // 아래쪽 변

    // probe point (주 대상). 항상 expanded 경계 위 또는 내부에 놓인다
    g.circle(probe.x, probe.y, grabbed ? 9 : 7).fill({ color: 0xf59e0b });

    label.text = [
      `inside : ${inside ? 'yes  (no expand)' : 'no   drag probe'}`,
      `width  : ${expanded.width.toFixed(1)}`,
      `height : ${expanded.height.toFixed(1)}`,
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
