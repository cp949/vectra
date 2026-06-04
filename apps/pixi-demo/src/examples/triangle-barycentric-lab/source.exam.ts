/**
 * Triangle Barycentric Lab
 *
 * 세 꼭짓점과 probe 점을 드래그하면 probe의 inside/on-edge/outside 분류와 barycentric weight가
 * 갱신된다. 세 altitude와 orthocenter, bounds, orientation/type 진단도 함께 바뀌어 삼각형
 * 내부 좌표와 형태 판정을 한 화면에서 비교할 수 있다.
 *
 * - Triangles.classifyPoint: probe 점의 triangle 위치 분류
 * - Triangles.barycentric: probe 점의 A/B/C vertex weight 계산
 * - Triangles.altitudeInto: 각 꼭짓점에서 opposite side로 내린 altitude segment 계산
 * - Triangles.orthocenterInto: altitude 교차점인 orthocenter 계산
 * - Triangles.bounds: triangle을 감싸는 axis-aligned bounds 계산
 */

import * as Triangles from '@cp949/vectra/triangle';

type Point = { x: number; y: number };
type DragTarget = Point | undefined;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 14);
  app.stage.addChild(label);

  const triangle = {
    a: { x: 180, y: 330 },
    b: { x: 580, y: 155 },
    c: { x: 320, y: 390 },
  };
  const probe: Point = { x: 370, y: 285 };
  const vertices = [triangle.a, triangle.b, triangle.c];

  const altitudes = [
    { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
    { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
    { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  ];
  const orthocenter = { x: 0, y: 0 };

  const HIT_RADIUS = 18;
  const VERTEX_RADIUS = 8;
  let grabbed: DragTarget;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clampToCanvas = (point: Point): void => {
    point.x = Math.max(24, Math.min(size.width - 24, point.x));
    point.y = Math.max(58, Math.min(size.height - 24, point.y));
  };

  const onPointerDown = (e: PointerEvent): void => {
    const pointer = getCanvasXY(e);
    if (Math.hypot(probe.x - pointer.x, probe.y - pointer.y) <= HIT_RADIUS) {
      grabbed = probe;
      return;
    }

    for (const vertex of vertices) {
      if (Math.hypot(vertex.x - pointer.x, vertex.y - pointer.y) <= HIT_RADIUS) {
        grabbed = vertex;
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

  const trianglePoints = (): number[] => [
    triangle.a.x,
    triangle.a.y,
    triangle.b.x,
    triangle.b.y,
    triangle.c.x,
    triangle.c.y,
  ];

  const format = (value: number): string => value.toFixed(2);

  const typeLabel = (): string => {
    if (Triangles.isDegenerate(triangle, 0.5)) return 'degenerate';
    if (Triangles.isRight(triangle, 0.02)) return 'right';
    if (Triangles.isObtuse(triangle)) return 'obtuse';
    if (Triangles.isAcute(triangle)) return 'acute';
    return 'mixed';
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    const classification = Triangles.classifyPoint(triangle, probe, 3);
    const barycentric = Triangles.barycentric(triangle, probe);
    const bounds = Triangles.bounds(triangle);
    const hasOrthocenter = Triangles.orthocenterInto(orthocenter, triangle) !== false;
    const signedArea = Triangles.signedArea(triangle);
    const area = Triangles.area(triangle);
    const perimeter = Triangles.perimeter(triangle);
    const orientation = Triangles.isCounterClockwise(triangle)
      ? 'CCW'
      : Triangles.isClockwise(triangle)
        ? 'CW'
        : 'flat';
    const probeColor = classification === 'inside' ? 0x4ade80 : classification === 'on-edge' ? 0xfacc15 : 0xf472b6;

    for (let i = 0; i < 3; i++) {
      Triangles.altitudeInto(altitudes[i], triangle, i);
    }

    g.clear();

    g.rect(bounds.min.x, bounds.min.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y).stroke({
      color: 0x475569,
      width: 1,
    });

    g.poly(trianglePoints()).fill({ color: 0x1e293b, alpha: 0.38 }).stroke({ color: 0xe2e8f0, width: 2.5 });

    for (const altitude of altitudes) {
      g.moveTo(altitude.a.x, altitude.a.y).lineTo(altitude.b.x, altitude.b.y).stroke({
        color: 0x38bdf8,
        width: 1.5,
        alpha: 0.8,
      });
      g.circle(altitude.b.x, altitude.b.y, 4).fill({ color: 0x38bdf8 });
    }

    if (hasOrthocenter) {
      g.circle(orthocenter.x, orthocenter.y, 7).fill({ color: 0xfacc15 });
    }

    for (const vertex of vertices) {
      g.circle(vertex.x, vertex.y, VERTEX_RADIUS).fill({ color: 0x38bdf8 });
    }

    g.circle(probe.x, probe.y, 9).fill({ color: probeColor });

    label.text = barycentric
      ? `probe=${classification} bary=(${format(barycentric.x)}, ${format(barycentric.y)}, ${format(
          barycentric.w
        )}) area=${area.toFixed(1)} perimeter=${perimeter.toFixed(1)} signed=${signedArea.toFixed(
          1
        )} ${orientation}/${typeLabel()}`
      : `probe=${classification} bary=(undefined) area=${area.toFixed(1)} ${orientation}/${typeLabel()}`;
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
