import * as Random from '@cp949/vectra/random';
import * as Segment from '@cp949/vectra/segment';
import * as Vec from '@cp949/vectra/vec';
import * as PIXI from 'pixi.js';

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
  rng: () => number;
};

const POINT_COUNT = 55;
const CONNECT_DIST = 130;

export async function setup({ app, size, rng }: Runtime) {
  // seeded rng를 RandomSource로 사용
  const randomSource = rng;

  // 점 생성: bounds 내 무작위 배치
  const bounds = {
    min: { x: size.width * 0.05, y: size.height * 0.05 },
    max: { x: size.width * 0.95, y: size.height * 0.95 },
  };

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < POINT_COUNT; i++) {
    const p = Random.pointInBounds(bounds, randomSource);
    if (p) points.push({ ...p });
  }

  // 각 점의 느린 유동 속도 (seed 기반)
  const drifts = points.map(() => ({
    x: (rng() - 0.5) * 0.4,
    y: (rng() - 0.5) * 0.4,
  }));

  const gfx = new PIXI.Graphics();
  app.stage.addChild(gfx);

  function tick() {
    gfx.clear();

    // 점 이동 + 경계 반사
    for (let i = 0; i < points.length; i++) {
      points[i].x += drifts[i].x;
      points[i].y += drifts[i].y;
      if (points[i].x < bounds.min.x || points[i].x > bounds.max.x) drifts[i].x *= -1;
      if (points[i].y < bounds.min.y || points[i].y > bounds.max.y) drifts[i].y *= -1;
    }

    // 가까운 점끼리 선 연결
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = Vec.distance(points[i], points[j]);
        if (d < CONNECT_DIST) {
          const alpha = 1 - d / CONNECT_DIST;
          // segment midpoint를 활용해 중간 색상 계산
          const mid = Segment.midpoint({ a: points[i], b: points[j] });
          gfx
            .moveTo(points[i].x, points[i].y)
            .lineTo(points[j].x, points[j].y)
            .stroke({ color: 0x93c5fd, width: 1, alpha: alpha * 0.7 });
          // midpoint 강조점
          if (alpha > 0.85) {
            gfx.circle(mid.x, mid.y, 2).fill({ color: 0xbfdbfe, alpha: 0.5 });
          }
        }
      }
    }

    // 별 점
    for (const p of points) {
      gfx.circle(p.x, p.y, 2.5).fill({ color: 0xe2e8f0, alpha: 0.9 });
    }
  }

  app.ticker.add(tick);
  return () => {
    app.ticker.remove(tick);
    gfx.destroy();
  };
}
