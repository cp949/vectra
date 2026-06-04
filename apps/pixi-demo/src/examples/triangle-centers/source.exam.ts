/**
 * Triangle Centers
 *
 * 세 꼭짓점을 드래그하면 무게중심(centroid)·내심(incenter)·외심(circumcenter)과
 * 내접원(incircle)·외접원(circumcircle)이 실시간으로 다시 계산되어 표시된다. 세 점을
 * 한 직선에 가깝게 모으면 외심/외접원이 정의되지 않아 사라진다.
 *
 * - Triangles.centroidInto: 세 꼭짓점 평균인 무게중심 계산 (항상 정의됨)
 * - Triangles.incenterInto / Triangles.incircleInto: 내심과 내접원 계산 (degenerate면 false)
 * - Triangles.circumcenterInto / Triangles.circumcircleInto: 외심과 외접원 계산 (collinear면 false)
 */

import * as Triangles from '@cp949/vectra/triangle';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  // 드래그 가능한 triangle 꼭짓점 (local mutable 상태)
  const triangle = {
    a: { x: 200, y: 110 },
    b: { x: 560, y: 250 },
    c: { x: 260, y: 370 },
  };
  const vertices = [triangle.a, triangle.b, triangle.c];

  // center/circle 출력 buffer (매 프레임 재기록 hot path)
  const centroid = { x: 0, y: 0 };
  const incenter = { x: 0, y: 0 };
  const circumcenter = { x: 0, y: 0 };
  const incircle = { center: { x: 0, y: 0 }, radius: 0 };
  const circumcircle = { center: { x: 0, y: 0 }, radius: 0 };

  const VERTEX_RADIUS = 8;
  const HIT_TOLERANCE = 16;

  let grabbed: { x: number; y: number } | undefined;

  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    for (const v of vertices) {
      if (Math.hypot(v.x - x, v.y - y) < HIT_TOLERANCE) {
        grabbed = v;
        return;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const { x, y } = getCanvasXY(e);
    grabbed.x = Math.max(20, Math.min(700, x));
    grabbed.y = Math.max(20, Math.min(420, y));
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
    // 무게중심은 항상 정의된다.
    Triangles.centroidInto(centroid, triangle);

    // 내심/외심과 두 원은 degenerate(collinear)에서 false를 반환한다.
    const hasIn = Triangles.incenterInto(incenter, triangle) !== false;
    const hasInCircle = Triangles.incircleInto(incircle, triangle) !== false;
    const hasCirc = Triangles.circumcenterInto(circumcenter, triangle) !== false;
    const hasCircCircle = Triangles.circumcircleInto(circumcircle, triangle) !== false;

    g.clear();

    // triangle 변
    g.poly([triangle.a.x, triangle.a.y, triangle.b.x, triangle.b.y, triangle.c.x, triangle.c.y]).stroke({
      color: 0x64748b,
      width: 2,
    });

    // 외접원 (옅은 파랑)
    if (hasCircCircle) {
      g.circle(circumcircle.center.x, circumcircle.center.y, circumcircle.radius).stroke({
        color: 0x38bdf8,
        width: 1.5,
      });
    }

    // 내접원 (옅은 초록)
    if (hasInCircle) {
      g.circle(incircle.center.x, incircle.center.y, incircle.radius).stroke({
        color: 0x4ade80,
        width: 1.5,
      });
    }

    // center marker: centroid(노랑), incenter(초록), circumcenter(파랑)
    g.circle(centroid.x, centroid.y, 5).fill(0xfacc15);
    if (hasIn) g.circle(incenter.x, incenter.y, 5).fill(0x4ade80);
    if (hasCirc) g.circle(circumcenter.x, circumcenter.y, 5).fill(0x38bdf8);

    // 꼭짓점 (분홍)
    for (const v of vertices) {
      g.circle(v.x, v.y, VERTEX_RADIUS).fill(0xf472b6);
    }

    label.text = hasCirc
      ? 'centroid(노랑) incenter(초록) circumcenter(파랑) — 꼭짓점을 드래그'
      : '세 점이 거의 한 직선 — 외심/외접원 정의 안 됨';
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
