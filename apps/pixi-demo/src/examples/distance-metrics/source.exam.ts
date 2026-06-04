/**
 * Distance Metrics
 *
 * 화면 중앙 anchor에서 draggable probe까지의 거리를 세 거리 척도로 본다. 같은 두 점이라도
 * 척도를 바꾸면 "anchor에서 probe까지와 같은 거리에 있는 점들"의 집합 모양이 달라진다.
 * 세 윤곽선은 모두 probe를 지나며, 각각 Euclidean=원, Manhattan=마름모, Chebyshev=정사각형이다.
 *
 * - Vectors.distance: Euclidean 거리. probe를 지나는 등거리 원의 반지름.
 * - Vectors.distanceSq: sqrt 없는 거리 제곱. 비교/정렬용 변형으로 같은 줄에 함께 표시.
 * - Vectors.manhattanDistance: |dx|+|dy|. 등거리 집합은 축에 닿는 마름모.
 * - Vectors.chebyshevDistance: max(|dx|,|dy|). 등거리 집합은 축 정렬 정사각형.
 */

import * as Vectors from '@cp949/vectra/vec';

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

  // anchor는 화면 중앙에 고정한다 (거리 척도 비교의 기준점)
  const anchor: XY = { x: size.width / 2, y: size.height / 2 };
  // probe는 사용자가 드래그하는 유일한 주 대상
  const probe: XY = { x: size.width / 2 + 150, y: size.height / 2 - 90 };

  const HIT_RADIUS = 20;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(probe.x - p.x, probe.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // probe를 화면 안으로 clamp (윤곽이 잘려도 거리값은 유효)
    probe.x = Math.max(20, Math.min(size.width - 20, p.x));
    probe.y = Math.max(20, Math.min(size.height - 20, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1).padStart(7);

  const render = (): void => {
    // 세 거리 척도를 같은 두 점에서 계산한다
    const euclid = Vectors.distance(anchor, probe);
    const euclidSq = Vectors.distanceSq(anchor, probe);
    const manhattan = Vectors.manhattanDistance(anchor, probe);
    const chebyshev = Vectors.chebyshevDistance(anchor, probe);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // anchor 기준 보조 축선 (dx, dy 성분을 눈으로 읽기 위함)
    g.moveTo(0, anchor.y).lineTo(size.width, anchor.y).stroke({ color: 0x1e293b, width: 1 });
    g.moveTo(anchor.x, 0).lineTo(anchor.x, size.height).stroke({ color: 0x1e293b, width: 1 });

    // Chebyshev 등거리 = max(|dx|,|dy|) 반경의 축 정렬 정사각형
    g.rect(anchor.x - chebyshev, anchor.y - chebyshev, chebyshev * 2, chebyshev * 2).stroke({
      color: 0xf472b6,
      width: 2,
      alpha: 0.85,
    });

    // Manhattan 등거리 = |dx|+|dy| 반경의 마름모 (꼭짓점이 축에 닿는다)
    g.moveTo(anchor.x + manhattan, anchor.y)
      .lineTo(anchor.x, anchor.y - manhattan)
      .lineTo(anchor.x - manhattan, anchor.y)
      .lineTo(anchor.x, anchor.y + manhattan)
      .lineTo(anchor.x + manhattan, anchor.y)
      .stroke({ color: 0x38bdf8, width: 2, alpha: 0.85 });

    // Euclidean 등거리 = 반지름이 distance인 원
    g.circle(anchor.x, anchor.y, euclid).stroke({ color: 0xfacc15, width: 2, alpha: 0.85 });

    // anchor -> probe 연결선
    g.moveTo(anchor.x, anchor.y).lineTo(probe.x, probe.y).stroke({ color: 0x64748b, width: 1, alpha: 0.7 });

    // anchor 마커
    g.circle(anchor.x, anchor.y, 5).fill({ color: 0xe2e8f0 });
    // probe 마커 (세 윤곽이 모두 이 점을 지난다)
    g.circle(probe.x, probe.y, grabbed ? 9 : 7).fill({ color: 0xfafafa });
    g.circle(probe.x, probe.y, HIT_RADIUS).stroke({ color: 0xfafafa, width: 1, alpha: 0.16 });

    label.text = [
      `euclidean  (circle)  : ${fmt(euclid)} px   (sq ${euclidSq.toFixed(0)})`,
      `manhattan  (diamond) : ${fmt(manhattan)} px`,
      `chebyshev  (square)  : ${fmt(chebyshev)} px   drag probe`,
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
