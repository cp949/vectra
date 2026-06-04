/**
 * Triangle Medians Concurrency
 *
 * 세 꼭짓점을 드래그하면 각 꼭짓점에서 맞은편 변 중점으로 향하는 세 중선(median)이 다시
 * 그려진다. 세 중선은 삼각형 모양과 무관하게 항상 한 점(무게중심)에서 만나고, 무게중심은 각
 * 중선을 꼭짓점:중점 = 2:1로 나눈다. 이 공점성과 2:1 분할은 같은 관계의 두 표현이다.
 *
 * - Triangles.mediansInto: 세 vertex → 맞은편 side midpoint 중선 segment 3개를 한 번에 계산
 * - Triangles.centroidInto: 세 중선이 만나는 무게중심(세 꼭짓점 평균) 계산
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
    a: { x: 230, y: 100 },
    b: { x: 560, y: 250 },
    c: { x: 200, y: 380 },
  };
  const vertices = [triangle.a, triangle.b, triangle.c];

  // 중선 3개를 한 번에 담는 nested out-buffer (매 프레임 재기록 hot path)
  const medians = {
    a: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
    b: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
    c: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  };
  // 무게중심 out-buffer (매 프레임 재기록)
  const centroid = { x: 0, y: 0 };

  const VERTEX_RADIUS = 8;
  const HIT_TOLERANCE = 16;

  // 중선마다 다른 색 (A→a, B→b, C→c)
  const MEDIAN_COLORS = [0xf472b6, 0x38bdf8, 0xfacc15];

  let grabbed: { x: number; y: number } | undefined;

  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    // 가장 먼저 닿은 꼭짓점을 집는다.
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
    // 화면 안으로 clamp → 좌표는 항상 finite (non-finite pass-through 미발생)
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
    // 세 중선과 무게중심을 hot path buffer에 재기록한다.
    // degenerate(collinear/동일 꼭짓점)도 산식 그대로 적용돼 항상 정의된다.
    Triangles.mediansInto(medians, triangle);
    Triangles.centroidInto(centroid, triangle);

    g.clear();

    // triangle 세 변 (옅은 회색)
    g.poly([triangle.a.x, triangle.a.y, triangle.b.x, triangle.b.y, triangle.c.x, triangle.c.y]).stroke({
      color: 0x475569,
      width: 2,
    });

    // 세 중선 + 맞은편 변 중점 marker
    const list = [medians.a, medians.b, medians.c];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      const color = MEDIAN_COLORS[i];
      // m.a = source vertex, m.b = 맞은편 변 midpoint
      g.moveTo(m.a.x, m.a.y).lineTo(m.b.x, m.b.y).stroke({ color, width: 2 });
      g.circle(m.b.x, m.b.y, 4).fill(color); // midpoint marker
    }

    // 무게중심 G: 세 중선의 교점 (흰 점)
    g.circle(centroid.x, centroid.y, 6).fill(0xf8fafc);

    // 드래그 가능한 꼭짓점 (초록)
    for (const v of vertices) {
      g.circle(v.x, v.y, VERTEX_RADIUS).fill(0x4ade80);
    }

    // 중선 A(=A→BC 중점)에서 2:1 분할을 라이브 측정한다.
    // |AG| : |G·midpoint| 은 삼각형 모양과 무관하게 항상 2:1.
    const av = vertices[0];
    const mid = medians.a.b;
    const vertexToG = Math.hypot(centroid.x - av.x, centroid.y - av.y);
    const gToMid = Math.hypot(mid.x - centroid.x, mid.y - centroid.y);
    const ratio = gToMid > 0 ? vertexToG / gToMid : Number.POSITIVE_INFINITY;

    label.text =
      `centroid (${centroid.x.toFixed(0)}, ${centroid.y.toFixed(0)})  ` +
      `ratio ${ratio.toFixed(2)} : 1  —  꼭짓점을 드래그`;
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
