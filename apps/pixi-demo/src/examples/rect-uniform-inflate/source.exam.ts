/**
 * Rect Uniform Inflate
 *
 * 화면 중앙 고정 base rect에 inflate handle 1개를 drag하면 단일 amount로 사방을 동일하게
 * 넓히거나(margin) 좁힌(deflate) box를 갱신한다. amount가 음수로 깊어져 width 또는 height가
 * 0 이하가 되면 결과 box가 음수 크기로 붕괴하는 no-clamp 정책을 그대로 드러낸다.
 *
 * - Rects.inflateInto: base rect를 단일 amount로 사방 uniform inflate(x-=a, y-=a, w+=2a, h+=2a).
 *   결과 width/height를 clamp하지 않아 깊은 deflate에서 음수가 될 수 있다.
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

  // base rect는 화면 중앙 고정 (inflate 기준이 되는 원본 box)
  const base: Rect = {
    x: size.width / 2 - 110,
    y: size.height / 2 - 70,
    width: 220,
    height: 140,
  };
  // inflate amount를 조절하는 수평 트랙. handle은 이 y에 고정해 1 자유도로 둔다
  const trackY = base.y + base.height / 2;
  // inflate handle (주 drag 대상). 초기 x는 base 오른쪽 변 + 40px라 amount=+40(margin)
  const handle: XY = { x: base.x + base.width + 40, y: trackY };

  // inflated 결과를 매 프레임 기록할 out-buffer (companion이 없어 *Into 직접 사용, 1개 재사용)
  const inflated: Rect = { x: 0, y: 0, width: 0, height: 0 };

  const HIT_RADIUS = 24;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 트랙 핸들과의 거리로 잡기 판정
    grabbed = Math.hypot(handle.x - p.x, handle.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // x만 갱신하고 y는 트랙에 고정 (amount는 수평 변위로만 결정)
    handle.x = Math.max(16, Math.min(size.width - 16, p.x));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 한 변의 base→inflated 이동을 보여주는 화살표 (4변이 같은 amount로 움직임을 강조)
  const drawDelta = (fromX: number, fromY: number, toX: number, toY: number, color: number): void => {
    if (Math.abs(toX - fromX) + Math.abs(toY - fromY) < 1) return;
    g.moveTo(fromX, fromY).lineTo(toX, toY).stroke({ color, width: 1, alpha: 0.7 });
    g.circle(toX, toY, 2.5).fill({ color, alpha: 0.7 });
  };

  const render = (): void => {
    // amount = handle 수평 변위. base 오른쪽 변 기준이라 바깥(+)=margin, 안쪽(-)=deflate
    const amount = handle.x - (base.x + base.width);

    // 핵심 호출: 단일 amount로 사방 uniform inflate. width/height clamp 없음
    Rects.inflateInto(inflated, base, amount);

    // 결과 크기가 0 이하이면 음수 크기 붕괴 (no-clamp degenerate)
    const collapsed = inflated.width <= 0 || inflated.height <= 0;
    const hi = collapsed ? 0xf87171 : amount >= 0 ? 0x4ade80 : 0x38bdf8;

    // 그리기는 정규화한 extent를 쓴다 (음수 크기에서도 화면에 보이도록)
    const drawX = Math.min(inflated.x, inflated.x + inflated.width);
    const drawY = Math.min(inflated.y, inflated.y + inflated.height);
    const drawW = Math.abs(inflated.width);
    const drawH = Math.abs(inflated.height);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // base rect (고정 기준, 중립색 외곽선)
    g.rect(base.x, base.y, base.width, base.height).stroke({ color: 0x64748b, width: 2 });

    // inflated rect (margin=양수면 base 밖, deflate=음수면 base 안)
    g.rect(drawX, drawY, drawW, drawH).fill({ color: hi, alpha: 0.14 }).stroke({ color: hi, width: 2 });

    // 네 변 중점에서 base→inflated로 같은 amount만큼 이동함을 화살표로 표시
    const bcx = base.x + base.width / 2;
    const bcy = base.y + base.height / 2;
    drawDelta(base.x, bcy, inflated.x, bcy, hi); // 왼쪽 변
    drawDelta(base.x + base.width, bcy, inflated.x + inflated.width, bcy, hi); // 오른쪽 변
    drawDelta(bcx, base.y, bcx, inflated.y, hi); // 위쪽 변
    drawDelta(bcx, base.y + base.height, bcx, inflated.y + inflated.height, hi); // 아래쪽 변

    // 트랙과 inflate handle (주 대상)
    g.moveTo(16, trackY)
      .lineTo(size.width - 16, trackY)
      .stroke({ color: 0x1e293b, width: 1 });
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: hi });

    label.text = [
      `amount : ${amount.toFixed(1)} px   drag handle`,
      `width  : ${inflated.width.toFixed(1)}${collapsed && inflated.width <= 0 ? '  (collapsed)' : ''}`,
      `height : ${inflated.height.toFixed(1)}${collapsed && inflated.height <= 0 ? '  (collapsed)' : ''}`,
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
