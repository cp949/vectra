/**
 * Bezier Intersection Workbench
 *
 * quadratic/cubic Bezier 제어점과 기준 line handle을 드래그하면 curve-line, curve-curve,
 * cubic self-intersection hit의 위치와 parameter table이 함께 갱신된다.
 *
 * - Curves.quadraticLineIntersectionsInto / cubicLineIntersectionsInto: 기준 line과 curve의 hit 계산
 * - Curves.quadraticQuadraticIntersectionsInto / quadraticCubicIntersectionsInto / cubicCubicIntersectionsInto: curve pair hit 계산
 * - Curves.cubicSelfIntersectionsInto: loop cubic의 자기 교차점 계산
 * - Curves.cubicSample / cubicSampleInto: cubic hit debugging용 균등 sample marker 계산
 */

import * as Curves from '@cp949/vectra/curve';
import type { IntersectionHit } from '@cp949/vectra/types';

type Point = { x: number; y: number };
type Quadratic = { p0: Point; p1: Point; p2: Point };
type Cubic = { p0: Point; p1: Point; p2: Point; p3: Point };
type Hit = IntersectionHit<Point>;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 12 },
  });
  label.position.set(16, 14);
  app.stage.addChild(label);

  const quadA: Quadratic = {
    p0: { x: 78, y: 308 },
    p1: { x: 184, y: 80 },
    p2: { x: 306, y: 314 },
  };
  const quadB: Quadratic = {
    p0: { x: 74, y: 144 },
    p1: { x: 210, y: 370 },
    p2: { x: 322, y: 122 },
  };
  const cubicA: Cubic = {
    p0: { x: 390, y: 332 },
    p1: { x: 438, y: 62 },
    p2: { x: 650, y: 384 },
    p3: { x: 704, y: 136 },
  };
  const cubicB: Cubic = {
    p0: { x: 370, y: 156 },
    p1: { x: 500, y: 366 },
    p2: { x: 598, y: 74 },
    p3: { x: 724, y: 310 },
  };
  const lineOrigin = { x: 54, y: 236 };
  const lineEnd = { x: 714, y: 236 };

  const quadLineHits: Hit[] = [];
  const cubicLineHits: Hit[] = [];
  const quadQuadHits: Hit[] = [];
  const quadCubicHits: Hit[] = [];
  const cubicCubicHits: Hit[] = [];
  const selfHits: Hit[] = [];
  const sampleIntoPoints: Point[] = [];

  const controls = [
    quadA.p0,
    quadA.p1,
    quadA.p2,
    quadB.p0,
    quadB.p1,
    quadB.p2,
    cubicA.p0,
    cubicA.p1,
    cubicA.p2,
    cubicA.p3,
    cubicB.p0,
    cubicB.p1,
    cubicB.p2,
    cubicB.p3,
    lineOrigin,
    lineEnd,
  ];
  let grabbed: Point | undefined;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const findGrabTarget = (x: number, y: number): Point | undefined => {
    let best: Point | undefined;
    let bestDistance = 18;
    for (const point of controls) {
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < bestDistance) {
        best = point;
        bestDistance = distance;
      }
    }
    return best;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    grabbed = findGrabTarget(x, y);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const { x, y } = getCanvasXY(e);
    grabbed.x = Math.max(30, Math.min(size.width - 30, x));
    grabbed.y = Math.max(58, Math.min(size.height - 30, y));
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawHandle = (point: Point, color: number): void => {
    g.circle(point.x, point.y, 7).fill({ color });
  };

  const drawQuadratic = (curve: Quadratic, color: number, width: number): void => {
    g.moveTo(curve.p0.x, curve.p0.y).quadraticCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y).stroke({
      color,
      width,
    });
  };

  const drawCubic = (curve: Cubic, color: number, width: number): void => {
    g.moveTo(curve.p0.x, curve.p0.y)
      .bezierCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y, curve.p3.x, curve.p3.y)
      .stroke({ color, width });
  };

  const drawPolyline = (points: readonly Point[], color: number, width: number, alpha = 1): void => {
    if (points.length < 2) return;
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.stroke({ color, width, alpha });
  };

  const drawHits = (hits: readonly Hit[], color: number, radius: number): void => {
    for (const hit of hits) {
      g.circle(hit.point.x, hit.point.y, radius).fill({ color });
      g.circle(hit.point.x, hit.point.y, radius + 3).stroke({ color, width: 1 });
    }
  };

  const formatHits = (name: string, hits: readonly Hit[]): string => {
    if (hits.length === 0) return `${name}: -`;
    return `${name}: ${hits
      .map((hit) => `${hit.kind}@${hit.tA.toFixed(2)}/${hit.tB.toFixed(2)}`)
      .slice(0, 4)
      .join(' ')}`;
  };

  const render = (): void => {
    const line = {
      origin: lineOrigin,
      direction: { x: lineEnd.x - lineOrigin.x, y: lineEnd.y - lineOrigin.y },
    };
    const coarseCubicSamples = Curves.cubicSample(cubicA.p0, cubicA.p1, cubicA.p2, cubicA.p3, 10);
    Curves.cubicSampleInto(sampleIntoPoints, cubicB.p0, cubicB.p1, cubicB.p2, cubicB.p3, 16);
    Curves.quadraticLineIntersectionsInto(quadLineHits, quadA.p0, quadA.p1, quadA.p2, line);
    Curves.cubicLineIntersectionsInto(cubicLineHits, cubicA.p0, cubicA.p1, cubicA.p2, cubicA.p3, line);
    Curves.quadraticQuadraticIntersectionsInto(
      quadQuadHits,
      quadA.p0,
      quadA.p1,
      quadA.p2,
      quadB.p0,
      quadB.p1,
      quadB.p2
    );
    Curves.quadraticCubicIntersectionsInto(
      quadCubicHits,
      quadB.p0,
      quadB.p1,
      quadB.p2,
      cubicA.p0,
      cubicA.p1,
      cubicA.p2,
      cubicA.p3
    );
    Curves.cubicCubicIntersectionsInto(
      cubicCubicHits,
      cubicA.p0,
      cubicA.p1,
      cubicA.p2,
      cubicA.p3,
      cubicB.p0,
      cubicB.p1,
      cubicB.p2,
      cubicB.p3
    );
    Curves.cubicSelfIntersectionsInto(selfHits, cubicB.p0, cubicB.p1, cubicB.p2, cubicB.p3);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    g.moveTo(lineOrigin.x, lineOrigin.y).lineTo(lineEnd.x, lineEnd.y).stroke({ color: 0x94a3b8, width: 2 });
    drawHandle(lineOrigin, 0x94a3b8);
    drawHandle(lineEnd, 0x94a3b8);

    g.moveTo(quadA.p0.x, quadA.p0.y).lineTo(quadA.p1.x, quadA.p1.y).lineTo(quadA.p2.x, quadA.p2.y).stroke({
      color: 0x334155,
      width: 1,
    });
    g.moveTo(quadB.p0.x, quadB.p0.y).lineTo(quadB.p1.x, quadB.p1.y).lineTo(quadB.p2.x, quadB.p2.y).stroke({
      color: 0x334155,
      width: 1,
    });
    g.moveTo(cubicA.p0.x, cubicA.p0.y)
      .lineTo(cubicA.p1.x, cubicA.p1.y)
      .lineTo(cubicA.p2.x, cubicA.p2.y)
      .lineTo(cubicA.p3.x, cubicA.p3.y)
      .stroke({ color: 0x334155, width: 1 });
    g.moveTo(cubicB.p0.x, cubicB.p0.y)
      .lineTo(cubicB.p1.x, cubicB.p1.y)
      .lineTo(cubicB.p2.x, cubicB.p2.y)
      .lineTo(cubicB.p3.x, cubicB.p3.y)
      .stroke({ color: 0x334155, width: 1 });

    drawQuadratic(quadA, 0x38bdf8, 3);
    drawQuadratic(quadB, 0x22c55e, 3);
    drawCubic(cubicA, 0xf97316, 3);
    drawCubic(cubicB, 0xa78bfa, 3);
    drawPolyline(coarseCubicSamples, 0xfb923c, 1, 0.55);
    drawPolyline(sampleIntoPoints, 0xc4b5fd, 1, 0.65);

    drawHits(quadLineHits, 0xfacc15, 5);
    drawHits(cubicLineHits, 0xfacc15, 7);
    drawHits(quadQuadHits, 0x14b8a6, 5);
    drawHits(quadCubicHits, 0xec4899, 6);
    drawHits(cubicCubicHits, 0xef4444, 7);
    drawHits(selfHits, 0xffffff, 8);

    for (const point of controls) {
      if (point === lineOrigin || point === lineEnd) continue;
      drawHandle(point, 0xe2e8f0);
    }

    label.text = [
      'drag Bezier handles or the gray line',
      formatHits('quad-line', quadLineHits),
      formatHits('cubic-line', cubicLineHits),
      formatHits('quad-quad', quadQuadHits),
      formatHits('quad-cubic', quadCubicHits),
      formatHits('cubic-cubic', cubicCubicHits),
      formatHits('cubic-self', selfHits),
      `samples: cubicSample=${coarseCubicSamples.length} cubicSampleInto=${sampleIntoPoints.length}`,
    ].join('\n');
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
