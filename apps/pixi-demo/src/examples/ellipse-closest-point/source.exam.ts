/**
 * Ellipse Closest Point
 *
 * probe 점을 drag하면 고정 ellipse 경계에서 probe에 가장 가까운 점을 찾아 marker로 스냅하고,
 * probe와 경계점을 잇는 연결선이 최단 거리를 보인다. rx≠ry 타원이라 최근접점은 center→probe
 * 방사선이 닿는 곳이 아니라 ellipse normal의 발이며(연결선이 경계에 수직), 내부 계산에
 * Newton-Raphson 반복이 쓰인다. probe를 ellipse 안으로 끌어도 marker는 경계 위에 남는다.
 *
 * - Ellipses.closestPoint: ellipse 경계에서 주어진 point에 가장 가까운 점을 반환한다. 내부 점도
 *   경계 위 closest로 투영하고, probe===center이면 θ₀=0 tie-break으로 (cx+radiusX, cy)를 반환한다.
 */

import * as Ellipses from '@cp949/vectra/ellipse';

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

  // 고정 ellipse. rx≠ry라 최근접점이 비방사적임을 드러낸다(circle이면 trivial)
  const ellipse = { center: { x: 360, y: 232 }, radiusX: 185, radiusY: 110 };

  // 단일 주 드래그 대상: probe 점. 초기 위치는 ellipse 밖
  const probe: XY = { x: 560, y: 96 };

  const HIT_RADIUS = 24;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // probe hit 반경 안에서 잡는다
    grabbed = Math.hypot(probe.x - p.x, probe.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // probe를 화면 안으로 clamp. ellipse 안으로 끌어도 경계 스냅을 볼 수 있다
    probe.x = Math.max(16, Math.min(size.width - 16, p.x));
    probe.y = Math.max(40, Math.min(size.height - 16, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1);

  const render = (): void => {
    const cx = ellipse.center.x;
    const cy = ellipse.center.y;

    // 경계 최근접점. pointermove당 1회 단발 계산이라 allocating companion을 쓴다
    const closest = Ellipses.closestPoint(ellipse, probe);

    // probe↔경계점 최단 거리. 이 연결선은 ellipse 경계에 수직(normal)이다
    const distance = Math.hypot(probe.x - closest.x, probe.y - closest.y);
    // 경계점의 parametric angle: closest = (cx+cos θ·rx, cy+sin θ·ry)
    const theta = Math.atan2((closest.y - cy) / ellipse.radiusY, (closest.x - cx) / ellipse.radiusX);
    const thetaDeg = (theta * 180) / Math.PI;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 ellipse 채움 + 외곽선
    g.ellipse(cx, cy, ellipse.radiusX, ellipse.radiusY)
      .fill({ color: 0xa78bfa, alpha: 0.16 })
      .stroke({ color: 0xa78bfa, width: 2 });

    // ellipse center marker
    g.circle(cx, cy, 3).fill({ color: 0x64748b });

    // probe↔경계점 연결선(최단 거리, 경계에 수직)
    g.moveTo(probe.x, probe.y).lineTo(closest.x, closest.y).stroke({ color: 0x38bdf8, width: 1.5 });

    // 경계 최근접 marker
    g.circle(closest.x, closest.y, 6).fill({ color: 0xfbbf24 });

    // probe marker. 잡았을 때 크게 그린다
    g.circle(probe.x, probe.y, grabbed ? 11 : 9).fill({ color: 0x38bdf8 });

    label.text = [
      'closest point on ellipse boundary   drag probe',
      `distance : ${fmt(distance)}`,
      `θ        : ${fmt(thetaDeg)}°`,
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
