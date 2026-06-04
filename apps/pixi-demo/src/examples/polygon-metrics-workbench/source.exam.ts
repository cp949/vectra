/**
 * Polygon Metrics Workbench
 *
 * polygon 꼭짓점과 probe 점을 드래그하면 probe가 polygon 안쪽, 경계, 바깥 중 어디에 있는지
 * 실시간으로 분류된다. centroid와 approximate bounding circle은 polygon이 바뀔 때 함께 갱신되어
 * 현재 polygon의 기준점과 범위를 확인할 수 있다.
 *
 * - Polygons.polygonFrom: 드래그 가능한 polygon point list 생성
 * - Polygons.classifyPoint: probe 점의 inside/boundary/outside 분류
 * - Polygons.centroid: polygon 중심 marker 계산
 * - Polygons.boundingCircle: point list를 감싸는 approximate circle 계산
 */

import * as Polygons from '@cp949/vectra/polygon';

type Point = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 14 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const polygon = Polygons.polygonFrom([
    { x: 190, y: 130 },
    { x: 430, y: 100 },
    { x: 590, y: 250 },
    { x: 500, y: 360 },
    { x: 240, y: 330 },
  ]);
  const probe: Point = { x: 420, y: 240 };

  const HIT_RADIUS = 18;
  const VERTEX_RADIUS = 8;
  let grabbed: Point | undefined;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clampToCanvas = (point: Point): void => {
    point.x = Math.max(24, Math.min(size.width - 24, point.x));
    point.y = Math.max(56, Math.min(size.height - 24, point.y));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const pointer = getCanvasXY(e);
    if (Math.hypot(probe.x - pointer.x, probe.y - pointer.y) <= HIT_RADIUS) {
      grabbed = probe;
      return;
    }

    for (const point of polygon.points) {
      if (Math.hypot(point.x - pointer.x, point.y - pointer.y) <= HIT_RADIUS) {
        grabbed = point;
        return;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const pointer = getCanvasXY(e);
    grabbed.x = pointer.x;
    grabbed.y = pointer.y;
    clampToCanvas(grabbed);
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const toPixiPoints = (points: readonly Point[]): number[] => points.flatMap((point) => [point.x, point.y]);

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    const centroid = Polygons.centroid(polygon) ?? { x: 0, y: 0 };
    const circle = Polygons.boundingCircle(polygon);
    const containment = Polygons.classifyPoint(polygon, probe, 4);
    const probeColor = containment === 'inside' ? 0x4ade80 : containment === 'boundary' ? 0xfacc15 : 0xf472b6;

    g.clear();

    g.circle(circle.center.x, circle.center.y, circle.radius).stroke({ color: 0x64748b, width: 1.5 });

    g.poly(toPixiPoints(polygon.points)).fill({ color: 0x1e293b, alpha: 0.34 }).stroke({
      color: 0xe2e8f0,
      width: 2.5,
    });

    g.moveTo(probe.x, probe.y).lineTo(centroid.x, centroid.y).stroke({ color: 0x475569, width: 1 });
    g.circle(centroid.x, centroid.y, 6).fill({ color: 0xfacc15 });
    g.circle(probe.x, probe.y, 10).fill({ color: probeColor });

    for (const point of polygon.points) {
      g.circle(point.x, point.y, VERTEX_RADIUS).fill({ color: 0x38bdf8 });
    }

    label.text = `probe=${containment}   vertices=${polygon.points.length}`;
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    g.destroy();
    label.destroy();
  };
}
