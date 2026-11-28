/**
 * Polygon Metrics Workbench
 *
 * polygon 꼭짓점과 probe 점을 드래그하면 probe가 polygon 안쪽, 경계, 바깥 중 어디에 있는지
 * 실시간으로 분류된다. centroid와 approximate bounding circle은 polygon이 바뀔 때 함께 갱신되어
 * 현재 polygon의 기준점과 범위를 확인할 수 있다.
 *
 * - Polygons.polygonFrom: 드래그 가능한 다각형 좌표 배열 생성
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

  const polygon = Polygons.polygonFrom([190, 130, 430, 100, 590, 250, 500, 360, 240, 330]);
  const probe: Point = { x: 420, y: 240 };

  const HIT_RADIUS = 18;
  const VERTEX_RADIUS = 8;
  let grabbed: number | undefined;

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
      grabbed = -1;
      return;
    }

    for (let i = 0; i < polygon.length; i += 2) {
      if (Math.hypot(polygon[i] - pointer.x, polygon[i + 1] - pointer.y) <= HIT_RADIUS) {
        grabbed = i;
        return;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (grabbed === undefined) return;
    const pointer = getCanvasXY(e);
    clampToCanvas(pointer);
    if (grabbed === -1) {
      probe.x = pointer.x;
      probe.y = pointer.y;
    } else {
      polygon[grabbed] = pointer.x;
      polygon[grabbed + 1] = pointer.y;
    }
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

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

    g.circle(circle.cx, circle.cy, circle.r).stroke({ color: 0x64748b, width: 1.5 });

    g.poly(polygon).fill({ color: 0x1e293b, alpha: 0.34 }).stroke({
      color: 0xe2e8f0,
      width: 2.5,
    });

    g.moveTo(probe.x, probe.y).lineTo(centroid.x, centroid.y).stroke({ color: 0x475569, width: 1 });
    g.circle(centroid.x, centroid.y, 6).fill({ color: 0xfacc15 });
    g.circle(probe.x, probe.y, 10).fill({ color: probeColor });

    for (let i = 0; i < polygon.length; i += 2) {
      g.circle(polygon[i], polygon[i + 1], VERTEX_RADIUS).fill({ color: 0x38bdf8 });
    }

    label.text = `probe=${containment}   vertices=${Polygons.pointCount(polygon)}`;
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
