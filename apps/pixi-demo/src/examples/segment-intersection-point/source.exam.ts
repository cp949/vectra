/**
 * Segment Intersection Point
 *
 * 선분 A와 선분 B의 끝점 4개를 drag한다. 두 선분이 양쪽 범위 안에서 실제로 겹칠 때만 교점 marker가
 * 뜨고, 한쪽 선분을 연장해야만 만나는 위치로 끌면 marker가 사라진다. 이렇게 "무한 직선이 아니라 유한
 * 선분"이라는 점이 드러난다.
 *
 * - Segments.singleIntersection: 두 유한 선분의 단일 교점을 새 점으로 반환한다. 교점이 양쪽 선분의
 *   [0,1] 범위 밖이거나 두 선분이 평행/공선이면 undefined를 반환해 "교차 없음"을 알린다.
 */

import * as Segments from '@cp949/vectra/segment';

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

  // 선분 A의 두 끝점 (drag 대상)
  const a0: XY = { x: 140, y: 320 };
  const a1: XY = { x: 560, y: 150 };
  // 선분 B의 두 끝점 (drag 대상)
  const b0: XY = { x: 180, y: 130 };
  const b1: XY = { x: 540, y: 340 };

  // 4개 끝점을 한 배열로 두고 가장 가까운 것을 잡는다
  const handles: XY[] = [a0, a1, b0, b1];

  const HIT_RADIUS = 20;
  let grabbed: XY | null = null;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 가장 가까운 끝점을 HIT_RADIUS 안에서 선택
    let best: XY | null = null;
    let bestDist = HIT_RADIUS;
    for (const h of handles) {
      const d = Math.hypot(h.x - p.x, h.y - p.y);
      if (d <= bestDist) {
        best = h;
        bestDist = d;
      }
    }
    grabbed = best;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 잡은 끝점을 화면 안으로 clamp
    grabbed.x = Math.max(16, Math.min(size.width - 16, p.x));
    grabbed.y = Math.max(16, Math.min(size.height - 16, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1).padStart(7);

  const render = (): void => {
    // 두 끝점 쌍을 SegmentLike로 묶어 교차를 계산한다
    const segA = { a: a0, b: a1 };
    const segB = { a: b0, b: b1 };
    // 교점이 양쪽 선분 범위 안에 있을 때만 점, 아니면 undefined
    const hit = Segments.singleIntersection(segA, segB);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 선분 A (파랑)
    g.moveTo(a0.x, a0.y).lineTo(a1.x, a1.y).stroke({ color: 0x60a5fa, width: 3 });
    // 선분 B (분홍)
    g.moveTo(b0.x, b0.y).lineTo(b1.x, b1.y).stroke({ color: 0xf472b6, width: 3 });

    // 끝점 marker (A는 파랑, B는 분홍)
    for (const h of [a0, a1]) {
      g.circle(h.x, h.y, grabbed === h ? 9 : 7).fill({ color: 0x60a5fa });
    }
    for (const h of [b0, b1]) {
      g.circle(h.x, h.y, grabbed === h ? 9 : 7).fill({ color: 0xf472b6 });
    }

    if (hit) {
      // 교차할 때만 교점 marker를 노란색으로 강조
      g.circle(hit.x, hit.y, 8).fill({ color: 0xfacc15 });
      g.circle(hit.x, hit.y, 14).stroke({ color: 0xfacc15, width: 2, alpha: 0.5 });
    }

    label.text = [
      `status   : ${hit ? 'cross' : 'none '}   drag any endpoint`,
      `point.x  : ${hit ? fmt(hit.x) : '   -   '}`,
      `point.y  : ${hit ? fmt(hit.y) : '   -   '}`,
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
