/**
 * Ellipse Uniform Expand
 *
 * 화면 중앙 고정 base ellipse(rx≠ry)에 세로 트랙 handle 1개를 drag하면 단일 delta로 두 반지름을
 * 같은 절대량만큼 동시에 키우거나(margin band) 줄인(deflate) 동심 ellipse를 갱신한다. delta가
 * 음수로 깊어져 한 반지름이 0 이하가 되면 그 축이 0으로 clamp되어 ellipse가 선/점으로 붕괴한다.
 *
 * - Ellipses.expandByInto: base ellipse를 단일 delta로 uniform 확장(radiusX+=delta, radiusY+=delta).
 *   center는 유지하고, 결과 radius가 음수이면 0으로 clamp한다(음수 반지름 없음).
 */

import * as Ellipses from '@cp949/vectra/ellipse';

type XY = { x: number; y: number };
type Ellipse = { center: XY; radiusX: number; radiusY: number };

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

  // base ellipse는 화면 중앙 고정 (확장 기준이 되는 원본). rx≠ry라 같은 delta가 두 반지름에
  // 더해질 때 이심률이 바뀌는 것을 드러낸다
  const base: Ellipse = {
    center: { x: size.width / 2, y: size.height / 2 },
    radiusX: 170,
    radiusY: 95,
  };

  // delta 세로 트랙. handle은 이 x에 고정해 1 자유도로 둔다 (delta는 수직 변위로만 결정)
  const trackX = size.width - 60;
  const trackTop = 70;
  const trackBottom = 370;
  // delta 범위: deflate가 두 반지름을 모두 0으로 붕괴(점)시키는 -(rx)-20까지 내려간다
  const deltaMax = 120;
  const deltaMin = -base.radiusX - 20;

  // delta → 트랙 y (top=deltaMax, bottom=deltaMin) 역매핑으로 handle 초기 위치를 잡는다
  const deltaToY = (d: number): number => {
    const r = (deltaMax - d) / (deltaMax - deltaMin); // d=max→0(top), d=min→1(bottom)
    return trackTop + r * (trackBottom - trackTop);
  };
  // 초기 delta = +40 (margin band)
  const handle: XY = { x: trackX, y: deltaToY(40) };

  // 확장 결과를 매 프레임 기록할 out-buffer (hot path buffer 재사용, allocating expandBy 미사용)
  const expanded: Ellipse = { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 0 };

  const HIT_RADIUS = 24;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(handle.x - p.x, handle.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // y만 갱신하고 x는 트랙에 고정 (delta는 수직 변위로만 결정)
    handle.y = Math.max(trackTop, Math.min(trackBottom, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 트랙 y → delta (top=deltaMax, bottom=deltaMin) 선형 매핑
  const yToDelta = (y: number): number => {
    const r = (y - trackTop) / (trackBottom - trackTop); // top→0, bottom→1
    return deltaMax - r * (deltaMax - deltaMin);
  };

  // 한 반지름 축의 base→expanded 끝점 이동을 화살표로 표시 (두 축이 같은 delta로 움직임을 강조)
  const drawAxisDelta = (fromX: number, fromY: number, toX: number, toY: number, color: number): void => {
    if (Math.abs(toX - fromX) + Math.abs(toY - fromY) < 1) return;
    g.moveTo(fromX, fromY).lineTo(toX, toY).stroke({ color, width: 1.5, alpha: 0.8 });
    g.circle(toX, toY, 2.5).fill({ color, alpha: 0.9 });
  };

  const render = (): void => {
    const delta = yToDelta(handle.y);

    // 핵심 호출: 단일 delta로 두 반지름 동시 확장. 결과 radius<0이면 0으로 clamp(음수 없음)
    Ellipses.expandByInto(expanded, base, delta);

    const cx = expanded.center.x;
    const cy = expanded.center.y;
    const rx = expanded.radiusX;
    const ry = expanded.radiusY;
    // 한 축이라도 0으로 붕괴하면(rx+delta<=0 또는 ry+delta<=0) warn 색
    const collapsed = rx <= 0 || ry <= 0;
    const hi = collapsed ? 0xf87171 : delta >= 0 ? 0x4ade80 : 0x38bdf8;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // base ellipse (고정 기준, 중립색 외곽선)
    g.ellipse(base.center.x, base.center.y, base.radiusX, base.radiusY).stroke({ color: 0x64748b, width: 2 });

    // expanded ellipse. 0-radius는 g.ellipse가 그리지 못하므로 선/점 fallback으로 붕괴를 보인다
    if (rx <= 0 && ry <= 0) {
      // 두 반지름 모두 0 → center 점으로 붕괴
      g.circle(cx, cy, 3).fill({ color: hi });
    } else if (ry <= 0) {
      // ry만 0 → 가로 선분으로 붕괴 (cx±rx)
      g.moveTo(cx - rx, cy)
        .lineTo(cx + rx, cy)
        .stroke({ color: hi, width: 2 });
    } else if (rx <= 0) {
      // rx만 0 → 세로 선분으로 붕괴 (cy±ry)
      g.moveTo(cx, cy - ry)
        .lineTo(cx, cy + ry)
        .stroke({ color: hi, width: 2 });
    } else {
      g.ellipse(cx, cy, rx, ry).fill({ color: hi, alpha: 0.14 }).stroke({ color: hi, width: 2 });
    }

    // +x축/+y축 radial delta 화살표: base 반지름 끝 → expanded 반지름 끝. 두 축이 같은 delta
    drawAxisDelta(base.center.x + base.radiusX, cy, cx + rx, cy, hi); // +x축
    drawAxisDelta(cx, base.center.y + base.radiusY, cx, cy + ry, hi); // +y축

    // 세로 트랙과 delta handle (주 대상). delta=0 지점에 기준 tick을 둔다
    g.moveTo(trackX, trackTop).lineTo(trackX, trackBottom).stroke({ color: 0x1e293b, width: 1 });
    const zeroY = deltaToY(0);
    g.moveTo(trackX - 8, zeroY)
      .lineTo(trackX + 8, zeroY)
      .stroke({ color: 0x475569, width: 1 });
    g.circle(handle.x, handle.y, grabbed ? 11 : 9).fill({ color: hi });

    label.text = [
      `delta   : ${delta.toFixed(1)} px   drag handle`,
      `radiusX : ${rx.toFixed(1)}${rx <= 0 ? '  (collapsed)' : ''}`,
      `radiusY : ${ry.toFixed(1)}${ry <= 0 ? '  (collapsed)' : ''}`,
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
